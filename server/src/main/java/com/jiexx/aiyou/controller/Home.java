package com.jiexx.aiyou.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import com.jiexx.aiyou.dao.Data;

@Controller
@RequestMapping("/")
public class Home {
	
	private Data data; 

	@RequestMapping(value="home.do", method=RequestMethod.GET)
	@ResponseBody
    public String home(){
		System.out.println("test");
        return "index";
    }
	
}
