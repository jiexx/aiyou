package com.paypal.api.payments.pay;

import java.util.ArrayList;
import java.util.List;

public class ErrorMessage {

	private List<String> messageList = new ArrayList<String>();
	
	public List<String> getMessageList() {
		return messageList;
	}

	public void add(String message) {
		this.messageList.add(message);
	}
	
	public void addList(List<String> list){
		this.messageList.addAll(list);
	}
}
