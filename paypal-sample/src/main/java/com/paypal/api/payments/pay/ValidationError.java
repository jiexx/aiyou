package com.paypal.api.payments.pay;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class ValidationError {

	private String name;
	private ValidationErrorDetails[] details;
	
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public ValidationErrorDetails[] getDetails() {
		return details;
	}
	public void setDetails(ValidationErrorDetails[] details) {
		this.details = details;
	}
	
	public List<String> getValidationErrorList(){
		List<String> errorList = new ArrayList<String>();
		for(ValidationErrorDetails dtls:details){
			errorList.add(dtls.getField() +" : "+dtls.getIssue());
		}
		return errorList;
	}
	@Override
	public String toString() {
		return "ValidationError [name=" + name + ", details="
				+ Arrays.toString(details) + "]";
	}
	
	
	
}
