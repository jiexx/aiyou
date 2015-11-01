package com.paypal.api.payments;

import com.paypal.base.rest.PayPalModel;


public class InvoicingRefundDetail  extends PayPalModel {

	/**
	 * PayPal refund type indicating whether refund was done in invoicing flow via PayPal or externally. In the case of the mark-as-refunded API, refund type is EXTERNAL and this is what is now supported. The PAYPAL value is provided for backward compatibility.
	 */
	private String type;

	/**
	 * Date when the invoice was marked as refunded. If no date is specified, the current date and time is used as the default. In addition, the date must be after the invoice payment date.
	 */
	private String date;

	/**
	 * Optional note associated with the refund.
	 */
	private String note;

	/**
	 * Default Constructor
	 */
	public InvoicingRefundDetail() {
	}

	/**
	 * Parameterized Constructor
	 */
	public InvoicingRefundDetail(String type) {
		this.type = type;
	}


	/**
	 * Setter for type
	 */
	public InvoicingRefundDetail setType(String type) {
		this.type = type;
		return this;
	}

	/**
	 * Getter for type
	 */
	public String getType() {
		return this.type;
	}


	/**
	 * Setter for date
	 */
	public InvoicingRefundDetail setDate(String date) {
		this.date = date;
		return this;
	}

	/**
	 * Getter for date
	 */
	public String getDate() {
		return this.date;
	}


	/**
	 * Setter for note
	 */
	public InvoicingRefundDetail setNote(String note) {
		this.note = note;
		return this;
	}

	/**
	 * Getter for note
	 */
	public String getNote() {
		return this.note;
	}


}
