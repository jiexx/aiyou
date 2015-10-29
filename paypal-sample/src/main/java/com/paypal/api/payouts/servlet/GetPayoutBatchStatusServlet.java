// #Get Payout Batch Status
// This call can be used to periodically to get the latest status of a batch, along with the transaction status and other data for individual items.
// API used: GET /v1/payments/payouts/<Payout-Batch-Id>
package com.paypal.api.payouts.servlet;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.log4j.Logger;

import com.paypal.api.payments.Payout;
import com.paypal.api.payments.PayoutBatch;
import com.paypal.api.payments.util.GenerateAccessToken;
import com.paypal.api.payments.util.ResultPrinter;
import com.paypal.base.rest.APIContext;
import com.paypal.base.rest.PayPalRESTException;
import com.paypal.base.rest.PayPalResource;

public class GetPayoutBatchStatusServlet extends HttpServlet {

	private static final long serialVersionUID = 1L;

	private static final Logger LOGGER = Logger
			.getLogger(GetPayoutBatchStatusServlet.class);

	public void init(ServletConfig servletConfig) throws ServletException {
		// ##Load Configuration
		// Load SDK configuration for
		// the resource. This intialization code can be
		// done as Init Servlet.
		InputStream is = GetPayoutBatchStatusServlet.class
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

	// ##GetPayoutBatchStatus
	// Sample showing how to get a Payout Batch Status
	@Override
	protected void doPost(HttpServletRequest req, HttpServletResponse resp)
			throws ServletException, IOException {

		getPayoutBatchStatus(req, resp);
		req.getRequestDispatcher("response.jsp").forward(req, resp);
	}

	@SuppressWarnings("unchecked")
	public PayoutBatch getPayoutBatchStatus(HttpServletRequest req,
			HttpServletResponse resp) {

		// ### Create a Payout Batch
		// We are re-using the CreateBatchPayoutServlet to create a batch payout
		// for us. This will make sure the samples will work all the time.
		CreateBatchPayoutServlet servlet = new CreateBatchPayoutServlet();
		PayoutBatch batch = servlet.createBatchPayout(req, resp);
		String payoutBatchId = batch.getBatchHeader().getPayoutBatchId();

		PayoutBatch response = null;
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

			// ###Get Payout Batch Status
			response = Payout.get(apiContext, payoutBatchId);

			LOGGER.info("Payout Batch With ID: "
					+ response.getBatchHeader().getPayoutBatchId());
			ResultPrinter.addResult(req, resp, "Get Payout Batch Status",
					Payout.getLastRequest(), Payout.getLastResponse(), null);
		} catch (PayPalRESTException e) {
			ResultPrinter.addResult(req, resp, "Get Payout Batch Status",
					Payout.getLastRequest(), null, e.getMessage());
		}

		return response;
	}

}
