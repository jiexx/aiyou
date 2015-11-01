package com.paypal.api.payments;

import java.util.ArrayList;
import java.util.List;

import com.paypal.base.rest.PayPalModel;

public class ItemList  extends PayPalModel {

	/**
	 * List of items.
	 */
	private List<Item> items;

	/**
	 * Shipping address.
	 */
	private ShippingAddress shippingAddress;
	
	/**
	 * Shipping method used for this payment like USPSParcel etc.
	 */
	private String shippingMethod;


	/**
	 * Default Constructor
	 */
	public ItemList() {
		items = new ArrayList<Item>();
	}


	/**
	 * Setter for items
	 */
	public ItemList setItems(List<Item> items) {
		this.items = items;
		return this;
	}

	/**
	 * Getter for items
	 */
	public List<Item> getItems() {
		return this.items;
	}


	/**
	 * Setter for shippingAddress
	 */
	public ItemList setShippingAddress(ShippingAddress shippingAddress) {
		this.shippingAddress = shippingAddress;
		return this;
	}

	/**
	 * Getter for shippingAddress
	 */
	public ShippingAddress getShippingAddress() {
		return this.shippingAddress;
	}

	public String getShippingMethod() {
		return shippingMethod;
	}


	public ItemList setShippingMethod(String shippingMethod) {
		this.shippingMethod = shippingMethod;
		return this;
	}
}
