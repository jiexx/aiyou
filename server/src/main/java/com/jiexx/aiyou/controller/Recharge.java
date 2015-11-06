package com.jiexx.aiyou.controller;

import java.io.IOException;
import java.io.InputStream;
import java.security.KeyPair;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import javax.crypto.SecretKey;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Controller;
import org.springframework.util.DigestUtils;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.jiexx.aiyou.comm.BiLinkedHashMap;
import com.jiexx.aiyou.comm.Util;
import com.jiexx.aiyou.model.UserCredit;
import com.jiexx.aiyou.resp.CreditInfo;
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
import com.paypal.base.ConfigManager;
import com.paypal.base.Constants;
import com.paypal.base.rest.APIContext;
import com.paypal.base.rest.OAuthTokenCredential;
import com.paypal.base.rest.PayPalRESTException;
import com.paypal.base.rest.PayPalResource;
import com.paypal.base.util.ResourceLoader;

@Controller
@RequestMapping("/charge")
public class Recharge extends DataService{

	public Payment createPayment(Credit credit) {
		// ###Address 
		// Base Address object used as shipping or billing
		// address in a payment. [Optional]

		// ###CreditCard
		// A resource representing a credit card that can be
		// used to fund a payment.
		CreditCard creditCard = new CreditCard();
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
		transaction.setDescription("This is the payment transaction description.");

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
			if( oatc == null ) {
				Resource resource = new ClassPathResource("conf/sdk_config.properties");
				InputStream resourceInputStream = resource.getInputStream();
				oatc = PayPalResource.initConfig(resourceInputStream);
			}
			
			
			String accessToken = oatc.getAccessToken();

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
		} catch ( IOException e1 ) {
			e1.printStackTrace();
		}
		return createdPayment;
		
	}
	class Credit {
		String number;
		String expire;
		int ccv2;
		String name;
		int type;
		int value;
	}
	class Tran {
		boolean hasRecord;
		KeyPair kp;
		UserCredit uc;
		Tran(UserCredit uc, KeyPair kp) {
			this.hasRecord = uc == null ? false : true;
			this.kp = kp;
			this.uc = uc;
		}
	}
	private OAuthTokenCredential oatc = null;
	private BiLinkedHashMap<Long, Tran> lci = new BiLinkedHashMap<Long, Tran>();
	
	@RequestMapping(value = "key.do", params = { "id" }, method = RequestMethod.GET)
	@ResponseBody
	public synchronized String key(@RequestParam(value = "id") long id) {
		UserCredit uc = DATA.queryCreditCard(id);
		CreditInfo ci = new CreditInfo(uc);
		try {
			KeyPair kp = Util.rsa_key_pairs();
			
			ci.pwd = Util.rsa_key_pub(kp);
			
			if(lci.containsKey(id)) {
				lci.remove(id);
			}
			lci.put(id, new Tran(uc, kp));
			
			ci.success();
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
		return ci.toResp();
	}
	
	@RequestMapping(value = "fill.do", params = { "id", "str" }, method = RequestMethod.GET)
	@ResponseBody
	public synchronized String fill(@RequestParam(value = "id") long id, @RequestParam(value = "str") String str) {
		Response resp = new Response();
		lci.refresh(180000);
		if( lci.get(id) != null ) {
			Tran tran = lci.get(id).value;
			if( tran != null ) {
				try {
					String decrypt = Util.rsa_decrypt(str, tran.kp);
					Credit credit = Util.fromJson(decrypt, Credit.class);
					if( !tran.hasRecord ) {
						DATA.insertCreditCard(new UserCredit(id, credit.number, credit.name, credit.expire, credit.ccv2, credit.type));
					}else {
						credit.number = tran.uc.num;
						credit.type = tran.uc.type;
						credit.name = tran.uc.name;
						credit.expire = tran.uc.exp;
						credit.ccv2 = tran.uc.ccv;
					}
					Payment pay = createPayment(credit);
					if( pay.getState().equals("approved") )
						resp.success();
				} catch (Exception e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
					resp.code = e.getCause().getMessage();
				}
			}
		}else {
			resp.timeout();
		}
		
		return resp.toResp();
	}

}
