package com.jiexx.aiyou.resp;

import java.util.List;

import com.jiexx.aiyou.model.Driver;
import com.jiexx.aiyou.model.Image;

public class DriverDetail extends Response{
    public long id;
    public String name;
    public String car;
    public String avatar;
    public String intro;
    public int balance;
    public int visible; 
    public List<Image> imgs;
	
	public DriverDetail() {
	}
	
	public void copy(Driver d) {
	    id = d.id;
	    name = d.name;
	    car = d.car;
	    avatar = d.avatar.toString();
	    intro = d.intro;
	    balance = d.balance;
	    visible = d.visible; 
	}
	public void copy(List<Image> imgs) {
		this.imgs = imgs;
	}
}
