// #Create Batch Payout
// The asynchronous payout mode (sync_mode=false, which is the default) enables a maximum of 500 individual payouts to be specified in one API call. 
// Exceeding 500 payouts in one call returns an HTTP response message with status code 400 (Bad Request).

// API used: POST /v1/payments/payouts
package com.paypal.api.payouts.servlet;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Random;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.log4j.Logger;

import com.paypal.api.payments.Currency;
import com.paypal.api.payments.Payout;
import com.paypal.api.payments.PayoutBatch;
import com.paypal.api.payments.PayoutItem;
import com.paypal.api.payments.PayoutSenderBatchHeader;
import com.paypal.api.payments.util.GenerateAccessToken;
import com.paypal.api.payments.util.ResultPrinter;
import com.paypal.base.rest.APIContext;
import com.paypal.base.rest.PayPalRESTException;
import com.paypal.base.rest.PayPalResource;

public class CreateBatchPayoutServlet extends HttpServlet {

	private static final long serialVersionUID = 1L;

	private static final Logger LOGGER = Logger
			.getLogger(CreateBatchPayoutServlet.class);

	public void init(ServletConfig servletConfig) throws ServletException {
		// ##Load Configuration
		// Load SDK configuration for
		// the resource. This intialization code can be
		// done as Init Servlet.
		InputStream is = CreateBatchPayoutServlet.class
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

	// ##Create
	// Sample showing how to create a Single Payout with Synchronous Mode.
	@Override
	protected void doPost(HttpServletRequest req, HttpServletResponse resp)
			throws ServletException, IOException {
		createBatchPayout(req, resp);
		req.getRequestDispatcher("response.jsp").forward(req, resp);
	}

	@SuppressWarnings("unchecked")
	public PayoutBatch createBatchPayout(HttpServletRequest req,
			HttpServletResponse resp) {
		// ###Payout
		// A resource representing a payout
		// This is how our body should look like:
		/*
		 * { "sender_batch_header": { "sender_batch_id": "random_uniq_id",
		 * "email_subject": "You have a payment" }, "items": [ {
		 * "recipient_type": "EMAIL", "amount": { "value": 0.99, "currency":
		 * "USD" }, "receiver": "shirt-supplier-one@mail.com", "note":
		 * "Thank you.", "sender_item_id": "item_1" }, { "recipient_type":
		 * "EMAIL", "amount": { "value": 0.90, "currency": "USD" }, "receiver":
		 * "shirt-supplier-two@mail.com", "note": "Thank you.",
		 * "sender_item_id": "item_2" }, { "recipient_type": "EMAIL", "amount":
		 * { "value": 2.00, "currency": "USD" }, "receiver":
		 * "shirt-supplier-three@mail.com", "note": "Thank you.",
		 * "sender_item_id": "item_3" } ] }
		 */
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
				"You have a Payment!");

		// ### Currency
		Currency amount1 = new Currency();
		amount1.setValue("1.00").setCurrency("USD");

		// ### Currency
		Currency amount2 = new Currency();
		amount2.setValue("2.00").setCurrency("USD");

		// ### Currency
		Currency amount3 = new Currency();
		amount3.setValue("4.00").setCurrency("USD");

		// #### Sender Item 1
		// Please note that if you are using single payout with sync mode, you
		// can only pass one Item in the request
		PayoutItem senderItem1 = new PayoutItem();
		senderItem1.setRecipientType("Email")
				.setNote("Thanks for your patronage")
				.setReceiver("shirt-supplier-one@gmail.com")
				.setSenderItemId("201404324234").setAmount(amount1);

		// #### Sender Item 1
		// Please note that if you are using single payout with sync mode, you
		// can only pass one Item in the request
		PayoutItem senderItem2 = new PayoutItem();
		senderItem2.setRecipientType("Email")
				.setNote("Thanks for your patronage")
				.setReceiver("shirt-supplier-two@gmail.com")
				.setSenderItemId("201404324235").setAmount(amount2);

		// #### Sender Item 1
		// Please note that if you are using single payout with sync mode, you
		// can only pass one Item in the request
		PayoutItem senderItem3 = new PayoutItem();
		senderItem3.setRecipientType("Email")
				.setNote("Thanks for your patronage")
				.setReceiver("shirt-supplier-three@gmail.com")
				.setSenderItemId("201404324236").setAmount(amount3);

		List<PayoutItem> items = new ArrayList<PayoutItem>();
		items.add(senderItem1);
		items.add(senderItem2);
		items.add(senderItem3);

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
			String accessToken = GenerateAccessToken.getAccessToken();

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

			// ###Create Batch Payout 
			batch = payout.create(apiContext, new HashMap<String, String>());

			LOGGER.info("Payout Batch With ID: "
					+ batch.getBatchHeader().getPayoutBatchId());
			ResultPrinter.addResult(req, resp, "Payout Batch Create",
					Payout.getLastRequest(), Payout.getLastResponse(), null);

		} catch (PayPalRESTException e) {
			ResultPrinter.addResult(req, resp, "Payout Batch Create",
					Payout.getLastRequest(), null, e.getMessage());
		}

		return batch;
	}

}
