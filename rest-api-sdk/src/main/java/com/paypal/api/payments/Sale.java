package com.paypal.api.payments;

import java.util.HashMap;
import java.util.List;

import com.paypal.base.Constants;
import com.paypal.base.rest.APIContext;
import com.paypal.base.rest.HttpMethod;
import com.paypal.base.rest.PayPalRESTException;
import com.paypal.base.rest.PayPalResource;
import com.paypal.base.rest.RESTUtil;
import com.paypal.base.sdk.info.SDKVersionImpl;

public class Sale  extends PayPalResource {

	/**
	 * Identifier of the authorization transaction.
	 */
	private String id;

	/**
	 * Time the resource was created.
	 */
	private String createTime;

	/**
	 * Time the resource was last updated.
	 */
	private String updateTime;

	/**
	 * Amount being collected.
	 */
	private Amount amount;

	/**
	 * specifies payment mode of the transaction
	 */
	private String paymentMode;

	/**
	 * State of the sale transaction.
	 */
	private String state;

	/**
	 * Reason code for the transaction state being Pending or Reversed.
	 */
	private String reasonCode;

	/**
	 * Protection Eligibility of the Payer 
	 */
	private String protectionEligibility;

	/**
	 * Protection Eligibility Type of the Payer 
	 */
	private String protectionEligibilityType;

	/**
	 * Expected clearing time for eCheck Transactions
	 */
	private String clearingTime;

	/**
	 * ID of the Payment resource that this transaction is based on.
	 */
	private String parentPayment;

	/**
	 * 
	 */
	private List<Links> links;
	
	/**
	 * Indicates the credit status of fund to the recipient. It will be returned only when payment status is 'completed'
	 */
	private String recipientFundStatus;

	/**
	 * Reason for holding the funds.
	 */
	private String holdReason;
	
	/**
	 * Transaction fee applicable for this payment.
	 */
	private Currency transactionFee;
	
	/**
	 * Net amount payee receives for this transaction after deducting transaction fee.
	 */
	private Currency receivableAmount;
	
	/**
	 * Exchange rate applied for this transaction.
	 */
	private String exchangeRate;
	
	/**
	 * Fraud Management Filter (FMF) details applied for the payment that could result in accept/deny/pending action.
	 */
	private FmfDetails fmfDetails;
	
	/**
	 * Receipt id is 16 digit number payment identification number returned for guest users to identify the payment.
	 */
	private String receiptId;

	/**
	 * Default Constructor
	 */
	public Sale() {
	}

	/**
	 * Parameterized Constructor
	 */
	public Sale(Amount amount, String state, String parentPayment) {
		this.amount = amount;
		this.state = state;
		this.parentPayment = parentPayment;
	}


	/**
	 * Setter for id
	 */
	public Sale setId(String id) {
		this.id = id;
		return this;
	}

	/**
	 * Getter for id
	 */
	public String getId() {
		return this.id;
	}


	/**
	 * Setter for createTime
	 */
	public Sale setCreateTime(String createTime) {
		this.createTime = createTime;
		return this;
	}

	/**
	 * Getter for createTime
	 */
	public String getCreateTime() {
		return this.createTime;
	}


	/**
	 * Setter for updateTime
	 */
	public Sale setUpdateTime(String updateTime) {
		this.updateTime = updateTime;
		return this;
	}

	/**
	 * Getter for updateTime
	 */
	public String getUpdateTime() {
		return this.updateTime;
	}


	/**
	 * Setter for amount
	 */
	public Sale setAmount(Amount amount) {
		this.amount = amount;
		return this;
	}

	/**
	 * Getter for amount
	 */
	public Amount getAmount() {
		return this.amount;
	}


	/**
	 * Setter for paymentMode
	 */
	public Sale setPaymentMode(String paymentMode) {
		this.paymentMode = paymentMode;
		return this;
	}

	/**
	 * Getter for paymentMode
	 */
	public String getPaymentMode() {
		return this.paymentMode;
	}


	/**
	 * Setter for state
	 */
	public Sale setState(String state) {
		this.state = state;
		return this;
	}

	/**
	 * Getter for state
	 */
	public String getState() {
		return this.state;
	}


	/**
	 * Setter for reasonCode
	 */
	public Sale setReasonCode(String reasonCode) {
		this.reasonCode = reasonCode;
		return this;
	}

	/**
	 * Getter for reasonCode
	 */
	public String getReasonCode() {
		return this.reasonCode;
	}


	/**
	 * Setter for protectionEligibility
	 */
	public Sale setProtectionEligibility(String protectionEligibility) {
		this.protectionEligibility = protectionEligibility;
		return this;
	}

	/**
	 * Getter for protectionEligibility
	 */
	public String getProtectionEligibility() {
		return this.protectionEligibility;
	}


	/**
	 * Setter for protectionEligibilityType
	 */
	public Sale setProtectionEligibilityType(String protectionEligibilityType) {
		this.protectionEligibilityType = protectionEligibilityType;
		return this;
	}

	/**
	 * Getter for protectionEligibilityType
	 */
	public String getProtectionEligibilityType() {
		return this.protectionEligibilityType;
	}


	/**
	 * Setter for clearingTime
	 */
	public Sale setClearingTime(String clearingTime) {
		this.clearingTime = clearingTime;
		return this;
	}

	/**
	 * Getter for clearingTime
	 */
	public String getClearingTime() {
		return this.clearingTime;
	}


	/**
	 * Setter for parentPayment
	 */
	public Sale setParentPayment(String parentPayment) {
		this.parentPayment = parentPayment;
		return this;
	}

