package com.paypal.api.payments;

import com.paypal.base.rest.PayPalModel;


public class CreateProfileResponse  extends PayPalModel {

	/**
	 * ID of the payment web experience profile.
	 */
	private String id;

	/**
	 * Default Constructor
	 */
	public CreateProfileResponse() {
	}


	/**
	 * Setter for id
	 */
	public CreateProfileResponse setId(String id) {
		this.id = id;
		return this;
	}

	/**
	 * Getter for id
	 */
	public String getId() {
		return this.id;
	}
	
}
