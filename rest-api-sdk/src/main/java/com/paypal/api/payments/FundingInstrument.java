package com.paypal.api.payments;

import com.paypal.base.rest.PayPalModel;


public class FundingInstrument  extends PayPalModel {

	/**
	 * Credit Card information.
	 */
	private CreditCard creditCard;

	/**
	 * Credit Card information.
	 */
	private CreditCardToken creditCardToken;

	/**
	 * Payment Card information.
	 */
	private PaymentCard paymentCard;

	/**
	 * Payment card token information.
	 */
	private PaymentCardToken paymentCardToken;

	/**
	 * Bank Account information.
	 */
	private ExtendedBankAccount bankAccount;

	/**
	 * Bank Account information.
	 */
	private BankToken bankAccountToken;

	/**
	 * Credit funding information.
	 */
	private Credit credit;

	/**
	 * Default Constructor
	 */
	public FundingInstrument() {
	}


	/**
	 * Setter for creditCard
	 */
	public FundingInstrument setCreditCard(CreditCard creditCard) {
		this.creditCard = creditCard;
		return this;
	}

	/**
	 * Getter for creditCard
	 */
	public CreditCard getCreditCard() {
		return this.creditCard;
	}


	/**
	 * Setter for creditCardToken
	 */
	public FundingInstrument setCreditCardToken(CreditCardToken creditCardToken) {
		this.creditCardToken = creditCardToken;
		return this;
	}

	/**
	 * Getter for creditCardToken
	 */
	public CreditCardToken getCreditCardToken() {
		return this.creditCardToken;
	}


	/**
	 * Setter for paymentCard
	 */
	public FundingInstrument setPaymentCard(PaymentCard paymentCard) {
		this.paymentCard = paymentCard;
		return this;
	}

	/**
	 * Getter for paymentCard
	 */
	public PaymentCard getPaymentCard() {
		return this.paymentCard;
	}


	/**
	 * Setter for paymentCardToken
	 */
	public FundingInstrument setPaymentCardToken(PaymentCardToken paymentCardToken) {
		this.paymentCardToken = paymentCardToken;
		return this;
	}

	/**
	 * Getter for paymentCardToken
	 */
	public PaymentCardToken getPaymentCardToken() {
		return this.paymentCardToken;
	}


	/**
	 * Setter for bankAccount
	 */
	public FundingInstrument setBankAccount(ExtendedBankAccount bankAccount) {
		this.bankAccount = bankAccount;
		return this;
	}

	/**
	 * Getter for bankAccount
	 */
	public ExtendedBankAccount getBankAccount() {
		return this.bankAccount;
	}


	/**
	 * Setter for bankAccountToken
	 */
	public FundingInstrument setBankAccountToken(BankToken bankAccountToken) {
		this.bankAccountToken = bankAccountToken;
		return this;
	}

	/**
	 * Getter for bankAccountToken
	 */
	public BankToken getBankAccountToken() {
		return this.bankAccountToken;
	}


	/**
	 * Setter for credit
	 */
	public FundingInstrument setCredit(Credit credit) {
		this.credit = credit;
		return this;
	}

	/**
	 * Getter for credit
	 */
	public Credit getCredit() {
		return this.credit;
	}


}
