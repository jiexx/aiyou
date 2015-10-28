package com.jiexx.aiyou.resp;

import java.util.List;

import com.jiexx.aiyou.model.Image;

public class ImageList extends Response{
	public List<Image> imgs;
	public String car;
	public int balance;
	
	public ImageList(List<Image> imgs, String car, int balance) {
		this.imgs = imgs;
		this.car = car;
		this.balance = balance;
	}
}
