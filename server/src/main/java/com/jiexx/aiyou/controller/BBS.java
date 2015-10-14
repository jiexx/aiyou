package com.jiexx.aiyou.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.support.ClassPathXmlApplicationContext;
import org.springframework.stereotype.Controller;
import org.springframework.util.DigestUtils;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.context.support.WebApplicationContextUtils;

import com.jiexx.aiyou.comm.LB;
import com.jiexx.aiyou.comm.Util;
import com.jiexx.aiyou.model.Const;
import com.jiexx.aiyou.model.User;
import com.jiexx.aiyou.resp.Response;
import com.jiexx.aiyou.resp.UserList;
import com.jiexx.aiyou.service.DataService;

@Controller
@RequestMapping("/bbs")
public class BBS extends DataService {
	
	@Autowired
	private ApplicationContext appContext;
	
	@RequestMapping(value="user.do", params = {"id"}, method=RequestMethod.GET)
	@ResponseBody
    public String bbs(
    		@RequestParam(value = "id") long id)
	{
		//System.out.println(appContext.getClassLoader().getResource("jdbc.properties"));
		
		UserList resp = new UserList();

			
        return resp.toResp();
    }
	
}
