package com.paypal.base;

import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.security.InvalidKeyException;
import java.security.KeyStore;
import java.security.KeyStoreException;
import java.security.NoSuchAlgorithmException;
import java.security.NoSuchProviderException;
import java.security.Signature;
import java.security.SignatureException;
import java.security.UnrecoverableKeyException;
import java.security.cert.CertificateException;
import java.security.cert.CertificateFactory;
import java.security.cert.X509Certificate;
import java.util.Arrays;
import java.util.Collection;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.zip.CRC32;
import java.util.zip.Checksum;

import javax.net.ssl.KeyManager;
import javax.net.ssl.KeyManagerFactory;
import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManager;
import javax.net.ssl.TrustManagerFactory;
import javax.net.ssl.X509TrustManager;

import com.paypal.base.codec.binary.Base64;
import com.paypal.base.exception.SSLConfigurationException;
import com.paypal.base.rest.PayPalRESTException;

/**
 * Class SSLUtil
 *
 */
public abstract class SSLUtil {

	/**
	 * KeyManagerFactory used for {@link SSLContext} {@link KeyManager}
	 */
	private static final KeyManagerFactory KMF;

	/**
	 * Private {@link Map} used for caching {@link KeyStore}s
	 */
	private static final Map<String, KeyStore> STOREMAP;

	/**
	 * Map used for dynamic configuration
	 */
	private static final Map<String, String> CONFIG_MAP;

	static {
		try {

			// Initialize KeyManagerFactory and local KeyStore cache
			KMF = KeyManagerFactory.getInstance(KeyManagerFactory.getDefaultAlgorithm());
			STOREMAP = new HashMap<String, KeyStore>();
			CONFIG_MAP = SDKUtil.combineDefaultMap(ConfigManager
					.getInstance().getConfigurationMap());
		} catch (NoSuchAlgorithmException e) {
			throw new ExceptionInInitializerError(e);
		}
	}

	/**
	 * Returns a SSLContext
	 * 
	 * @param keymanagers
	 *            KeyManager[] The key managers
	 * @return SSLContext with proper client certificate
	 * @throws SSLConfigurationException
	 */
	public static SSLContext getSSLContext(KeyManager[] keymanagers)
			throws SSLConfigurationException {
		try {
			SSLContext ctx = SSLContext.getInstance(CONFIG_MAP.get(Constants.SSLUTIL_PROTOCOL)); // TLS, SSLv3, SSL
			ctx.init(keymanagers, null, null);
			return ctx;
		} catch (Exception e) {
			throw new SSLConfigurationException(e.getMessage(), e);
		}
	}

	/**
	 * Retrieves keyStore from the cached {@link Map}, if not present loads
	 * certificate into java keyStore and caches it for further references
	 * 
	 * @param p12Path
	 *            Path to the client certificate
	 * @param password
	 *            {@link KeyStore} password
	 * @return keyStore {@link KeyStore} loaded with the certificate
	 * @throws NoSuchProviderException
	 * @throws KeyStoreException
	 * @throws CertificateException
	 * @throws NoSuchAlgorithmException
	 * @throws FileNotFoundException
	 * @throws IOException
	 */
	private static KeyStore p12ToKeyStore(String p12Path, String password)
			throws NoSuchProviderException, KeyStoreException,
			CertificateException, NoSuchAlgorithmException, IOException {
		KeyStore keyStore = STOREMAP.get(p12Path);
		if (keyStore == null) {
			keyStore = KeyStore.getInstance("PKCS12", CONFIG_MAP.get(Constants.SSLUTIL_JRE));
			FileInputStream in = null;
			try {
				in = new FileInputStream(p12Path);
				keyStore.load(in, password.toCharArray());
				STOREMAP.put(p12Path, keyStore);
			} finally {
				if (in != null) {
					in.close();
				}
			}
		}
		return keyStore;
	}

