package com.paypal.api.payments;

import com.paypal.base.rest.PayPalModel;


public class CartBase  extends PayPalModel {

	/**
	 * Amount being collected.
	 */
	private Amount amount;

	/**
	 * Recipient of the funds in this transaction.
	 */
	private Payee payee;

	/**
	 * Description of what is being paid for.
	 */
	private String description;

	/**
	 * Note to the recipient of the funds in this transaction.
	 */
	private String noteToPayee;

	/**
	 * free-form field for the use of clients
	 */
	private String custom;

	/**
	 * invoice number to track this payment
	 */
	private String invoiceNumber;

	/**
	 * Soft descriptor used when charging this funding source.
	 */
	private String softDescriptor;

	/**
	 * Payment options requested for this purchase unit
	 */
	private PaymentOptions paymentOptions;

	/**
	 * List of items being paid for.
	 */
	private ItemList itemList;
	
	/**
	 * URL to send payment notifications
	 */
	private String notifyUrl;

	/**
	 * Url on merchant site pertaining to this payment.
	 */
	private String orderUrl;

	/**
	 * Default Constructor
	 */
	public CartBase() {
	}


	/**
	 * Setter for amount
	 */
	public CartBase setAmount(Amount amount) {
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
	 * Setter for payee
	 */
	public CartBase setPayee(Payee payee) {
		this.payee = payee;
		return this;
	}

	/**
	 * Getter for payee
	 */
	public Payee getPayee() {
		return this.payee;
	}


	/**
	 * Setter for description
	 */
	public CartBase setDescription(String description) {
		this.description = description;
		return this;
	}

	/**
	 * Getter for description
	 */
	public String getDescription() {
		return this.description;
	}


	/**
	 * Setter for noteToPayee
	 */
	public CartBase setNoteToPayee(String noteToPayee) {
		this.noteToPayee = noteToPayee;
		return this;
	}

	/**
	 * Getter for noteToPayee
	 */
	public String getNoteToPayee() {
		return this.noteToPayee;
	}


	/**
	 * Setter for custom
	 */
	public CartBase setCustom(String custom) {
		this.custom = custom;
		return this;
	}

	/**
	 * Getter for custom
	 */
	public String getCustom() {
		return this.custom;
	}


	/**
	 * Setter for invoiceNumber
	 */
	public CartBase setInvoiceNumber(String invoiceNumber) {
		this.invoiceNumber = invoiceNumber;
		return this;
	}

	/**
	 * Getter for invoiceNumber
	 */
	public String getInvoiceNumber() {
		return this.invoiceNumber;
	}


	/**
	 * Setter for softDescriptor
	 */
	public CartBase setSoftDescriptor(String softDescriptor) {
		this.softDescriptor = softDescriptor;
		return this;
	}

	/**
	 * Getter for softDescriptor
	 */
	public String getSoftDescriptor() {
		return this.softDescriptor;
	}


	/**
	 * Setter for paymentOptions
	 */
	public CartBase setPaymentOptions(PaymentOptions paymentOptions) {
		this.paymentOptions = paymentOptions;
		return this;
	}

	/**
	 * Getter for paymentOptions
	 */
	public PaymentOptions getPaymentOptions() {
		return this.paymentOptions;
	}


	/**
	 * Setter for itemList
	 */
	public CartBase setItemList(ItemList itemList) {
		this.itemList = itemList;
		return this;
	}

	/**
	 * Getter for itemList
	 */
	public ItemList getItemList() {
		return this.itemList;
	}

	
	public String getNotifyUrl() {
		return notifyUrl;
	}


	public CartBase setNotifyUrl(String notifyUrl) {
		this.notifyUrl = notifyUrl;
		return this;
	}


	public String getOrderUrl() {
		return orderUrl;
	}


	public CartBase setOrderUrl(String orderUrl) {
		this.orderUrl = orderUrl;
		return this;
	}

}
