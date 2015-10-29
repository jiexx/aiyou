// #Get Payout Item Status
// Use this call to get data about a payout item, including the status, without retrieving an entire batch. 
// You can get the status of an individual payout item in a batch in order to review the current status of a previously-unclaimed, or pending, payout item.
// API used: GET /v1/payments/payouts-item/<Payout-Item-Id>

package com.paypal.api.payouts.servlet;

import java.io.IOException;
import java.io.InputStream;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.log4j.Logger;

import com.paypal.api.payments.PayoutBatch;
import com.paypal.api.payments.PayoutItem;
import com.paypal.api.payments.PayoutItemDetails;
import com.paypal.api.payments.util.GenerateAccessToken;
import com.paypal.api.payments.util.ResultPrinter;
import com.paypal.base.rest.APIContext;
import com.paypal.base.rest.PayPalRESTException;
import com.paypal.base.rest.PayPalResource;

public class GetPayoutItemStatusServlet extends HttpServlet {

	private static final long serialVersionUID = 1L;

	private static final Logger LOGGER = Logger
			.getLogger(GetPayoutItemStatusServlet.class);

	public void init(ServletConfig servletConfig) throws ServletException {
		// ##Load Configuration
		// Load SDK configuration for
		// the resource. This intialization code can be
		// done as Init Servlet.
		InputStream is = GetPayoutItemStatusServlet.class
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

	// ##Get Payout Item Status
	// Sample showing how to get a Payout Item Status
	@Override
	protected void doPost(HttpServletRequest req, HttpServletResponse resp)
			throws ServletException, IOException {
		getPayoutItemStatus(req, resp);
		req.getRequestDispatcher("response.jsp").forward(req, resp);
	}

	public PayoutItemDetails getPayoutItemStatus(HttpServletRequest req,
			HttpServletResponse resp) {

		// ### Get a Payout Batch
		// We are re-using the GetPayoutBatchStatusServlet to get a batch payout
		// for us. This will make sure the samples will work all the time.
		GetPayoutBatchStatusServlet servlet = new GetPayoutBatchStatusServlet();
		PayoutBatch batch = servlet.getPayoutBatchStatus(req, resp);

		// ### Retrieve PayoutItem ID
		// In the samples, we are extractingt he payoutItemId of a payout we
		// just created.
		// In reality, you might be using the payoutItemId stored in your
		// database, or passed manually.
		PayoutItemDetails itemDetails = batch.getItems().get(0);
		String payoutItemId = itemDetails.getPayoutItemId();

		// Initiate the response object
		PayoutItemDetails response = null;
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

			// ###Get Payout Item
			response = PayoutItem.get(apiContext, payoutItemId);

			LOGGER.info("Payout Item With ID: " + response.getPayoutItemId());
			ResultPrinter.addResult(req, resp, "Got Payout Item Status",
					PayoutItem.getLastRequest(), PayoutItem.getLastResponse(),
					null);
		} catch (PayPalRESTException e) {
			ResultPrinter.addResult(req, resp, "Got Payout Item Status",
					PayoutItem.getLastRequest(), null, e.getMessage());
		}

		return response;
	}
}
