package com.paypal.api.payments;

import com.paypal.base.rest.PayPalModel;


public class Item  extends PayPalModel {

	/**
	 * Number of items.
	 */
	private String quantity;

	/**
	 * Name of the item.
	 */
	private String name;

	/**
	 * Cost of the item.
	 */
	private String price;

    /**
     * Tax associated with the item.
     */
    private String tax;

	/**
	 * 3-letter Currency Code
	 */
	private String currency;

	/**
	 * Number or code to identify the item in your catalog/records.
	 */
	private String sku;
	
	/**
	 * Weight of the item.
	 */
	private Measurement weight;
	
	/**
	 * Length of the item.
	 */
	private Measurement length;
	
	/**
	 * Height of the item.
	 */
	private Measurement height;
	
	/**
	 * Width of the item
	 */
	private Measurement width;

	/**
	 * Default Constructor
	 */
	public Item() {
	}

	/**
	 * Parameterized Constructor
	 */
	public Item(String quantity, String name, String price, String currency) {
		this.quantity = quantity;
		this.name = name;
		this.price = price;
		this.currency = currency;
	}


	/**
	 * Setter for quantity
	 */
	public Item setQuantity(String quantity) {
		this.quantity = quantity;
		return this;
	}

	/**
	 * Getter for quantity
	 */
	public String getQuantity() {
		return this.quantity;
	}


	/**
	 * Setter for name
	 */
	public Item setName(String name) {
		this.name = name;
		return this;
	}

	/**
	 * Getter for name
	 */
	public String getName() {
		return this.name;
	}


	/**
	 * Setter for price
	 */
	public Item setPrice(String price) {
		this.price = price;
		return this;
	}

	/**
	 * Getter for price
	 */
	public String getPrice() {
		return this.price;
	}

    /**
     * Getter for tax
     */
    public String getTax() {
        return tax;
    }

    /**
     * Setter for tax
     */
    public void setTax(String tax) {
        this.tax = tax;
    }

    /**
	 * Setter for currency
	 */
	public Item setCurrency(String currency) {
		this.currency = currency;
		return this;
	}

	/**
	 * Getter for currency
	 */
	public String getCurrency() {
		return this.currency;
	}


	/**
	 * Setter for sku
	 */
	public Item setSku(String sku) {
		this.sku = sku;
		return this;
	}

	/**
	 * Getter for sku
	 */
	public String getSku() {
		return this.sku;
	}


}