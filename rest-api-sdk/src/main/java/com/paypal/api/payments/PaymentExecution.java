package com.paypal.api.payments;

import java.util.List;

import com.paypal.base.rest.PayPalModel;

public class PaymentExecution  extends PayPalModel {

	/**
	 * PayPal assigned Payer ID returned in the approval return url.
	 */
	private String payerId;

	/**
	 * If the amount needs to be updated after obtaining the PayPal Payer info (eg. shipping address), it can be updated using this element.
	 */
	private List<Transactions> transactions;

	/**
	 * Default Constructor
	 */
	public PaymentExecution() {
	}

	/**
	 * Parameterized Constructor
	 */
	public PaymentExecution(String payerId) {
		this.payerId = payerId;
	}


	/**
	 * Setter for payerId
	 */
	public PaymentExecution setPayerId(String payerId) {
		this.payerId = payerId;
		return this;
	}

	/**
	 * Getter for payerId
	 */
	public String getPayerId() {
		return this.payerId;
	}


	/**
	 * Setter for transactions
	 */
	public PaymentExecution setTransactions(List<Transactions> transactions) {
		this.transactions = transactions;
		return this;
	}

	/**
	 * Getter for transactions
	 */
	public List<Transactions> getTransactions() {
		return this.transactions;
	}


}
