package com.jiexx.aiyou.model;

public class UserCredit {
	public long id;
	public String num;
	public String name;
	public String exp;
	public int ccv;
	public int type;
	public String email = null;
	
	public UserCredit() {
		
	}
	
	public UserCredit(long id, String num, String name, String exp, int ccv, int type ) {
		this.id = id;
		this.num = num;
		this.name = name;
		this.exp = exp;
		this.ccv = ccv;
		this.type = type;
	}
}
