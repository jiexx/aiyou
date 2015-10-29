// #GetCreditCard Sample
// This sample code demonstrates how you 
// retrieve a previously saved 
// Credit Card using the 'vault' API.
// API used: GET /v1/vault/credit-card/{id}
package com.paypal.api.payments.servlet;

import java.io.IOException;
import java.io.InputStream;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.log4j.Logger;

import com.paypal.api.payments.CreditCard;
import com.paypal.api.payments.util.GenerateAccessToken;
import com.paypal.api.payments.util.ResultPrinter;
import com.paypal.base.rest.PayPalRESTException;
import com.paypal.base.rest.PayPalResource;

/**
 * @author lvairamani
 * 
 */
public class GetCreditCardServlet extends HttpServlet {

	private static final long serialVersionUID = 1L;
	private static final Logger LOGGER = Logger
			.getLogger(GetCreditCardServlet.class);

	public void init(ServletConfig servletConfig) throws ServletException {
		// ##Load Configuration
		// Load SDK configuration for
		// the resource. This intialization code can be
		// done as Init Servlet.
		InputStream is = GetCreditCardServlet.class
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

	// ##GetCreditCardUsingId
	// Call the method with a previously created Credit Card ID
	@Override
	protected void doPost(HttpServletRequest req, HttpServletResponse resp)
			throws ServletException, IOException {

		try {
			// ###AccessToken
			// Retrieve the access token from
			// OAuthTokenCredential by passing in
			// ClientID and ClientSecret
			// It is not mandatory to generate Access Token on a per call basis.
			// Typically the access token can be generated once and
			// reused within the expiry window
			String accessToken = GenerateAccessToken.getAccessToken();

			// Retrieve the CreditCard object by calling the
			// static `get` method on the CreditCard class,
			// and pass the Access Token and CreditCard ID
			CreditCard creditCard = CreditCard.get(accessToken,
					"CARD-5BT058015C739554AKE2GCEI");
			LOGGER.info("Credit Card retrieved ID = " + creditCard.getId()
					+ ", status = " + creditCard.getState());
			ResultPrinter.addResult(req, resp, "Got Credit Card from Vault", CreditCard.getLastRequest(), CreditCard.getLastResponse(), null);
		} catch (PayPalRESTException e) {
			ResultPrinter.addResult(req, resp, "Got Credit Card from Vault", CreditCard.getLastRequest(), null, e.getMessage());
		}
		req.getRequestDispatcher("response.jsp").forward(req, resp);
	}

}
