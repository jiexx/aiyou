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

@Controller
@RequestMapping("/")
@Configuration
@ComponentScan("com.jiexx.aiyou.controller")
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

	@RequestMapping(value = "/reg_sellor.do", params = { "n", "i", "c", "p", "a" }, method = RequestMethod.GET)
	@ResponseBody
	public String reg_sellor(@RequestParam(value = "n") String name, @RequestParam(value = "i") String intro,
			@RequestParam(value = "c") String call, @RequestParam(value = "p") String img,
			@RequestParam(value = "a") String avatar) {
		System.out.println("test");
		Response resp = new Response();

		Integer u = DATA.insertSellor(Long.parseLong(call), name, intro, 0, Util.base64ToBytes(avatar), img);
		if (u != null && u == 1) {
			String md5 = DigestUtils.md5DigestAsHex(String.valueOf(System.currentTimeMillis()).getBytes());
			DATA.updateUser(Long.parseLong(call), md5);
			resp.err = Const.SUCCESS.val();
			resp.au = Const.REGISTERED.val();
			resp.code = md5;
		} else {
			resp.err = Const.FAILED.val();
		}

		return gson.toJson(resp);
	}

	@RequestMapping(value = "/reg_driver.do", params = { "n", "g", "i", "r", "c", "p",
			"a" }, method = RequestMethod.GET)
	@ResponseBody
	public String reg_driver(@RequestParam(value = "n") String name, @RequestParam(value = "g") String gender,
			@RequestParam(value = "i") String intro, @RequestParam(value = "r") String car,
			@RequestParam(value = "c") String call, @RequestParam(value = "p") String img,
			@RequestParam(value = "a") String avatar) {
		System.out.println("test");
		Response resp = new Response();

		Integer u = DATA.insertDriver(Long.parseLong(call), name, gender, intro, car, Const.CLZ_LOVE.str(), 20,
				Util.base64ToBytes(avatar), img);
		if (u != null && u == 1) {
			String md5 = DigestUtils.md5DigestAsHex(String.valueOf(System.currentTimeMillis()).getBytes());
			DATA.updateUser(Long.parseLong(call), md5);
			resp.err = Const.SUCCESS.val();
			resp.au = Const.REGISTERED.val();
			resp.code = md5;
		} else {
			resp.err = Const.FAILED.val();
		}

		return gson.toJson(resp);
	}
}
