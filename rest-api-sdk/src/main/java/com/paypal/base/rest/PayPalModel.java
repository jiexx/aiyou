package com.paypal.base.rest;

public class PayPalModel {
	
	/**
	 * Returns a JSON string corresponding to object state
	 *
	 * @return JSON representation
	 */
	public String toJSON() {
		return JSONFormatter.toJSON(this);
	}

	@Override
	public String toString() {
		return toJSON();
	}
	
	@Override
	public boolean equals(Object obj) {
		if (obj == null) return false;
	    if (obj == this) return true;
	    if (!(obj instanceof PayPalModel))return false;
	    PayPalModel objClass = (PayPalModel)obj;
	    if (objClass.toJSON() == toJSON()) return true;
	    return false;
	}
	
	@Override
	public int hashCode() {
		return 31 + toJSON().hashCode();
	}
}
