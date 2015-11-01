package com.paypal.api.payments;

import com.paypal.base.rest.PayPalModel;


public class Transactions  extends PayPalModel {

	/**
	 * Amount being collected.
	 */
	private Amount amount;

	/**
	 * Default Constructor
	 */
	public Transactions() {
	}

	/**
	 * Parameterized Constructor
	 */
	public Transactions(Amount amount) {
		this.amount = amount;
	}


	/**
	 * Setter for amount
	 */
	public Transactions setAmount(Amount amount) {
		this.amount = amount;
		return this;
	}

	/**
	 * Getter for amount
	 */
	public Amount getAmount() {
		return this.amount;
	}


}
