package com.paypal.api.payments;

import java.util.List;

import com.paypal.base.rest.PayPalModel;

public class Error  extends PayPalModel {

	/**
	 * Human readable, unique name of the error.
	 */
	private String name;

	/**
	 * PayPal internal identifier used for correlation purposes.
	 */
	private String debugId;

	/**
	 * Message describing the error.
	 */
	private String message;

	/**
	 * URI for detailed information related to this error for the developer.
	 */
	private String informationLink;

	/**
	 * Additional details of the error
	 */
	private List<ErrorDetails> details;

	/**
	 * Reference ID of the purchase_unit associated with this error
	 */
	private String purchaseUnitReferenceId;
	
	/**
	 * PayPal internal error code.
	 */
	private String code;
	
	/**
	 * Default Constructor
	 */
	public Error() {
	}

	/**
	 * Parameterized Constructor
	 */
	public Error(String name, String message, String informationLink) {
		this.name = name;
		this.message = message;
		this.informationLink = informationLink;
	}


	/**
	 * Setter for name
	 */
	public Error setName(String name) {
		this.name = name;
		return this;
	}

	/**
	 * Getter for name
	 */
	public String getName() {
		return this.name;
	}


	/**
	 * Setter for debugId
	 */
	public Error setDebugId(String debugId) {
		this.debugId = debugId;
		return this;
	}

	/**
	 * Getter for debugId
	 */
	public String getDebugId() {
		return this.debugId;
	}


	/**
	 * Setter for message
	 */
	public Error setMessage(String message) {
		this.message = message;
		return this;
	}

	/**
	 * Getter for message
	 */
	public String getMessage() {
		return this.message;
	}


	/**
	 * Setter for informationLink
	 */
	public Error setInformationLink(String informationLink) {
		this.informationLink = informationLink;
		return this;
	}

	/**
	 * Getter for informationLink
	 */
	public String getInformationLink() {
		return this.informationLink;
	}


	/**
	 * Setter for details
	 */
	public Error setDetails(List<ErrorDetails> details) {
		this.details = details;
		return this;
	}

	/**
	 * Getter for details
	 */
	public List<ErrorDetails> getDetails() {
		return this.details;
	}


	public String getPurchaseUnitReferenceId() {
		return purchaseUnitReferenceId;
	}

	public Error setPurchaseUnitReferenceId(String purchaseUnitReferenceId) {
		this.purchaseUnitReferenceId = purchaseUnitReferenceId;
		return this;
	}

	public String getCode() {
		return code;
	}

	public Error setCode(String code) {
		this.code = code;
		return this;
	}

}
