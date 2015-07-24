package com.jiexx.aiyou.service;

import com.jiexx.aiyou.dao.Data;

import org.springframework.beans.factory.annotation.Autowired;

import com.google.gson.Gson;

public class DataService {
	protected static Gson gson = new Gson();
	@Autowired
	protected Data DATA; 
	public void setData(Data d) {
		System.out.println("test  "+d);
		this.DATA = d;
	}
}
