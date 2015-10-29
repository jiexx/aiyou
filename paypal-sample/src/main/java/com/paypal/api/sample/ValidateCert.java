package com.paypal.api.sample;

import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.security.SignatureException;
import java.util.HashMap;
import java.util.Map;

import com.paypal.api.payments.Event;
import com.paypal.base.Constants;
import com.paypal.base.rest.APIContext;
import com.paypal.base.rest.PayPalRESTException;

public class ValidateCert {

	public static void main(String[] args) throws InvalidKeyException, NoSuchAlgorithmException, SignatureException {
		Map<String, String> headers = new HashMap<String, String>();
		APIContext apiContext = new APIContext();
		Map<String, String> configs = new HashMap<String, String>();
		configs.put(Constants.PAYPAL_TRUST_CERT_URL, "DigiCertSHA2ExtendedValidationServerCA.crt");
		configs.put(Constants.PAYPAL_WEBHOOK_ID, "3RN13029J36659323");
		apiContext.setConfigurationMap(configs);
		//headers.put(Constants.PAYPAL_CERT_URL_HEADER, "https://api.paypal.com/v1/notifications/certs/CERT-360caa42-fca2a594-df8cd2d5");
		headers.put(Constants.PAYPAL_HEADER_CERT_URL.toUpperCase(), "https://api.sandbox.paypal.com/v1/notifications/certs/CERT-360caa42-fca2a594-a5cafa77");
		headers.put(Constants.PAYPAL_HEADER_TRANSMISSION_ID, "b2384410-f8d2-11e4-8bf3-77339302725b");
		headers.put(Constants.PAYPAL_HEADER_TRANSMISSION_TIME, "2015-05-12T18:14:14Z");
		headers.put(Constants.PAYPAL_HEADER_AUTH_ALGO, "SHA256withRSA");
		headers.put(Constants.PAYPAL_HEADER_TRANSMISSION_SIG, "vSOIQFIZQHv8G2vpbOpD/4fSC4/MYhdHyv+AmgJyeJQq6q5avWyHIe/zL6qO5hle192HSqKbYveLoFXGJun2od2zXN3Q45VBXwdX3woXYGaNq532flAtiYin+tQ/0pNwRDsVIufCxa3a8HskaXy+YEfXNnwCSL287esD3HgOHmuAs0mYKQdbR4e8Evk8XOOQaZzGeV7GNXXz19gzzvyHbsbHmDz5VoRl9so5OoHqvnc5RtgjZfG8KA9lXh2MTPSbtdTLQb9ikKYnOGM+FasFMxk5stJisgmxaefpO9Q1qm3rCjaJ29aAOyDNr3Q7WkeN3w4bSXtFMwyRBOF28pJg9g==");
		String requestBody = "{\"id\":\"WH-2W7266712B616591M-36507203HX6402335\",\"create_time\":\"2015-05-12T18:14:14Z\",\"resource_type\":\"sale\",\"event_type\":\"PAYMENT.SALE.COMPLETED\",\"summary\":\"Payment completed for $ 20.0 USD\",\"resource\":{\"id\":\"7DW85331GX749735N\",\"create_time\":\"2015-05-12T18:13:18Z\",\"update_time\":\"2015-05-12T18:13:36Z\",\"amount\":{\"total\":\"20.00\",\"currency\":\"USD\"},\"payment_mode\":\"INSTANT_TRANSFER\",\"state\":\"completed\",\"protection_eligibility\":\"ELIGIBLE\",\"protection_eligibility_type\":\"ITEM_NOT_RECEIVED_ELIGIBLE,UNAUTHORIZED_PAYMENT_ELIGIBLE\",\"parent_payment\":\"PAY-1A142943SV880364LKVJEFPQ\",\"transaction_fee\":{\"value\":\"0.88\",\"currency\":\"USD\"},\"links\":[{\"href\":\"https://api.sandbox.paypal.com/v1/payments/sale/7DW85331GX749735N\",\"rel\":\"self\",\"method\":\"GET\"},{\"href\":\"https://api.sandbox.paypal.com/v1/payments/sale/7DW85331GX749735N/refund\",\"rel\":\"refund\",\"method\":\"POST\"},{\"href\":\"https://api.sandbox.paypal.com/v1/payments/payment/PAY-1A142943SV880364LKVJEFPQ\",\"rel\":\"parent_payment\",\"method\":\"GET\"}]},\"links\":[{\"href\":\"https://api.sandbox.paypal.com/v1/notifications/webhooks-events/WH-2W7266712B616591M-36507203HX6402335\",\"rel\":\"self\",\"method\":\"GET\"},{\"href\":\"https://api.sandbox.paypal.com/v1/notifications/webhooks-events/WH-2W7266712B616591M-36507203HX6402335/resend\",\"rel\":\"resend\",\"method\":\"POST\"}]}";
		
		try {
			System.out.println(Event.validateReceivedEvent(apiContext, headers, requestBody));
		} catch (PayPalRESTException e) {
			e.printStackTrace();
		}
	}

}
