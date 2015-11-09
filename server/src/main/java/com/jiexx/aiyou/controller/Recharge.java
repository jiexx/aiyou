package com.jiexx.aiyou.controller;

import java.io.IOException;
import java.io.InputStream;
import java.security.InvalidKeyException;
import java.security.KeyPair;
import java.security.NoSuchAlgorithmException;
import java.security.spec.InvalidKeySpecException;
import java.util.ArrayList;
import java.util.List;
import java.util.Properties;
import java.util.Random;

import javax.crypto.BadPaddingException;
import javax.crypto.IllegalBlockSizeException;
import javax.crypto.NoSuchPaddingException;

import org.apache.log4j.PropertyConfigurator;
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
import com.jiexx.aiyou.pay.ValidationError;
import com.jiexx.aiyou.pay.WebHelper;
import com.jiexx.aiyou.resp.CreditInfo;
import com.jiexx.aiyou.resp.Response;
import com.jiexx.aiyou.service.DataService;
import com.paypal.api.payments.Address;
import com.paypal.api.payments.Amount;
import com.paypal.api.payments.CreditCard;
import com.paypal.api.payments.Currency;
import com.paypal.api.payments.Details;
import com.paypal.api.payments.FundingInstrument;
import com.paypal.api.payments.Payer;
import com.paypal.api.payments.Payment;
import com.paypal.api.payments.Payout;
import com.paypal.api.payments.PayoutBatch;
import com.paypal.api.payments.PayoutItem;
import com.paypal.api.payments.PayoutSenderBatchHeader;
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
	
	public PayoutBatch createSynchronousSinglePayout(String email, int value) throws PayPalRESTException {
		// ###Payout
		// A resource representing a payout
		Payout payout = new Payout();

		PayoutSenderBatchHeader senderBatchHeader = new PayoutSenderBatchHeader();

		// ### NOTE:
		// You can prevent duplicate batches from being processed. If you
		// specify a `sender_batch_id` that was used in the last 30 days, the
		// batch will not be processed. For items, you can specify a
		// `sender_item_id`. If the value for the `sender_item_id` is a
		// duplicate of a payout item that was processed in the last 30 days,
		// the item will not be processed.
		// #### Batch Header Instance
		Random random = new Random();
		senderBatchHeader.setSenderBatchId(
				new Double(random.nextDouble()).toString()).setEmailSubject(
				"You have a Payout!");

		// ### Currency
		Currency amount = new Currency();
		amount.setValue(String.format("%.2f",(float)value/7.0)).setCurrency("USD");

		// #### Sender Item
		// Please note that if you are using single payout with sync mode, you
		// can only pass one Item in the request
		PayoutItem senderItem = new PayoutItem();
		senderItem.setRecipientType("EMAIL")
				.setNote("Thanks for your patronage")
				.setReceiver(email/*"shirt-supplier-one@gmail.com"*/)
				.setSenderItemId("aiyou").setAmount(amount);

		List<PayoutItem> items = new ArrayList<PayoutItem>();
		items.add(senderItem);

		payout.setSenderBatchHeader(senderBatchHeader).setItems(items);

		PayoutBatch batch = null;
		try {

			// ###AccessToken
			// Retrieve the access token from
			// OAuthTokenCredential by passing in
			// ClientID and ClientSecret
			// It is not mandatory to generate Access Token on a per call basis.
			// Typically the access token can be generated once and
			// reused within the expiry window
			if( oatc == null ) {
				Properties props = new Properties();
				Resource resource = new ClassPathResource("conf/log4j.properties");
				props.load(resource.getInputStream());
				PropertyConfigurator.configure(props);
				
				/*Properties props = new Properties(); 
				props.load(new FileInputStream("log4j.properties"));
				PropertyConfigurator.configure(props);*/
				resource = new ClassPathResource("conf/sdk_config.properties");
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

			// ###Create Payout Synchronous
			batch = payout.createSynchronous(apiContext);
			
			//
			Util.log("", "Payout Batch With ID: "+batch.getBatchHeader().getPayoutBatchId());
			Util.log("", "Single Synchronous Payout with request:"+Payout.getLastRequest());
			Util.log("", "Single Synchronous Payout with response:"+Payout.getLastResponse());
		} catch ( IOException e1 ) {
			e1.printStackTrace();
		}
		return batch;
	}

	public Payment createPayment(Credit credit) throws PayPalRESTException {
		// ###Address 
		// Base Address object used as shipping or billing
		// address in a payment. [Optional]

		// ###CreditCard
		// A resource representing a credit card that can be
		// used to fund a payment.
		CreditCard creditCard = new CreditCard();
		creditCard.setCvv2(credit.ccv2);
		creditCard.setExpireMonth(Integer.parseInt(credit.expire.substring(2, 4)));
		creditCard.setExpireYear(2000+Integer.parseInt(credit.expire.substring(0, 2)));
		creditCard.setFirstName(credit.name.substring(0,1));
		creditCard.setLastName(credit.name.substring(1));
		creditCard.setNumber(credit.number);
		if( credit.type == 1 ) 
			creditCard.setType("visa") ;
		if( credit.type == 2 )
			creditCard.setType("mastercard");
		if( credit.type == 3 ) 
			creditCard.setType("unionpay");

		// ###Details
		// Let's you specify details of a payment amount.
		Details details = new Details();
		details.setShipping("1");
		details.setSubtotal("5");
		//details.setTax("1");

		// ###Amount
		// Let's you specify a payment amount.
		Amount amount = new Amount();
		amount.setCurrency("USD");
		// Total must be equal to sum of shipping, tax and subtotal.
		amount.setTotal(String.format("%.2f",(float)credit.value/7.0));
		//amount.setDetails(details);

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
				Properties props = new Properties();
				Resource resource = new ClassPathResource("conf/log4j.properties");
				props.load(resource.getInputStream());
				PropertyConfigurator.configure(props);
				
				/*Properties props = new Properties(); 
				props.load(new FileInputStream("log4j.properties"));
				PropertyConfigurator.configure(props);*/
				resource = new ClassPathResource("conf/sdk_config.properties");
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
		//long start = System.currentTimeMillis();
		UserCredit uc = DATA.queryCreditCard(id);
		//System.out.println("eclipse: "+ (System.currentTimeMillis()-start));
		CreditInfo ci = new CreditInfo(uc);
		try {
			KeyPair kp = Util.rsa_key_pairs();
			//System.out.println("eclipse: "+ (System.currentTimeMillis()-start));
			ci.pwd = Util.rsa_key_pub(kp);
			
			
			if(lci.containsKey(id)) {
				lci.remove(id);
			}
			lci.put(id, new Tran(uc, kp));
			//System.out.println("eclipse: "+ (System.currentTimeMillis()-start));
			ci.success();
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
		return ci.toResp();
	}
	
	@RequestMapping(value = "email.do", params = { "id" }, method = RequestMethod.GET)
	@ResponseBody
	public synchronized String email(@RequestParam(value = "id") long id) {
		UserCredit uc = DATA.queryCreditCard(id);
		CreditInfo ci = new CreditInfo(uc);
		if( uc != null ) {
			ci.email = uc.email;
			ci.success();
		}
		
		return ci.toResp();
	}
	
	private final static int REFUND_VALUE = 50;
	
	@RequestMapping(value = "refund.do", params = { "id", "email" }, method = RequestMethod.GET)
	@ResponseBody
	public synchronized String refund(@RequestParam(value = "id") long id, @RequestParam(value = "email") String email){
		Response resp = new Response();
		Integer balance = DATA.queryDriverBalance(id);
		if( balance != null && balance > REFUND_VALUE ) {
			try {
				PayoutBatch pb = createSynchronousSinglePayout(email, REFUND_VALUE);
				if( pb != null && pb.getItems().size() == 1 && pb.getItems().get(0).getTransactionStatus().equals("UNCLAIMED") ) {
					Integer i = DATA.updateDriverBalance(id, -REFUND_VALUE);
					if( i != null && i == 1 ) {
						UserCredit uc = DATA.queryCreditCard(id);
						if( uc.email == null ) {
							DATA.updateCreditEmail(id, email);
						}
						resp.success();
					}
				}
					
			} catch (PayPalRESTException e) {
				// TODO Auto-generated catch block
				Util.log("", "Error Single Synchronous Payout with request:"+Payout.getLastRequest());
				if( e.getMessage().indexOf('{') > -1 ) {
					ValidationError ve = WebHelper.parseJsonErrorMessage(e.getMessage());
					if( ve.getDetails() == null )
						resp.code = ve.getName();
					else
						resp.code = ve.getValidationErrorList().toString();
				}else {
					if( e.getCause() != null )
						resp.code = e.getCause().getCause().getMessage();
				}
			}
		}
		
		return resp.toResp();
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
					if( tran.hasRecord ) {
						credit.number = tran.uc.num;
						credit.type = tran.uc.type;
						credit.name = tran.uc.name;
						credit.expire = tran.uc.exp;
						credit.ccv2 = tran.uc.ccv;
					}
					Payment	pay = createPayment(credit);
					if( pay != null && pay.getState().equals("approved") ) {
						if( !tran.hasRecord ) {
							DATA.insertCreditCard(new UserCredit(id, credit.number, credit.name, credit.expire, credit.ccv2, credit.type));
						}
						Integer i = DATA.updateDriverBalance(id, credit.value);
						if( i != null && i == 1 ) {
							resp.success();
						}
					}
				} catch (InvalidKeyException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				} catch (InvalidKeySpecException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				} catch (NoSuchAlgorithmException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				} catch (NoSuchPaddingException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				} catch (IllegalBlockSizeException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				} catch (BadPaddingException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				} catch (PayPalRESTException e) {
					// TODO Auto-generated catch block
					Util.log("", "Error Payment with Credit Card Request :"+Payment.getLastRequest());
					if( e.getMessage().indexOf('{') > -1 ) {
						ValidationError ve = WebHelper.parseJsonErrorMessage(e.getMessage());
						if( ve.getDetails() == null )
							resp.code = ve.getName();
						else
							resp.code = ve.getValidationErrorList().toString();
					}else {
						if( e.getCause() != null )
							resp.code = e.getCause().getCause().getMessage();
					}
				}
			}
		}else {
			resp.timeout();
		}
		
		return resp.toResp();
	}

}
