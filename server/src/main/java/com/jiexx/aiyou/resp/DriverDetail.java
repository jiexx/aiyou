package com.jiexx.aiyou.resp;

import com.jiexx.aiyou.model.Driver;

public class DriverDetail extends Response{
    public long id;
    public String name;
    public int car;
    public String avatar;
    public String intro;
    public int balance;
    public int visible; 
	
	public DriverDetail(Driver d) {
	    id = d.id;
	    name = d.name;
	    car = d.car;
	    avatar = d.avatar.toString();
	    intro = d.intro;
	    balance = d.balance;
	    visible = d.visible; 
	}
}
