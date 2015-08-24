package com.jiexx.aiyou.controller;


import org.springframework.stereotype.Controller;
import org.springframework.util.DigestUtils;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.jiexx.aiyou.model.Const;
import com.jiexx.aiyou.model.Driver;
import com.jiexx.aiyou.model.Sellor;
import com.jiexx.aiyou.resp.DriverDetail;
import com.jiexx.aiyou.resp.GameId;
import com.jiexx.aiyou.resp.Response;
import com.jiexx.aiyou.resp.SellorDetail;
import com.jiexx.aiyou.service.DataService;
import com.jiexx.aiyou.service.GameService;

@Controller
@RequestMapping("/entity")
public class Entity extends DataService {
	@RequestMapping(value = "gqry.do", params = { "id" }, method = RequestMethod.GET)
	@ResponseBody
	public String entity(@RequestParam(value = "id") long id ) {
		System.out.println("query");
		
		int toid = GameService.instance.findUser(id);
		GameId resp = new GameId(toid);
		if( toid > -1 ) {
			resp.err = Const.SUCCESS.val();
			resp.au = Const.REGISTERED.val();
		}else {
			resp.err = Const.FAILED.val();
			resp.au = Const.REGISTERED.val();
		}
		return resp.toResp();
	}

	public static class Reg {
		public long id;
		public String n;
		public String a;
		public int s;
		public float lat;
		public float lng;
		public Reg() {
	    }
	}
	
	@RequestMapping(value = "reg.do", method = RequestMethod.POST)
	@ResponseBody
	public String register(@RequestBody Reg reg) {
		System.out.println("register");
		Response resp = new Response();
		long call = reg.id;
		String name = reg.n;
		String avatar = reg.a;
		
		if( call < 13000000000L || reg.s > 3 || avatar.length() == 0 ) {
			resp.err = Const.FAILED.val();
			return resp.toJson();
		}
		
		Integer n = DATA.existUser(call);
		Integer m = DATA.existDriver(call);
		if( m != null ||  n != null  ) {
			resp.err = Const.FAILED.val();
			resp.au = Const.REGISTERED.val();
			return resp.toJson();
		}

		String md5 = DigestUtils.md5DigestAsHex(String.valueOf(System.currentTimeMillis()).getBytes());
		Integer c = DATA.createUser(call, reg.s+"100", reg.lat, reg.lng, md5);
		Integer u = DATA.insertDriver(call, name, 2, "", "bmw_m3_e92/bmw", 1, 100,avatar, "");
		if (u != null && u == 1 && c != null && c == 1) {
			DATA.updateUser(call, md5);
			resp.err = Const.SUCCESS.val();
			resp.au = Const.REGISTERED.val();
			resp.code = md5;
		} else {
			resp.err = Const.FAILED.val();
		}

		return resp.toJson();
	}
}