	/**
	 * Create a SSLContext with provided client certificate
	 * 
	 * @param certPath
	 * @param certPassword
	 * @return SSLContext
	 * @throws SSLConfigurationException
	 */
	public static SSLContext setupClientSSL(String certPath, String certPassword)
			throws SSLConfigurationException {
		SSLContext sslContext = null;
		try {
			KeyStore ks = p12ToKeyStore(certPath, certPassword);
			KMF.init(ks, certPassword.toCharArray());
			sslContext = getSSLContext(KMF.getKeyManagers());
		} catch (NoSuchAlgorithmException e) {
			throw new SSLConfigurationException(e.getMessage(), e);
		} catch (KeyStoreException e) {
			throw new SSLConfigurationException(e.getMessage(), e);
		} catch (UnrecoverableKeyException e) {
			throw new SSLConfigurationException(e.getMessage(), e);
		} catch (CertificateException e) {
			throw new SSLConfigurationException(e.getMessage(), e);
		} catch (NoSuchProviderException e) {
			throw new SSLConfigurationException(e.getMessage(), e);
		} catch (IOException e) {
			throw new SSLConfigurationException(e.getMessage(), e);
		}
		return sslContext;
	}

	/**
	 * Performs Certificate Chain Validation on provided certificates. The method verifies if the client certificates provided are generated from root certificates
	 * trusted by application.
	 * 
	 * @param clientCerts Collection of X509Certificates provided in request
	 * @param trustCerts Collection of X509Certificates trusted by application
	 * @param authType Auth Type for Certificate
	 * @return true if client and server are chained together, false otherwise
	 * @throws PayPalRESTException
	 */
	public static boolean validateCertificateChain(Collection<X509Certificate> clientCerts, Collection<X509Certificate> trustCerts, String authType) throws PayPalRESTException  {
		TrustManager trustManagers[];
		X509Certificate[] clientChain;
		try {

			clientChain = clientCerts.toArray(new X509Certificate[0]);
			List<X509Certificate> list = Arrays.asList(clientChain);
			clientChain = list.toArray(new X509Certificate[0]);

			// Create a Keystore and load the Root CA Cert
			KeyStore keyStore = KeyStore.getInstance(KeyStore.getDefaultType());
			keyStore.load(null, "".toCharArray());

			// Iterate through each certificate and add to keystore
			int i = 0;
			for (Iterator<X509Certificate> payPalCertificate = trustCerts.iterator(); payPalCertificate.hasNext();) {
				X509Certificate x509Certificate = (X509Certificate) payPalCertificate.next();
				keyStore.setCertificateEntry("paypalCert" + i, x509Certificate);
				i++;
			}

			// Create TrustManager
			TrustManagerFactory trustManagerFactory = TrustManagerFactory.getInstance(TrustManagerFactory.getDefaultAlgorithm());
			trustManagerFactory.init(keyStore);
			trustManagers = trustManagerFactory.getTrustManagers();

		} catch (Exception ex) {
			throw new PayPalRESTException(ex);
		}

		// For Each TrustManager of type X509
		for(TrustManager trustManager : trustManagers) {
			if(trustManager instanceof X509TrustManager) {
				X509TrustManager pkixTrustManager = (X509TrustManager) trustManager;
				// Check the trust manager if server is trusted
				try {
					pkixTrustManager.checkClientTrusted(clientChain, (authType == null || authType == "") ? "RSA" : authType);
					// Checks that the certificate is currently valid. It is if the current date and time are within the validity period given in the certificate.
					for (X509Certificate cert : clientChain) {
						cert.checkValidity();
						// Check for CN name matching
						String dn = cert.getSubjectX500Principal().getName();
						if (!dn.contains("CN=messageverificationcerts")) {
							throw new PayPalRESTException("CN of client certificate does not match with trusted CN");
						}
					}
					// If everything looks good, return true
					return true;
				} catch (CertificateException e) {
					throw new PayPalRESTException(e);
				}
			}
		}


		return false;

	}

