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
@RequestMapping("/")
public class Home extends DataService {
	
	@Autowired
	private ApplicationContext appContext;
	
	@RequestMapping(value="home.do", params = {"id", "lat", "lng"}, method=RequestMethod.GET)
	@ResponseBody
    public String home(
    		@RequestParam(value = "id") long id, 
    		@RequestParam(value = "lat") float lat, 
    		@RequestParam(value = "lng") float lng)
	{
		//System.out.println(appContext.getClassLoader().getResource("jdbc.properties"));
		
		UserList resp = new UserList();
		Integer sellor = DATA.existSellor(id);
		Integer driver = DATA.existDriver(id);
		Integer user = DATA.existUser(id);
		Util.log(" "+id, " "+sellor);
		String md5 = DigestUtils.md5DigestAsHex(String.valueOf(System.currentTimeMillis()).getBytes());
		if( user == null ) {
			System.out.println("test1");
			resp = new UserList(Const.UNREGISTERED, md5);
		}else if( user != null ) {
			resp = new UserList(Const.REGISTERED, md5);
			DATA.updateLocByUser(id, lat, lng);
		}else if( driver != null && sellor == null ) {
			System.out.println("test2");
			resp = new UserList(Const.REGISTERED, md5);
			DATA.updateLocByUser(id, lat, lng);
		}else if( sellor != null && driver == null ){
			resp = new UserList(Const.REGISTERED, md5);
			DATA.updateUser(id, md5);
		}else {
			resp = new UserList();
			resp.err = Const.FAILED.val();
			return resp.toResp();
		}
		
		LB lb = new LB(lat, lng);
		
		List<User> s = DATA.querySellorByLoc(lb.lat_start, lb.lat_end, lb.lng_start, lb.lng_end);
		List<User> d = DATA.queryDriverByLoc(lb.lat_start, lb.lat_end, lb.lng_start, lb.lng_end);
		
		s.addAll(d);
		
		resp.fixcopy(s, id, lat, lng);
			
        return resp.toResp();
    }
	
	@RequestMapping(value="/home/donotdisturb.do", params = {"id"}, method=RequestMethod.GET)
	@ResponseBody
    public String donotdisturb(
    		@RequestParam(value = "id") long id)
	{
		System.out.println("test");
		Response resp = new Response();
		
		if( DATA.toggleClass(id) != 0 )
			resp.err = Const.FAILED.val();
			
        return resp.toResp();
    }
	
}
