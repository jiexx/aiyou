package com.paypal.api.payments.pay;


public class Order {

	private String orderAmount;
	private String orderDesc;
	private String paymentMethod;
	private String paymentIntent;
	private String currency;
	private String returnUrl;
	private String cancelUrl;
	private String shipping;
	private String tax;
	
	
	
	public String getShipping() {
		return shipping;
	}



	public void setShipping(String shipping) {
		this.shipping = shipping;
	}



	public String getTax() {
		return tax;
	}



	public void setTax(String tax) {
		this.tax = tax;
	}



	public String getReturnUrl() {
		return returnUrl;
	}



	public void setReturnUrl(String returnUrl) {
		this.returnUrl = returnUrl;
	}



	public String getCancelUrl() {
		return cancelUrl;
	}



	public void setCancelUrl(String cancelUrl) {
		this.cancelUrl = cancelUrl;
	}



	public String getCurrency() {
		return currency;
	}



	public void setCurrency(String currency) {
		this.currency = currency;
	}


	public String getOrderAmount() {
		return orderAmount;
	}



	public void setOrderAmount(String orderAmount) {
		this.orderAmount = orderAmount;
	}



	public String getOrderDesc() {
		return orderDesc;
	}



	public void setOrderDesc(String orderDesc) {
		this.orderDesc = orderDesc;
	}



	public String getPaymentMethod() {
		return paymentMethod;
	}



	public void setPaymentMethod(String paymentMethod) {
		this.paymentMethod = paymentMethod;
	}



	public String getPaymentIntent() {
		return paymentIntent;
	}



	public void setPaymentIntent(String paymentIntent) {
		this.paymentIntent = paymentIntent;
	}



	@Override
	public String toString() {
		return "Order [ orderAmount="
				+ orderAmount + ", orderDesc=" + orderDesc + ", paymentMethod="
				+ paymentMethod + ", paymentIntent=" + paymentIntent + "]";
	}
	
	
}
