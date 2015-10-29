// #Cancel Unclaimed Payout
// Use this call to cancel an existing, unclaimed transaction. If an unclaimed item is not claimed within 30 days, the funds will be automatically returned to the sender. 
// This call can be used to cancel the unclaimed item prior to the automatic 30-day return.
// API used: POST /v1/payments/payouts-item/<Payout-Item-Id>/cancel

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

public class CancelPayoutItemServlet extends HttpServlet {

	private static final long serialVersionUID = 1L;

	private static final Logger LOGGER = Logger
			.getLogger(CancelPayoutItemServlet.class);

	public void init(ServletConfig servletConfig) throws ServletException {
		// ##Load Configuration
		// Load SDK configuration for
		// the resource. This intialization code can be
		// done as Init Servlet.
		InputStream is = CancelPayoutItemServlet.class
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
		cancelPayoutItem(req, resp);
		req.getRequestDispatcher("response.jsp").forward(req, resp);
	}

	public PayoutItemDetails cancelPayoutItem(HttpServletRequest req,
			HttpServletResponse resp) {

		// ### Get a Payout Batch
		// We are re-using the CreateSinglePayoutServlet to get a batch payout
		// for us. This will make sure the samples will work all the time.
		CreateSinglePayoutServlet servlet = new CreateSinglePayoutServlet();
		PayoutBatch batch = servlet.createSynchronousSinglePayout(req, resp);

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

			// ###Cancel Payout Item if it is unclaimed
			if (itemDetails.getTransactionStatus().equalsIgnoreCase("UNCLAIMED")) {
				response = PayoutItem.cancel(apiContext, payoutItemId);

				LOGGER.info("Payout Item With ID: "
						+ response.getPayoutItemId());
				ResultPrinter.addResult(req, resp, "Cancelled Unclaimed Payout Item",
						PayoutItem.getLastRequest(),
						PayoutItem.getLastResponse(), null);
			} else {
				LOGGER.info("Payout Item needs to be Unclaimed");
				ResultPrinter.addResult(req, resp, "Cancelled Unclaimed Payout Item",
						null,
						null,  "Payout Item needs to be Unclaimed");
			}
		} catch (PayPalRESTException e) {
			ResultPrinter.addResult(req, resp, "Cancelled Unclaimed Payout Item",
					PayoutItem.getLastRequest(), null, e.getMessage());
		}

		return response;
	}
}
