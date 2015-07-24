package com.jiexx.aiyou.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;
import org.springframework.stereotype.Controller;
import org.springframework.util.DigestUtils;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.context.support.WebApplicationContextUtils;

import com.jiexx.aiyou.comm.LB;
import com.jiexx.aiyou.model.Const;
import com.jiexx.aiyou.model.Response;
import com.jiexx.aiyou.model.User;
import com.jiexx.aiyou.model.UserList;
import com.jiexx.aiyou.service.DataService;

@Controller
@RequestMapping("/")
public class Home extends DataService {
	
	@Autowired
	private ApplicationContext appContext;
	
	@RequestMapping(value="home.do", params = {"id", "lat", "lon"}, method=RequestMethod.GET)
	@ResponseBody
    public String home(
    		@RequestParam(value = "id") long id, 
    		@RequestParam(value = "lat") float lat, 
    		@RequestParam(value = "lon") float lon)
	{
		System.out.println("test  "+DATA);
		//System.out.println(appContext.getClassLoader().getResource("jdbc.properties"));
		
		UserList resp;
		Integer sellor = DATA.querySellor(id);
		Integer driver = DATA.queryDriver(id);
		Integer user = DATA.queryUser(id);
		System.out.println("test  "+sellor);
		String md5 = DigestUtils.md5DigestAsHex(String.valueOf(System.currentTimeMillis()).getBytes());
		if( user == null ) {
			System.out.println("test1");
			resp = new UserList(Const.UNREGISTERED, md5);
			DATA.createUser(id, Const.CLZ_COMMON.str(), lat, lon, md5);
		}else if( sellor != null && driver != null ) {
			System.out.println("test2");
			resp = new UserList(Const.UNREGISTERED, md5);
			DATA.updateUser(id, lat, lon, md5);
		}else {
			resp = new UserList(Const.REGISTERED, md5);
			DATA.updateUser(id, lat, lon, md5);
		}
		
		LB lb = new LB(lat, lon);
		System.out.println(" "+lb.lat_start+ " "+ lb.lat_end+ " "+ lb.lon_start+ " "+  lb.lon_end);
		
		List<User> s = DATA.querySellorByLoc(lb.lat_start, lb.lat_end, lb.lon_start, lb.lon_end);
		List<User> d = DATA.queryDriverByLoc(lb.lat_start, lb.lat_end, lb.lon_start, lb.lon_end);
		
		s.addAll(d);
		
		resp.star = new User[s.size()];
		resp.star = s.toArray(resp.star);
			
        return gson.toJson(resp);
    }
	
	@RequestMapping(value="/home/donotdisturb.do", params = {"id"}, method=RequestMethod.GET)
	@ResponseBody
    public String donotdisturb(
    		@RequestParam(value = "id") long id)
	{
		System.out.println("test");
		Response resp = new Response();
		resp.au = Const.REGISTERED.val();
		
		if( DATA.toggleClass(id) != 0 )
			resp.err = Const.FAILED.val();
			
        return gson.toJson(resp);
    }
	
}
