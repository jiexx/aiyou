package com.jiexx.aiyou.comm;

import java.io.BufferedInputStream;
import java.io.IOException;
import java.math.BigInteger;
import java.nio.ByteBuffer;
import java.nio.CharBuffer;
import java.nio.charset.CharacterCodingException;
import java.nio.charset.CharsetEncoder;
import java.nio.charset.CodingErrorAction;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.InvalidAlgorithmParameterException;
import java.security.InvalidKeyException;
import java.security.KeyFactory;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.security.spec.InvalidKeySpecException;
import java.security.spec.KeySpec;
import java.security.spec.RSAPublicKeySpec;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.LinkedList;

import javax.crypto.BadPaddingException;
import javax.crypto.Cipher;
import javax.crypto.IllegalBlockSizeException;
import javax.crypto.KeyGenerator;
import javax.crypto.NoSuchPaddingException;
import javax.crypto.SecretKey;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.DESKeySpec;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.PBEKeySpec;
import javax.crypto.spec.SecretKeySpec;
import javax.xml.bind.DatatypeConverter;

import org.springframework.util.Base64Utils;

import com.google.gson.Gson;
import com.jiexx.aiyou.model.User;
import com.jiexx.aiyou.model.UserCredit;
import com.jiexx.aiyou.resp.Response;
import com.mysql.jdbc.Blob;

public class Util {
	protected static Gson gson = new Gson();
	public static String toJsonp(Response resp) {
		return "angular.callbacks._0("+gson.toJson(resp)+")";
	}
	public static String toJson(Response resp) {
		return gson.toJson(resp);
	}
	public static String toJson(UserCredit clazz) {
		return gson.toJson(clazz);
	}
	public static <T> T fromJson(String json, Class<T> clazz) {
		return gson.fromJson(json, clazz);
	}
	public static class Grid {
		private static final float cellx = 0.001f;
		private static final float celly = 0.001f;
		private static final int level = 2;
		private int[][] delta;
		private float originX;
		private float originY;
		private HashMap<Long, User> cells = new HashMap<Long, User>();
		private final int[][][] coord = {{{1,0},{0,1}}, {{0,-1},{1,0}}, {{-1,0},{0,-1}}, {{0,1},{-1,0}}};
		public Grid() {
			int perimeter  = 4 * ( level + 1 ) * level;
			delta = new int[perimeter][2];
			int pos = 0;
			for(int i = 1 ; i <= level ; i ++) {
				int distance = i ;
				for(int c = 0 ; c < 4 ; c ++ ) {
					for(int e = -distance ; e < distance ; e ++) {
						delta[pos][0] = coord[c][0][0] * e +coord[c][0][1] * distance;
						delta[pos][1] = coord[c][1][0] * e +coord[c][1][1] * distance;
						pos ++;
					}
				}
			}
			System.out.println("step===>"+gson.toJson(delta));
		}
		public void setOrigin(User user) {
			originX = user.x;
			originY = user.y;
			cells.clear();
		}
		public int getPosX(User user) {
			return (int) Math.floor((user.x - originX) / cellx);
		}
		public int getPosY(User user) {
			return (int) Math.floor((user.y - originY) / celly);
		}
		public User get(long i, long j) {
			return cells.get(i<<32 | j);
		}
		public void change(User user) {
			int x = getPosX(user);
			int y = getPosY(user);
			long X = x;
			long Y = y;
			if(get(x, y) == null) {
				cells.put(X<<32 | Y, user);
			}else {
				int i = 0;
				while(get(x+delta[i][0], y+delta[i][1]) != null && i++ < delta.length) ;
				if(i < delta.length) {
					X += delta[i][0];
					Y += delta[i][1];
					user.x = user.x + delta[i][0] * cellx;
					user.y = user.y + delta[i][1] * celly;
					cells.put(X<<32 | Y, user);
				}else {
					Util.log(" "+user.id, "Density of user is too big, grid level is not enough to change coordination");
				}
			}
		}
	}
	public static Grid grid = new Grid();
	public static String decrypt(String encryptedData, String key) {
		String ret = null;
		byte[] keyByte = getByteArray(key);
		byte[] byteData = getByteArray(encryptedData.toLowerCase());
		try {
			ret = new String(decrypt(byteData, keyByte));
		} catch (Exception e) {
			e.printStackTrace();
		}

		return ret;
	}

