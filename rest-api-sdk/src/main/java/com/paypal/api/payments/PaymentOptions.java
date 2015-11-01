package com.paypal.api.payments;

import com.paypal.base.rest.PayPalModel;


public class PaymentOptions  extends PayPalModel {

	/**
	 * Payment method requested for this purchase unit
	 */
	private String allowedPaymentMethod;

	/**
	 * Default Constructor
	 */
	public PaymentOptions() {
	}


	/**
	 * Setter for allowedPaymentMethod
	 */
	public PaymentOptions setAllowedPaymentMethod(String allowedPaymentMethod) {
		this.allowedPaymentMethod = allowedPaymentMethod;
		return this;
	}

	/**
	 * Getter for allowedPaymentMethod
	 */
	public String getAllowedPaymentMethod() {
		return this.allowedPaymentMethod;
	}


}