	/**
	 * Getter for parentPayment
	 */
	public String getParentPayment() {
		return this.parentPayment;
	}


	/**
	 * Setter for links
	 */
	public Sale setLinks(List<Links> links) {
		this.links = links;
		return this;
	}

	/**
	 * Getter for links
	 */
	public List<Links> getLinks() {
		return this.links;
	}

	public String getRecipientFundStatus() {
		return recipientFundStatus;
	}

	public Sale setRecipientFundStatus(String recipientFundStatus) {
		this.recipientFundStatus = recipientFundStatus;
		return this;
	}

	public String getHoldReason() {
		return holdReason;
	}

	public Sale setHoldReason(String holdReason) {
		this.holdReason = holdReason;
		return this;
	}

	public Currency getTransactionFee() {
		return transactionFee;
	}

	public Sale setTransactionFee(Currency transactionFee) {
		this.transactionFee = transactionFee;
		return this;
	}

	public Currency getReceivableAmount() {
		return receivableAmount;
	}

	public Sale setReceivableAmount(Currency receivableAmount) {
		this.receivableAmount = receivableAmount;
		return this;
	}

	public String getExchangeRate() {
		return exchangeRate;
	}

	public Sale setExchangeRate(String exchangeRate) {
		this.exchangeRate = exchangeRate;
		return this;
	}

	public FmfDetails getFmfDetails() {
		return fmfDetails;
	}

	public Sale setFmfDetails(FmfDetails fmfDetails) {
		this.fmfDetails = fmfDetails;
		return this;
	}

	public String getReceiptId() {
		return receiptId;
	}

	public Sale setReceiptId(String receiptId) {
		this.receiptId = receiptId;
		return this;
	}


	/**
	 * Obtain the Sale transaction resource for the given identifier.
	 * @param accessToken
	 *            Access Token used for the API call.
	 * @param saleId
	 *            String
	 * @return Sale
	 * @throws PayPalRESTException
	 */
	public static Sale get(String accessToken, String saleId) throws PayPalRESTException {
		APIContext apiContext = new APIContext(accessToken);
		return get(apiContext, saleId);
	}

	/**
	 * Obtain the Sale transaction resource for the given identifier.
	 * @param apiContext
	 *            {@link APIContext} used for the API call.
	 * @param saleId
	 *            String
	 * @return Sale
	 * @throws PayPalRESTException
	 */
	public static Sale get(APIContext apiContext, String saleId) throws PayPalRESTException {
		if (apiContext == null) {
			throw new IllegalArgumentException("APIContext cannot be null");
		}
		if (apiContext.getAccessToken() == null || apiContext.getAccessToken().trim().length() <= 0) {
			throw new IllegalArgumentException("AccessToken cannot be null or empty");
		}
		if (apiContext.getHTTPHeaders() == null) {
			apiContext.setHTTPHeaders(new HashMap<String, String>());
		}
		apiContext.getHTTPHeaders().put(Constants.HTTP_CONTENT_TYPE_HEADER, Constants.HTTP_CONTENT_TYPE_JSON);
		apiContext.setSdkVersion(new SDKVersionImpl());
		if (saleId == null) {
			throw new IllegalArgumentException("saleId cannot be null");
		}
		Object[] parameters = new Object[] {saleId};
		String pattern = "v1/payments/sale/{0}";
		String resourcePath = RESTUtil.formatURIPath(pattern, parameters);
		String payLoad = "";
		return configureAndExecute(apiContext, HttpMethod.GET, resourcePath, payLoad, Sale.class);
	}


	/**
	 * Creates (and processes) a new Refund Transaction added as a related resource.
	 * @param accessToken
	 *            Access Token used for the API call.
	 * @param refund
	 *            Refund
	 * @return Refund
	 * @throws PayPalRESTException
	 */
	public Refund refund(String accessToken, Refund refund) throws PayPalRESTException {
		APIContext apiContext = new APIContext(accessToken);
		return refund(apiContext, refund);
	}

	/**
	 * Creates (and processes) a new Refund Transaction added as a related resource.
	 * @param apiContext
	 *            {@link APIContext} used for the API call.
	 * @param refund
	 *            Refund
	 * @return Refund
	 * @throws PayPalRESTException
	 */
	public Refund refund(APIContext apiContext, Refund refund) throws PayPalRESTException {
		if (apiContext == null) {
			throw new IllegalArgumentException("APIContext cannot be null");
		}
		if (apiContext.getAccessToken() == null || apiContext.getAccessToken().trim().length() <= 0) {
			throw new IllegalArgumentException("AccessToken cannot be null or empty");
		}
		if (apiContext.getHTTPHeaders() == null) {
			apiContext.setHTTPHeaders(new HashMap<String, String>());
		}
		apiContext.getHTTPHeaders().put(Constants.HTTP_CONTENT_TYPE_HEADER, Constants.HTTP_CONTENT_TYPE_JSON);
		apiContext.setSdkVersion(new SDKVersionImpl());
		if (this.getId() == null) {
			throw new IllegalArgumentException("Id cannot be null");
		}
		if (refund == null) {
			throw new IllegalArgumentException("refund cannot be null");
		}
		Object[] parameters = new Object[] {this.getId()};
		String pattern = "v1/payments/sale/{0}/refund";
		String resourcePath = RESTUtil.formatURIPath(pattern, parameters);
		String payLoad = refund.toJSON();
		return configureAndExecute(apiContext, HttpMethod.POST, resourcePath, payLoad, Refund.class);
	}


}
