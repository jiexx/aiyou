package com.paypal.api.payments;

import com.paypal.base.rest.PayPalModel;


public class PayerInfo  extends PayPalModel {

	/**
	 * Email address representing the Payer.
	 */
	private String email;

	/**
	 * External Remember Me id representing the Payer
	 */
	private String externalRememberMeId;

	/**
	 * Account Number representing the Payer
	 */
	private String buyerAccountNumber;

	/**
	 * First Name of the Payer.
	 */
	private String firstName;

	/**
	 * Last Name of the Payer.
	 */
	private String lastName;

	/**
	 * PayPal assigned Payer ID.
	 */
	private String payerId;

	/**
	 * Phone number representing the Payer.
	 */
	private String phone;

	/**
	 * Phone type
	 */
	private String phoneType;

	/**
	 * Birth date of the Payer in ISO8601 format (YYYY-MM-DD).
	 */
	private String birthDate;

	/**
	 * Payer's tax ID.
	 */
	private String taxId;

	/**
	 * Payer's tax ID type.
	 */
	private String taxIdType;

	/**
	 * Billing address of the Payer.
	 */
	private Address billingAddress;

	/**
	 * Obsolete. Use shipping address present in purchase unit.
	 */
	private ShippingAddress shippingAddress;

	/**
	 * Salutation of the Payer.
	 */
	private String salutation;
	
	/**
	 * Middle Name of the Payer.
	 */
	private String middleName;
	
	/**
	 * Suffix of the Payer.
	 */
	private String suffix;
	
	/**
	 * 2 letter registered country code of the payer to identify the buyer country
	 */
	private String countryCode;
	
	/**
	 * Default Constructor
	 */
	public PayerInfo() {
	}


	/**
	 * Setter for email
	 */
	public PayerInfo setEmail(String email) {
		this.email = email;
		return this;
	}

	/**
	 * Getter for email
	 */
	public String getEmail() {
		return this.email;
	}


	/**
	 * Setter for externalRememberMeId
	 */
	public PayerInfo setExternalRememberMeId(String externalRememberMeId) {
		this.externalRememberMeId = externalRememberMeId;
		return this;
	}

	/**
	 * Getter for externalRememberMeId
	 */
	public String getExternalRememberMeId() {
		return this.externalRememberMeId;
	}


	/**
	 * Setter for buyerAccountNumber
	 */
	public PayerInfo setBuyerAccountNumber(String buyerAccountNumber) {
		this.buyerAccountNumber = buyerAccountNumber;
		return this;
	}

	/**
	 * Getter for buyerAccountNumber
	 */
	public String getBuyerAccountNumber() {
		return this.buyerAccountNumber;
	}


	/**
	 * Setter for firstName
	 */
	public PayerInfo setFirstName(String firstName) {
		this.firstName = firstName;
		return this;
	}

	/**
	 * Getter for firstName
	 */
	public String getFirstName() {
		return this.firstName;
	}


	/**
	 * Setter for lastName
	 */
	public PayerInfo setLastName(String lastName) {
		this.lastName = lastName;
		return this;
	}

	/**
	 * Getter for lastName
	 */
	public String getLastName() {
		return this.lastName;
	}


	/**
	 * Setter for payerId
	 */
	public PayerInfo setPayerId(String payerId) {
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
	 * Setter for phone
	 */
	public PayerInfo setPhone(String phone) {
		this.phone = phone;
		return this;
	}

	/**
	 * Getter for phone
	 */
	public String getPhone() {
		return this.phone;
	}


	/**
	 * Setter for phoneType
	 */
	public PayerInfo setPhoneType(String phoneType) {
		this.phoneType = phoneType;
		return this;
	}

	/**
	 * Getter for phoneType
	 */
	public String getPhoneType() {
		return this.phoneType;
	}


	/**
	 * Setter for birthDate
	 */
	public PayerInfo setBirthDate(String birthDate) {
		this.birthDate = birthDate;
		return this;
	}

	/**
	 * Getter for birthDate
	 */
	public String getBirthDate() {
		return this.birthDate;
	}


	/**
	 * Setter for taxId
	 */
	public PayerInfo setTaxId(String taxId) {
		this.taxId = taxId;
		return this;
	}

	/**
	 * Getter for taxId
	 */
	public String getTaxId() {
		return this.taxId;
	}


	/**
	 * Setter for taxIdType
	 */
	public PayerInfo setTaxIdType(String taxIdType) {
		this.taxIdType = taxIdType;
		return this;
	}

	/**
	 * Getter for taxIdType
	 */
	public String getTaxIdType() {
		return this.taxIdType;
	}


	/**
	 * Setter for billingAddress
	 */
	public PayerInfo setBillingAddress(Address billingAddress) {
		this.billingAddress = billingAddress;
		return this;
	}

	/**
	 * Getter for billingAddress
	 */
	public Address getBillingAddress() {
		return this.billingAddress;
	}


	/**
	 * Setter for shippingAddress
	 */
	public PayerInfo setShippingAddress(ShippingAddress shippingAddress) {
		this.shippingAddress = shippingAddress;
		return this;
	}

	/**
	 * Getter for shippingAddress
	 */
	public ShippingAddress getShippingAddress() {
		return this.shippingAddress;
	}


	public String getSalutation() {
		return salutation;
	}


	public PayerInfo setSalutation(String salutation) {
		this.salutation = salutation;
		return this;
	}


	public String getMiddleName() {
		return middleName;
	}


	public PayerInfo setMiddleName(String middleName) {
		this.middleName = middleName;
		return this;
	}


	public String getSuffix() {
		return suffix;
	}


	public PayerInfo setSuffix(String suffix) {
		this.suffix = suffix;
		return this;
	}


	public String getCountryCode() {
		return countryCode;
	}


	public void setCountryCode(String countryCode) {
		this.countryCode = countryCode;
	}

}
