package com.paypal.api.payments;

import java.util.List;

import com.paypal.base.rest.PayPalModel;

public class Payer  extends PayPalModel {

	/**
	 * Payment method being used - PayPal Wallet payment, Bank Direct Debit  or Direct Credit card.
	 */
	private String paymentMethod;

	/**
	 * Status of Payer PayPal Account.
	 */
	private String status;
	
	/**
	 * Type of account relationship payer has with PayPal.
	 */
	private String accountType;
	
	/**
	 * Duration since the payer established account relationship with PayPal in days.
	 */
	private String accountAge;

	/**
	 * List of funding instruments from where the funds of the current payment come from. Typically a credit card.
	 */
	private List<FundingInstrument> fundingInstruments;

	/**
	 * Id of user selected funding option for the payment. 'OneOf' funding_instruments or funding_option_id to be present 
	 */
	private String fundingOptionId;

	/**
	 * Information related to the Payer. 
	 */
	private PayerInfo payerInfo;

	/**
	 * Default Constructor
	 */
	public Payer() {
	}

	/**
	 * Parameterized Constructor
	 */
	public Payer(String paymentMethod) {
		this.paymentMethod = paymentMethod;
	}


	/**
	 * Setter for paymentMethod
	 */
	public Payer setPaymentMethod(String paymentMethod) {
		this.paymentMethod = paymentMethod;
		return this;
	}

	/**
	 * Getter for paymentMethod
	 */
	public String getPaymentMethod() {
		return this.paymentMethod;
	}


	/**
	 * Setter for status
	 */
	public Payer setStatus(String status) {
		this.status = status;
		return this;
	}

	/**
	 * Getter for status
	 */
	public String getStatus() {
		return this.status;
	}

	public String getAccountType() {
		return accountType;
	}

	public void setAccountType(String accountType) {
		this.accountType = accountType;
	}

	public String getAccountAge() {
		return accountAge;
	}

	public void setAccountAge(String accountAge) {
		this.accountAge = accountAge;
	}


	/**
	 * Setter for fundingInstruments
	 */
	public Payer setFundingInstruments(List<FundingInstrument> fundingInstruments) {
		this.fundingInstruments = fundingInstruments;
		return this;
	}

	/**
	 * Getter for fundingInstruments
	 */
	public List<FundingInstrument> getFundingInstruments() {
		return this.fundingInstruments;
	}


	/**
	 * Setter for fundingOptionId
	 */
	public Payer setFundingOptionId(String fundingOptionId) {
		this.fundingOptionId = fundingOptionId;
		return this;
	}

	/**
	 * Getter for fundingOptionId
	 */
	public String getFundingOptionId() {
		return this.fundingOptionId;
	}


	/**
	 * Setter for payerInfo
	 */
	public Payer setPayerInfo(PayerInfo payerInfo) {
		this.payerInfo = payerInfo;
		return this;
	}

	/**
	 * Getter for payerInfo
	 */
	public PayerInfo getPayerInfo() {
		return this.payerInfo;
	}


}