	public static byte[] encrypt(byte[] data, byte[] keyBytes) throws Exception {
		DESKeySpec dks = new DESKeySpec(keyBytes);
		SecretKeyFactory keyFactory = SecretKeyFactory.getInstance("DES");
		SecretKey key = keyFactory.generateSecret(dks);
		SecureRandom sr = new SecureRandom();
		Cipher cipher = Cipher.getInstance("DES");
		cipher.init(Cipher.ENCRYPT_MODE, key, sr);
		byte[] encryptedData = cipher.doFinal(data);
		return encryptedData;
	}

	public static byte[] decrypt(byte[] data, byte[] keyBytes) throws Exception {
		DESKeySpec dks = new DESKeySpec(keyBytes);
		SecretKeyFactory keyFactory = SecretKeyFactory.getInstance("DES");
		SecretKey key = keyFactory.generateSecret(dks);
		SecureRandom sr = new SecureRandom();
		Cipher cipher = Cipher.getInstance("DES");
		cipher.init(Cipher.DECRYPT_MODE, key, sr);
		byte[] decryptedData = cipher.doFinal(data);
		return decryptedData;
	}

	public static byte[] getKey() throws Exception {
		SecureRandom sr = new SecureRandom();
		KeyGenerator kg = KeyGenerator.getInstance("DES");
		kg.init(56);
		kg.init(sr);
		SecretKey key = kg.generateKey();
		byte[] b = key.getEncoded();
		return b;
	}

	public static String getHexString(byte[] b) {
		StringBuffer result = new StringBuffer();
		for (int i = 0; i < b.length; i++) {
			String hex = Integer.toHexString(b[i] & 0xFF);
			if (hex.length() == 1) {
				hex = '0' + hex;
			}
			result.append(hex.toLowerCase());
		}
		return result.toString();
	}

	public static byte[] getByteArray(String hex) {
		int len = (hex.length() / 2);
		byte[] result = new byte[len];
		char[] achar = hex.toCharArray();
		for (int i = 0; i < len; i++) {
			int pos = i * 2;
			result[i] = (byte) (toByte(achar[pos]) << 4 | toByte(achar[pos + 1]));
		}
		return result;
	}

	private static int toByte(char c) {
		byte b = (byte) "0123456789abcdef".indexOf(c);
		return b;
	}

	public static byte[] blobToBytes(Blob blob) {

		BufferedInputStream is = null;

		try {
			is = new BufferedInputStream(blob.getBinaryStream());
			byte[] bytes = new byte[(int) blob.length()];
			int len = bytes.length;
			int offset = 0;
			int read = 0;

			while (offset < len && (read = is.read(bytes, offset, len - offset)) >= 0) {
				offset += read;
			}
			return bytes;
		} catch (Exception e) {
			return null;
		} finally {
			try {
				is.close();
				is = null;
			} catch (IOException e) {
				return null;
			}
		}
	}