	/**
	 * Downloads Certificate from URL
	 * 
	 * @param urlPath
	 * @return InputStream containing certificate data
	 * @throws PayPalRESTException
	 */
	public static InputStream downloadCertificateFromPath(String urlPath) throws PayPalRESTException {
		if (urlPath == null || urlPath.trim() == "") {
			throw new PayPalRESTException("Certificate Path cannot be empty");
		}
		try {
			Map<String, String> headerMap = new HashMap<String, String>();
			HttpConfiguration httpConfiguration = new HttpConfiguration();
			httpConfiguration.setEndPointUrl(urlPath);
			httpConfiguration.setConnectionTimeout(Integer
					.parseInt(ConfigManager.getInstance().getConfigurationMap()
							.get(Constants.HTTP_CONNECTION_TIMEOUT)));
			httpConfiguration.setMaxRetry(Integer.parseInt(ConfigManager.getInstance().getConfigurationMap()
					.get(Constants.HTTP_CONNECTION_RETRY)));
			httpConfiguration.setReadTimeout(Integer.parseInt(ConfigManager.getInstance().getConfigurationMap()
					.get(Constants.HTTP_CONNECTION_READ_TIMEOUT)));
			httpConfiguration.setMaxHttpConnection(Integer
					.parseInt(ConfigManager.getInstance().getConfigurationMap()
							.get(Constants.HTTP_CONNECTION_MAX_CONNECTION)));
			httpConfiguration.setHttpMethod("GET");
			URL url = null;
			HttpConnection connection = ConnectionManager.getInstance()
					.getConnection();
			connection.createAndconfigureHttpConnection(httpConfiguration);
			url = new URL(urlPath);
			headerMap.put("Host", url.getHost());
			InputStream stream =  connection.executeWithStream(url.toString(), "", headerMap);
			return stream;
		} catch (Exception ex) {
			throw new PayPalRESTException(ex);
		}
	}

	/**
	 * Generate Collection of Certificate from Input Stream
	 * 
	 * @param stream InputStream of Certificate data
	 * @return Collection<X509Certificate>
	 * @throws PayPalRESTException
	 */
	@SuppressWarnings("unchecked")
	public static Collection<X509Certificate> getCertificateFromStream(InputStream stream) throws PayPalRESTException {
		if (stream == null) { throw new PayPalRESTException("Certificate Not Found"); }
		Collection<X509Certificate> certs = null;
		try {
			// Create a Certificate Factory
			CertificateFactory cf = CertificateFactory.getInstance("X.509");

			// Read the Trust Certs
			certs = (Collection<X509Certificate>) cf.generateCertificates(stream);
		} catch (CertificateException ex) {
			throw new PayPalRESTException(ex);
		}
		return certs;
	}

	/**
	 * Generates a CRC 32 Value of String passed
	 * 
	 * @param data
	 * @return long crc32 value of input. -1 if string is null
	 */
	public static long crc32(String data) {
		if (data == null) { 
			return -1;
		}

		// get bytes from string
		byte bytes[] = data.getBytes();
		Checksum checksum = new CRC32();
		// update the current checksum with the specified array of bytes
		checksum.update(bytes, 0, bytes.length);
		// get the current checksum value
		return checksum.getValue();
	}

	/**
	 * Validates Webhook Signature validation based on https://developer.paypal.com/docs/integration/direct/rest-webhooks-overview/#event-signature
	 * Returns true if signature is valid
	 * 
	 * @param clientCerts Client Certificates
	 * @param algo Algorithm used for signature creation by server
	 * @param actualSignatureEncoded  Paypal-Transmission-Sig header value passed by server
	 * @param expectedSignature Signature generated by formatting data with CRC32 value of request body
	 * @param requestBody Request body from server
	 * @param webhookId Id for PayPal Webhook created for receiving the data
	 * @return true if signature is valid, false otherwise
	 * 
	 * @throws NoSuchAlgorithmException
	 * @throws SignatureException
	 * @throws InvalidKeyException
	 */
	public static Boolean validateData(Collection<X509Certificate> clientCerts, String algo,
			String actualSignatureEncoded, String expectedSignature, String requestBody, String webhookId) throws NoSuchAlgorithmException, SignatureException, InvalidKeyException {
		// Get the signatureAlgorithm from the PAYPAL-AUTH-ALGO HTTP header
		Signature signatureAlgorithm = Signature.getInstance(algo);
		// Get the certData from the URL provided in the HTTP headers and cache it
		X509Certificate[] clientChain = clientCerts.toArray(new X509Certificate[0]);
		signatureAlgorithm.initVerify(clientChain[0].getPublicKey());
		signatureAlgorithm.update(expectedSignature.getBytes());
		// Actual signature is base 64 encoded and available in the HTTP headers
		byte[] actualSignature = Base64.decodeBase64(actualSignatureEncoded.getBytes());
		boolean isValid = signatureAlgorithm.verify(actualSignature);
		return isValid;
	}
}
