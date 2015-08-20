package com.jiexx.aiyou.controller;

import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.stereotype.Controller;
import org.springframework.util.DigestUtils;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.jiexx.aiyou.comm.Util;
import com.jiexx.aiyou.model.Const;
import com.jiexx.aiyou.model.Driver;
import com.jiexx.aiyou.model.Sellor;
import com.jiexx.aiyou.resp.DriverDetail;
import com.jiexx.aiyou.resp.Response;
import com.jiexx.aiyou.resp.SellorDetail;
import com.jiexx.aiyou.service.DataService;
import com.mysql.jdbc.Blob;

//@Controller
@RequestMapping("/")
public class Entity extends DataService {
	@RequestMapping(value = "/entity.do", params = { "eid", "t" }, method = RequestMethod.GET)
	@ResponseBody
	public String entity(@RequestParam(value = "eid") long eid, @RequestParam(value = "t") int type) {
		System.out.println("test");
		Response resp = null;

		if (type == Const.CLZ_SHOP.val()) {
			Sellor s = DATA.querySellorById(eid);
			resp = new SellorDetail(s);
		} else if (type == Const.CLZ_USER.val()) {
			Driver d = DATA.queryDriverById(eid);
			resp = new DriverDetail(d);
		}

		if (resp == null) {
			resp = new Response();
			resp.err = Const.FAILED.val();
		}

		return gson.toJson(resp);
	}

	@RequestMapping(value = "/reg.do", params = { "id", "n", "a" }, method = RequestMethod.GET)
	@ResponseBody
	public String register(@RequestParam(value = "n") String name, 
			@RequestParam(value = "id") long call,
			@RequestParam(value = "a") String avatar) {
		System.out.println("test");
		Response resp = new Response();

		Integer u = DATA.insertDriver(call, name, 2, "", "bmw_m3_e92/bmw", 1, 100,avatar, "");
		if (u != null && u == 1) {
			String md5 = DigestUtils.md5DigestAsHex(String.valueOf(System.currentTimeMillis()).getBytes());
			DATA.updateUser(call, md5);
			resp.err = Const.SUCCESS.val();
			resp.au = Const.REGISTERED.val();
			resp.code = md5;
		} else {
			resp.err = Const.FAILED.val();
		}

		return "angular.callbacks._0("+gson.toJson(resp)+")";
	}
}
