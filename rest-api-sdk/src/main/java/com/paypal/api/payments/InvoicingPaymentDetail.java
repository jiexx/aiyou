package com.paypal.api.payments;

import com.paypal.base.rest.PayPalModel;


public class InvoicingPaymentDetail  extends PayPalModel {

	/**
	 * PayPal payment detail indicating whether payment was made in an invoicing flow via PayPal or externally. In the case of the mark-as-paid API, payment type is EXTERNAL and this is what is now supported. The PAYPAL value is provided for backward compatibility.
	 */
	private String type;

	/**
	 * PayPal payment transaction id. Mandatory field in case the type value is PAYPAL.
	 */
	private String transactionId;

	/**
	 * Type of the transaction.
	 */
	private String transactionType;

	/**
	 * Date when the invoice was paid. Date format: yyyy-MM-dd z. For example, 2014-02-27 PST.
	 */
	private String date;

	/**
	 * Payment mode or method. This field is mandatory if the value of the type field is OTHER.
	 */
	private String method;

	/**
	 * Optional note associated with the payment.
	 */
	private String note;

	/**
	 * Default Constructor
	 */
	public InvoicingPaymentDetail() {
	}

	/**
	 * Parameterized Constructor
	 */
	public InvoicingPaymentDetail(String method) {
		this.method = method;
	}


	/**
	 * Setter for type
	 */
	public InvoicingPaymentDetail setType(String type) {
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
	 * Setter for transactionId
	 */
	public InvoicingPaymentDetail setTransactionId(String transactionId) {
		this.transactionId = transactionId;
		return this;
	}

	/**
	 * Getter for transactionId
	 */
	public String getTransactionId() {
		return this.transactionId;
	}


	/**
	 * Setter for transactionType
	 */
	public InvoicingPaymentDetail setTransactionType(String transactionType) {
		this.transactionType = transactionType;
		return this;
	}

	/**
	 * Getter for transactionType
	 */
	public String getTransactionType() {
		return this.transactionType;
	}


	/**
	 * Setter for date
	 */
	public InvoicingPaymentDetail setDate(String date) {
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
	 * Setter for method
	 */
	public InvoicingPaymentDetail setMethod(String method) {
		this.method = method;
		return this;
	}

	/**
	 * Getter for method
	 */
	public String getMethod() {
		return this.method;
	}


	/**
	 * Setter for note
	 */
	public InvoicingPaymentDetail setNote(String note) {
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
