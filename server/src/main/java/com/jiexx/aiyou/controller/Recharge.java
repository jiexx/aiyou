package com.jiexx.aiyou.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import javax.crypto.SecretKey;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.stereotype.Controller;
import org.springframework.util.DigestUtils;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.jiexx.aiyou.comm.Util;
import com.jiexx.aiyou.resp.AES;
import com.jiexx.aiyou.resp.Response;
import com.jiexx.aiyou.service.DataService;
import com.paypal.api.payments.Address;
import com.paypal.api.payments.Amount;
import com.paypal.api.payments.CreditCard;
import com.paypal.api.payments.Details;
import com.paypal.api.payments.FundingInstrument;
import com.paypal.api.payments.Payer;
import com.paypal.api.payments.Payment;
import com.paypal.api.payments.Transaction;
import com.paypal.base.rest.APIContext;
import com.paypal.base.rest.OAuthTokenCredential;
import com.paypal.base.rest.PayPalRESTException;

@Controller
@RequestMapping("/charge")
public class Recharge extends DataService{
	private final static String clientID = "AYMgKNfS7LqMp-2nlu8FywhPuRH0csW-jLHYAkY4kQkLFOoC8MTNwP0HD-P_7y8wS8n9MO9_R87PKTZx";
	private final static String clientSecret = "EH2NN3tQ9nxFK3XaVj3rvR_39m46m6SkfvXOtcAej6EgvRa87D9NQ6Ib-4EW4xWP_WGG0Lf89Xm-6g1b";

	public Payment createPayment(Credit credit) {
		// ###Address 
		// Base Address object used as shipping or billing
		// address in a payment. [Optional]
		Address billingAddress = new Address();
		billingAddress.setCity("Johnstown");
		billingAddress.setCountryCode("US");
		billingAddress.setLine1("52 N Main ST");
		billingAddress.setPostalCode("43210");
		billingAddress.setState("OH");

		// ###CreditCard
		// A resource representing a credit card that can be
		// used to fund a payment.
		CreditCard creditCard = new CreditCard();
		creditCard.setBillingAddress(billingAddress);
		creditCard.setCvv2(111);
		creditCard.setExpireMonth(11);
		creditCard.setExpireYear(2018);
		creditCard.setFirstName("Joe");
		creditCard.setLastName("Shopper");
		creditCard.setNumber("5500005555555559");
		creditCard.setType("mastercard");

		// ###Details
		// Let's you specify details of a payment amount.
		Details details = new Details();
		details.setShipping("1");
		details.setSubtotal("5");
		details.setTax("1");

		// ###Amount
		// Let's you specify a payment amount.
		Amount amount = new Amount();
		amount.setCurrency("USD");
		// Total must be equal to sum of shipping, tax and subtotal.
		amount.setTotal("7");
		amount.setDetails(details);

		// ###Transaction
		// A transaction defines the contract of a
		// payment - what is the payment for and who
		// is fulfilling it. Transaction is created with
		// a `Payee` and `Amount` types
		Transaction transaction = new Transaction();
		transaction.setAmount(amount);
		transaction
				.setDescription("This is the payment transaction description.");

		// The Payment creation API requires a list of
		// Transaction; add the created `Transaction`
		// to a List
		List<Transaction> transactions = new ArrayList<Transaction>();
		transactions.add(transaction);

		// ###FundingInstrument
		// A resource representing a Payeer's funding instrument.
		// Use a Payer ID (A unique identifier of the payer generated
		// and provided by the facilitator. This is required when
		// creating or using a tokenized funding instrument)
		// and the `CreditCardDetails`
		FundingInstrument fundingInstrument = new FundingInstrument();
		fundingInstrument.setCreditCard(creditCard);

		// The Payment creation API requires a list of
		// FundingInstrument; add the created `FundingInstrument`
		// to a List
		List<FundingInstrument> fundingInstrumentList = new ArrayList<FundingInstrument>();
		fundingInstrumentList.add(fundingInstrument);

		// ###Payer
		// A resource representing a Payer that funds a payment
		// Use the List of `FundingInstrument` and the Payment Method
		// as 'credit_card'
		Payer payer = new Payer();
		payer.setFundingInstruments(fundingInstrumentList);
		payer.setPaymentMethod("credit_card");

		// ###Payment
		// A Payment Resource; create one using
		// the above types and intent as 'sale'
		Payment payment = new Payment();
		payment.setIntent("sale");
		payment.setPayer(payer);
		payment.setTransactions(transactions);
		Payment createdPayment = null;
		try {
			// ###AccessToken
			// Retrieve the access token from
			// OAuthTokenCredential by passing in
			// ClientID and ClientSecret
			// It is not mandatory to generate Access Token on a per call basis.
			// Typically the access token can be generated once and
			// reused within the expiry window

			String accessToken = new OAuthTokenCredential(clientID, clientSecret).getAccessToken();

			// ### Api Context
			// Pass in a `ApiContext` object to authenticate
			// the call and to send a unique request id
			// (that ensures idempotency). The SDK generates
			// a request id if you do not pass one explicitly.
			APIContext apiContext = new APIContext(accessToken);
			// Use this variant if you want to pass in a request id
			// that is meaningful in your application, ideally
			// a order id.
			/*
			 * String requestId = Long.toString(System.nanoTime(); APIContext
			 * apiContext = new APIContext(accessToken, requestId ));
			 */

			// Create a payment by posting to the APIService
			// using a valid AccessToken
			// The return object contains the status;
			createdPayment = payment.create(apiContext);
			
			Util.log("", "Payment with Credit Card Request :"+Payment.getLastRequest());
			Util.log("", "Payment with Credit Card Response :"+Payment.getLastResponse());
		} catch (PayPalRESTException e) {
			Util.log("", "Error Payment with Credit Card Request :"+Payment.getLastRequest());
		}
		return createdPayment;
		
	}
	private class Credit {
		String number;
		String validDate;
		String ccv2;
		int value;
	}
	private HashMap<Long, String> idPwds = new HashMap<Long, String>();
	
	@RequestMapping(value = "key.do", params = { "id" }, method = RequestMethod.GET)
	@ResponseBody
	public String key(@RequestParam(value = "id") long id) {
		AES aes = new AES();
		aes.pwd = DigestUtils.md5DigestAsHex(String.valueOf("jiexx"+System.currentTimeMillis()).getBytes()).substring(8, 24);
		
		if(idPwds.containsKey(id)) {
			idPwds.remove(id);
		}
		idPwds.put(id, aes.pwd);
		
		return aes.toResp();
	}
	
	@RequestMapping(value = "fill.do", params = { "id", "str" }, method = RequestMethod.GET)
	@ResponseBody
	public synchronized String fill(@RequestParam(value = "id") long id, @RequestParam(value = "str") String str) {
		Response resp = new Response();
		SecretKey key = Util.deriveKey(idPwds.get(id), idPwds.get(id).length()*8);
		String decrypt = Util.aes_decrypt(key, str);
		Credit credit = Util.fromJson(decrypt, Credit.class);
		Payment pay = createPayment(credit);
		return resp.toResp();
	}

}