	public static String blobToBase64(Blob b) {
		try {
			return  DatatypeConverter.printBase64Binary(b.getBytes(1, (int) b.length()));
			//return Base64Utils.encodeToString(b.getBytes(1, (int) b.length()));
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return null;
	}

	public static byte[] base64ToBytes(String b64) {
		return DatatypeConverter.parseBase64Binary(b64);
		//return Base64Utils.decodeFromString(b64);
	}

	public static void quickSort(byte[] list, int low, int high) {
		//System.out.println("quickSort   "+Arrays.toString(list)+" high "+high+" low "+low);
		int i = low, j = high;
		byte tmp;
		int pivot = list[low + (high-low)/2];
		while (i <= j) {
			while (list[i] < pivot) {
				i++;
			}
			while (list[j] > pivot) {
				j--;
			}
			if (i <= j) {
				tmp = list[j];
				list[j] = list[i];
				list[i] = tmp;
				i++;
				j--;
			}
		}
		if (low < i-1)
			quickSort(list, low, i-1);
		if (i < high)
			quickSort(list, i, high);
	}
	public static int findBytes(LinkedList<Byte> arr, byte value) {
		int i = 0;
		while( i < arr.size() && arr.get(i) != value  ) i++;
		if( i < arr.size() )
			return i;
		return -1;
	}
	public static void insert(LinkedList<Byte> arr, byte value) {
		int i = 0;
		while( arr.get(i) < value && i < arr.size() ) i++;
		arr.add(i, value);
	}
	public static class Disc {
		public byte disc1;
		public byte disc2;
		public byte disc3;
		Disc(int i, int j, int k){
			disc1 = (byte) i; disc2 = (byte) j; disc3 = (byte) k;
		}
	}
	public static Disc parseDisc(int opt) {
		return new Disc(((byte)opt&0x00ff0000>>16), ((byte)opt&0x0000ff00>>8), ((byte)opt&0x000000ff));
	}
	
	public static void log(String user, String str) {
		StackTraceElement traceElement = ((new Exception()).getStackTrace())[1]; 
		Date now = new Date(); 
		SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss.SSS"); 
		System.out.println(sdf.format(now)+"   ["+user+"]   "+traceElement.getMethodName());
		System.out.println("                                           "+str+"\n");
	}
	
	public static SecretKey generateKeyFromPassword(String password, byte[] saltBytes) throws GeneralSecurityException {

	    KeySpec keySpec = new PBEKeySpec(password.toCharArray(), saltBytes, 100, 128);
	    SecretKeyFactory keyFactory = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA1");
	    SecretKey secretKey = keyFactory.generateSecret(keySpec);

	    return new SecretKeySpec(secretKey.getEncoded(), "AES");
	}
	
	private static String aes_encrypt(String data, String key) throws NoSuchAlgorithmException, NoSuchPaddingException, InvalidKeyException, IllegalBlockSizeException, BadPaddingException{
	    SecretKeySpec skeySpec = new SecretKeySpec(key.getBytes(), "AES");
	    Cipher cipher = Cipher.getInstance("AES/CTR/NoPadding");

	    cipher.init(Cipher.ENCRYPT_MODE, skeySpec);

	    return  Base64Utils.encodeToString(cipher.doFinal(data.getBytes()));
	}
	//By default Java supports only 128-bit encryption, So cryptKey cannot exceed 16 characters.
	public static String aes_decrypt(String data, String key) throws IllegalBlockSizeException, BadPaddingException, InvalidKeyException, NoSuchAlgorithmException, NoSuchPaddingException, InvalidAlgorithmParameterException {
	    byte[] hex = base64ToBytes(data);
	    byte[] nounce = {0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0};
	    System.arraycopy(hex, 0, nounce, 0, 8);
		SecretKeySpec skeySpec = new SecretKeySpec(key.getBytes(), "AES");
	    Cipher cipher = Cipher.getInstance("AES/CTR/NoPadding");
	    IvParameterSpec iv = new IvParameterSpec(nounce);

	    cipher.init(Cipher.DECRYPT_MODE, skeySpec, iv);

	    byte[] original = cipher.doFinal(hex);
	    return new String(original).trim();
	}
	

    // that should not be a singleton lazybones, it may contain state
    private static final CharsetEncoder ASCII_ENCODER = StandardCharsets.UTF_8.newEncoder().onMalformedInput(CodingErrorAction.REPORT).onUnmappableCharacter(CodingErrorAction.REPORT);;

    public static SecretKey deriveKey(String password, int nBits) throws CharacterCodingException, NoSuchAlgorithmException, NoSuchPaddingException, InvalidKeyException, IllegalBlockSizeException, BadPaddingException  {
    	ByteBuffer buf = null;
    	byte[] pwBytes = null;
    	SecretKey derivationKey = null;
    	byte[] partialKey = null;
    	byte[] key = null;
    	SecretKey derivatedKey = null;
    	Cipher aesECB = null;
        try {
            buf = ASCII_ENCODER.encode(CharBuffer.wrap(password));
            int nBytes = nBits / Byte.SIZE; // bits / Byte.SIZE;
            aesECB = Cipher.getInstance("AES/ECB/NoPadding");
            int n = aesECB.getBlockSize();
            pwBytes = new byte[nBytes];
            // so we only use those characters that fit in nBytes! oops!
            buf.get(pwBytes, 0, buf.remaining());
            derivationKey = new SecretKeySpec(pwBytes, "AES");
            aesECB.init(Cipher.ENCRYPT_MODE, derivationKey);
            // and although the derivationKey is nBytes in size, we only encrypt 16 (the block size)
            partialKey = aesECB.doFinal(pwBytes, 0, n);
            key = new byte[nBytes];
            System.arraycopy(partialKey, 0, key, 0, n);
            // but now we have too few so we *copy* key bytes
            // so only the increased number of rounds is configured using nBits
            System.arraycopy(partialKey, 0, key, n, nBytes - n);
            derivatedKey = new SecretKeySpec(key, "AES");
            return derivatedKey;
        } finally {
        	buf = null;
        	pwBytes = null;
        	derivationKey = null;
        	partialKey = null;
        	key = null;
        	aesECB = null;
        }
    }

    public static String aes_decrypt(SecretKey aesKey, String encodedCiphertext) throws NoSuchAlgorithmException, NoSuchPaddingException, InvalidKeyException, InvalidAlgorithmParameterException, IllegalBlockSizeException, BadPaddingException {
    	byte[] ciphertext = null;
    	Cipher aesCTR = null;
    	byte[] counter = null;
    	byte[] plaintext = null;
        try {
            // that's no base 64, that's base 64 over the UTF-8 encoding of the code points
            ciphertext = jsBase64Decode(encodedCiphertext);
            aesCTR = Cipher.getInstance("AES/CTR/NoPadding");
            int n = aesCTR.getBlockSize();
            counter = new byte[n];
            int nonceSize = n / 2;
            System.arraycopy(ciphertext, 0, counter, 0, nonceSize);
            IvParameterSpec iv = new IvParameterSpec(counter);
            aesCTR.init(Cipher.DECRYPT_MODE, aesKey, iv);
            plaintext = aesCTR.doFinal(ciphertext, nonceSize, ciphertext.length - nonceSize);
            return new String(plaintext, StandardCharsets.UTF_8);
        } finally {
        	ciphertext = null;
        	aesCTR = null;
        	counter = null;
        	plaintext = null;
        }
    }

    private static byte[] jsBase64Decode(String encodedCiphertext) {
        return base64ToBytes(encodedCiphertext);
        /*byte[] utf8CT = Base64.getDecoder().decode(encodedCiphertext);
        String cts = new String(utf8CT, StandardCharsets.UTF_8);
        byte[] ciphertext = new byte[cts.length()];
        for (int i = 0; i < cts.length(); i++) {
            ciphertext[i] = (byte) (cts.charAt(i) & 0xFF);
        }
        return ciphertext;*/
    }
    
    private static KeyPairGenerator kpg = null;
    private static KeyFactory kf = null;
    private static Cipher cipher = null;
    
    public static KeyPair rsa_key_pairs() throws NoSuchAlgorithmException {
    	if( kpg == null )
    		kpg = KeyPairGenerator.getInstance("RSA");
        kpg.initialize(1024);
        return kpg.genKeyPair();
    }
    
    public static String rsa_key_pub(KeyPair kp) throws InvalidKeySpecException, NoSuchAlgorithmException {
    	if( kf == null )
    		kf = KeyFactory.getInstance("RSA");
    	RSAPublicKeySpec pub = null;
    	try {
    		pub = new RSAPublicKeySpec(BigInteger.ZERO, BigInteger.ZERO);
	    	pub = kf.getKeySpec(kp.getPublic(), RSAPublicKeySpec.class);
	    	return pub.getModulus().toString(16);
    	}finally {
    		pub = null;
    	}
    }
    
    public static String rsa_decrypt(String encodedCiphertext, KeyPair kp) throws InvalidKeySpecException, NoSuchAlgorithmException, NoSuchPaddingException, InvalidKeyException, IllegalBlockSizeException, BadPaddingException {
    	if( cipher == null )
    		cipher = Cipher.getInstance("RSA/ECB/PKCS1Padding");
    	cipher.init(Cipher.DECRYPT_MODE, kp.getPrivate());
    	byte[] ciphertext = null;
    	byte[] plaintext = null;
    	try {
	    	ciphertext = getByteArray(encodedCiphertext);
	    	plaintext = cipher.doFinal(ciphertext);
	    	return new String(plaintext, StandardCharsets.UTF_8);
    	}finally {
    		ciphertext = null;
    		plaintext = null;
    	}
    }

}
