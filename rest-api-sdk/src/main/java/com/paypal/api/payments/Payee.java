package com.paypal.api.payments;

import com.paypal.base.rest.PayPalModel;


public class Payee  extends PayPalModel {

	/**
	 * Email Address associated with the Payee's PayPal Account. If the provided email address is not associated with any PayPal Account, the payee can only receiver PayPal Wallet Payments. Direct Credit Card Payments will be denied due to card compliance requirements.
	 */
	private String email;

	/**
	 * Encrypted PayPal Account identifier for the Payee.
	 */
	private String merchantId;

	/**
	 * Information related to the Payer. In case of PayPal Wallet payment, this information will be filled in by PayPal after the user approves the payment using their PayPal Wallet. 
	 */
	private Phone phone;

	/**
	 * Default Constructor
	 */
	public Payee() {
	}

	/**
	 * Parameterized Constructor
	 */
	public Payee(String email, String merchantId) {
		this.email = email;
		this.merchantId = merchantId;
	}


	/**
	 * Setter for email
	 */
	public Payee setEmail(String email) {
		this.email = email;
		return this;
	}

	/**
	 * Getter for email
	 */
	public String getEmail() {
		return this.email;
	}


	/**
	 * Setter for merchantId
	 */
	public Payee setMerchantId(String merchantId) {
		this.merchantId = merchantId;
		return this;
	}

	/**
	 * Getter for merchantId
	 */
	public String getMerchantId() {
		return this.merchantId;
	}


	/**
	 * Setter for phone
	 */
	public Payee setPhone(Phone phone) {
		this.phone = phone;
		return this;
	}

	/**
	 * Getter for phone
	 */
	public Phone getPhone() {
		return this.phone;
	}


}
