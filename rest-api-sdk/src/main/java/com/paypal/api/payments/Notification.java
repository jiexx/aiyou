package com.paypal.api.payments;

import com.paypal.base.rest.PayPalModel;


public class Notification  extends PayPalModel {

	/**
	 * Subject of the notification.
	 */
	private String subject;

	/**
	 * Note to the payer.
	 */
	private String note;

	/**
	 * A flag indicating whether a copy of the email has to be sent to the merchant.
	 */
	private Boolean sendToMerchant;

	/**
	 * Default Constructor
	 */
	public Notification() {
	}


	/**
	 * Setter for subject
	 */
	public Notification setSubject(String subject) {
		this.subject = subject;
		return this;
	}

	/**
	 * Getter for subject
	 */
	public String getSubject() {
		return this.subject;
	}


	/**
	 * Setter for note
	 */
	public Notification setNote(String note) {
		this.note = note;
		return this;
	}

	/**
	 * Getter for note
	 */
	public String getNote() {
		return this.note;
	}


	/**
	 * Setter for sendToMerchant
	 */
	public Notification setSendToMerchant(Boolean sendToMerchant) {
		this.sendToMerchant = sendToMerchant;
		return this;
	}

	/**
	 * Getter for sendToMerchant
	 */
	public Boolean getSendToMerchant() {
		return this.sendToMerchant;
	}


}
