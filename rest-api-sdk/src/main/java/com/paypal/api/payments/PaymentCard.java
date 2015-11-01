package com.paypal.api.payments;

import java.util.List;

import com.paypal.base.rest.PayPalModel;

public class PaymentCard  extends PayPalModel {

	/**
	 * ID of the credit card being saved for later use.
	 */
	private String id;

	/**
	 * Card number.
	 */
	private String number;

	/**
	 * Type of the Card.
	 */
	private String type;

	/**
	 * 2 digit card expiry month.
	 */
	private int expireMonth;

	/**
	 * 4 digit card expiry year
	 */
	private int expireYear;

	/**
	 * 2 digit card start month.
	 */
	private int startMonth;

	/**
	 * 4 digit card start year.
	 */
	private int startYear;

	/**
	 * Card validation code. Only supported when making a Payment but not when saving a payment card for future use.
	 */
	private int cvv2;

	/**
	 * Card holder's first name.
	 */
	private String firstName;

	/**
	 * Card holder's last name.
	 */
	private String lastName;

	/**
	 * Billing Address associated with this card.
	 */
	private Address billingAddress;

	/**
	 * A unique identifier of the customer to whom this card account belongs to. Generated and provided by the facilitator. This is required when creating or using a stored funding instrument in vault.
	 */
	private String externalCustomerId;

	/**
	 * State of the funding instrument.
	 */
	private String status;

	/**
	 * Date/Time until this resource can be used fund a payment.
	 */
	private String validUntil;

	/**
	 * 
	 */
	private List<Links> links;

	/**
	 * Default Constructor
	 */
	public PaymentCard() {
	}

	/**
	 * Parameterized Constructor
	 */
	public PaymentCard(String number, String type, int expireMonth, int expireYear) {
		this.number = number;
		this.type = type;
		this.expireMonth = expireMonth;
		this.expireYear = expireYear;
	}


	/**
	 * Setter for id
	 */
	public PaymentCard setId(String id) {
		this.id = id;
		return this;
	}

	/**
	 * Getter for id
	 */
	public String getId() {
		return this.id;
	}


	/**
	 * Setter for number
	 */
	public PaymentCard setNumber(String number) {
		this.number = number;
		return this;
	}

	/**
	 * Getter for number
	 */
	public String getNumber() {
		return this.number;
	}


	/**
	 * Setter for type
	 */
	public PaymentCard setType(String type) {
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
	 * Setter for expireMonth
	 */
	public PaymentCard setExpireMonth(int expireMonth) {
		this.expireMonth = expireMonth;
		return this;
	}

	/**
	 * Getter for expireMonth
	 */
	public int getExpireMonth() {
		return this.expireMonth;
	}


	/**
	 * Setter for expireYear
	 */
	public PaymentCard setExpireYear(int expireYear) {
		this.expireYear = expireYear;
		return this;
	}

	/**
	 * Getter for expireYear
	 */
	public int getExpireYear() {
		return this.expireYear;
	}


	/**
	 * Setter for startMonth
	 */
	public PaymentCard setStartMonth(int startMonth) {
		this.startMonth = startMonth;
		return this;
	}

	/**
	 * Getter for startMonth
	 */
	public int getStartMonth() {
		return this.startMonth;
	}


	/**
	 * Setter for startYear
	 */
	public PaymentCard setStartYear(int startYear) {
		this.startYear = startYear;
		return this;
	}

	/**
	 * Getter for startYear
	 */
	public int getStartYear() {
		return this.startYear;
	}


	/**
	 * Setter for cvv2
	 */
	public PaymentCard setCvv2(int cvv2) {
		this.cvv2 = cvv2;
		return this;
	}

	/**
	 * Getter for cvv2
	 */
	public int getCvv2() {
		return this.cvv2;
	}


	/**
	 * Setter for firstName
	 */
	public PaymentCard setFirstName(String firstName) {
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
	public PaymentCard setLastName(String lastName) {
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
	 * Setter for billingAddress
	 */
	public PaymentCard setBillingAddress(Address billingAddress) {
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
	 * Setter for externalCustomerId
	 */
	public PaymentCard setExternalCustomerId(String externalCustomerId) {
		this.externalCustomerId = externalCustomerId;
		return this;
	}

	/**
	 * Getter for externalCustomerId
	 */
	public String getExternalCustomerId() {
		return this.externalCustomerId;
	}


	/**
	 * Setter for status
	 */
	public PaymentCard setStatus(String status) {
		this.status = status;
		return this;
	}

	/**
	 * Getter for status
	 */
	public String getStatus() {
		return this.status;
	}


	/**
	 * Setter for validUntil
	 */
	public PaymentCard setValidUntil(String validUntil) {
		this.validUntil = validUntil;
		return this;
	}

	/**
	 * Getter for validUntil
	 */
	public String getValidUntil() {
		return this.validUntil;
	}


	/**
	 * Setter for links
	 */
	public PaymentCard setLinks(List<Links> links) {
		this.links = links;
		return this;
	}

	/**
	 * Getter for links
	 */
	public List<Links> getLinks() {
		return this.links;
	}


}
