// #VoidAuthorization Sample
// This sample code demonstrate how you
// can do a Void on a Authorization
// resource
// API used: /v1/payments/authorization/{authorization_id}/void
package com.paypal.api.payments.servlet;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.log4j.Logger;

import com.paypal.api.payments.Address;
import com.paypal.api.payments.Amount;
import com.paypal.api.payments.Authorization;
import com.paypal.api.payments.CreditCard;
import com.paypal.api.payments.Details;
import com.paypal.api.payments.FundingInstrument;
import com.paypal.api.payments.Payer;
import com.paypal.api.payments.Payment;
import com.paypal.api.payments.Transaction;
import com.paypal.api.payments.util.GenerateAccessToken;
import com.paypal.api.payments.util.ResultPrinter;
import com.paypal.base.rest.APIContext;
import com.paypal.base.rest.PayPalRESTException;
import com.paypal.base.rest.PayPalResource;

public class VoidAuthorizationServlet extends HttpServlet {

	private static final long serialVersionUID = 1L;

	private static final Logger LOGGER = Logger
			.getLogger(VoidAuthorizationServlet.class);
	Map<String, String> map = new HashMap<String, String>();
	
	public void init(ServletConfig servletConfig) throws ServletException {
		// ##Load Configuration
		// Load SDK configuration for
		// the resource. This intialization code can be
		// done as Init Servlet.
		InputStream is = VoidAuthorizationServlet.class
				.getResourceAsStream("/sdk_config.properties");
		try {
			PayPalResource.initConfig(is);
		} catch (PayPalRESTException e) {
			LOGGER.fatal(e.getMessage());
		}
	}

	@Override
	protected void doGet(HttpServletRequest req, HttpServletResponse resp)
			throws ServletException, IOException {
		doPost(req, resp);
	}
	
	// ##VoidAuthorization
	// Sample showing how to void an Authorization
	@Override
	protected void doPost(HttpServletRequest req, HttpServletResponse resp)
			throws ServletException, IOException {
		// ###AccessToken
		// Retrieve the access token from
		// OAuthTokenCredential by passing in
		// ClientID and ClientSecret
		APIContext apiContext = null;
		String accessToken = null;
		try {
			accessToken = GenerateAccessToken.getAccessToken();

			// ### Api Context
			// Pass in a `ApiContext` object to authenticate
			// the call and to send a unique request id
			// (that ensures idempotency). The SDK generates
			// a request id if you do not pass one explicitly.
			apiContext = new APIContext(accessToken);
			// Use this variant if you want to pass in a request id
			// that is meaningful in your application, ideally
			// a order id.
			/*
			 * String requestId = Long.toString(System.nanoTime(); APIContext
			 * apiContext = new APIContext(accessToken, requestId ));
			 */

			// ###Authorization
			// Retrieve a Authorization object
			// by making a Payment with intent
			// as 'authorize'
			Authorization authorization = getAuthorization(apiContext);

			// Void an Authorization
			// by POSTing to 
			// URI v1/payments/authorization/{authorization_id}/void
			Authorization returnAuthorization = authorization.doVoid(apiContext);


			LOGGER.info("Authorization id = " + returnAuthorization.getId()
					+ " and status = " + returnAuthorization.getState());
			ResultPrinter.addResult(req, resp, "Voided Authorization", Authorization.getLastRequest(), Authorization.getLastResponse(), null);
		} catch (PayPalRESTException e) {
			ResultPrinter.addResult(req, resp, "Voided Authorization", Authorization.getLastRequest(), null, e.getMessage());
		}
		req.getRequestDispatcher("response.jsp").forward(req, resp);
	}

	private Authorization getAuthorization(APIContext apiContext)
			throws PayPalRESTException {

		// ###Details
		// Let's you specify details of a payment amount.
		Details details = new Details();
		details.setShipping("0.03");
		details.setSubtotal("107.41");
		details.setTax("0.03");

		// ###Amount
		// Let's you specify a payment amount.
		Amount amount = new Amount();
		amount.setCurrency("USD");
		amount.setTotal("107.47");
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
		creditCard.setCvv2(874);
		creditCard.setExpireMonth(11);
		creditCard.setExpireYear(2018);
		creditCard.setFirstName("Joe");
		creditCard.setLastName("Shopper");
		creditCard.setNumber("4417119669820331");
		creditCard.setType("visa");
		
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
		List<FundingInstrument> fundingInstruments = new ArrayList<FundingInstrument>();
		fundingInstruments.add(fundingInstrument);
		
		// ###Payer
		// A resource representing a Payer that funds a payment
		// Use the List of `FundingInstrument` and the Payment Method
		// as 'credit_card'
		Payer payer = new Payer();
		payer.setFundingInstruments(fundingInstruments);
		payer.setPaymentMethod("credit_card");

		// ###Payment
		// A Payment Resource; create one using
		// the above types and intent as 'authorize'
		Payment payment = new Payment();
		payment.setIntent("authorize");
		payment.setPayer(payer);
		payment.setTransactions(transactions);

		Payment responsePayment = payment.create(apiContext);
		return responsePayment.getTransactions().get(0)
				.getRelatedResources().get(0).getAuthorization();
	}

}
