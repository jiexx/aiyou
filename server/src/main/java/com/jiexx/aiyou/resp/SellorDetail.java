package com.jiexx.aiyou.resp;

import com.jiexx.aiyou.model.Sellor;

public class SellorDetail extends Response{
    public long id;
    public String name;
    public String img;
    public String intro;
    public String call;
    public String uavatar;
    public String ucomment; 
	
	public SellorDetail(Sellor d) {
	    id = d.id;
	    name = d.name;
	    img = d.img;
	    intro = d.intro;
	    call = d.call;
	    uavatar = d.uavatar.toString();
	    ucomment = d.ucomment.toString(); 
	}
}
