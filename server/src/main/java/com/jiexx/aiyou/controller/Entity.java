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
import com.jiexx.aiyou.resp.GameChip;
import com.jiexx.aiyou.resp.GameId;
import com.jiexx.aiyou.resp.Response;
import com.jiexx.aiyou.resp.SellorDetail;
import com.jiexx.aiyou.service.DataService;
import com.jiexx.aiyou.service.GameService;

@Controller
@RequestMapping("/entity")
public class Entity extends DataService {
	@RequestMapping(value = "gqry.do", params = { "id", "id2" }, method = RequestMethod.GET)
	@ResponseBody
	public String gameRoundQry(@RequestParam(value = "id") long id, @RequestParam(value = "id2") long id2 ) {
		//System.out.println("gameRoundQry");
		
		int roundid = GameService.instance.findExistedUser( id );
		Driver d1 = DATA.queryDriverById( id );
		Driver d2 = DATA.queryDriverById( id2 );
		GameId resp = new GameId(roundid, d1.avatar,d2.avatar,d1.name,d2.name,d1.balance, d2.balance);
		if( roundid > -1 ) {
			resp.err = Const.SUCCESS.val();
		}else {
			resp.err = Const.FAILED.val();
		}
		return resp.toResp();
	}
	
	@RequestMapping(value = "dqry.do", params = { "id" }, method = RequestMethod.GET)
	@ResponseBody
	public String detailQry(@RequestParam(value = "id") long id ) {
		System.out.println("detailQry");
		
		Driver d = DATA.queryDriverById( id );
		DriverDetail resp = new DriverDetail();
		if( d != null  ) {
			resp.err = Const.SUCCESS.val();
			resp.copy(d);
			resp.copy(DATA.queryImage(id));
		}else {
			resp.err = Const.FAILED.val();
		}
		return resp.toJson();
	}
	
	@RequestMapping(value = "cqry.do", params = { "id", "myid" }, method = RequestMethod.GET)
	@ResponseBody
	public String chipQry(@RequestParam(value = "id") long id, @RequestParam(value = "myid") long myid  ) {
		System.out.println("chipQry");
		
		int roundid = GameService.instance.findWaitingUser(id);
		GameChip resp = new GameChip();
		if( roundid > -1 ) {
			resp.err = Const.SUCCESS.val();
			Driver d = DATA.queryDriverById( myid );
			resp.chip =  GameService.instance.getRoundChip(roundid);
			resp.enough = d.balance >= resp.chip;
			resp.gid = roundid;
			resp.code = DATA.queryUserCode( myid );
		}else {
			resp.err = Const.FAILED.val();
		}
		return resp.toJson();
	}
	
	@RequestMapping(value = "eqry.do", params = { "id", "chip" }, method = RequestMethod.GET)
	@ResponseBody
	public String enoughQry(@RequestParam(value = "id") long id, @RequestParam(value = "chip") int chip  ) {
		System.out.println("enoughQry");
		
		Driver d = DATA.queryDriverById( id );
		GameChip resp = new GameChip();
		if( d.balance >= chip ) {
			resp.err = Const.SUCCESS.val();
			resp.chip = d.balance;
			resp.enough = true;
		}else {
			resp.err = Const.FAILED.val();
			resp.chip = d.balance;
			resp.enough = false;
			resp.code = DATA.queryUserCode( id );
		}
		return resp.toJson();
	}

	public static class Reg {
		public long id;
		public String n;
		public String a;
		public int s;
		public float lat;
		public float lng;
		public String code;
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
		Integer c = DATA.createUser(call, reg.s+"110", reg.lat, reg.lng, md5);
		Integer u = DATA.insertDriver(call, name, 2, "", "bmw_m3_e92/bmw", 1, 100,avatar, "");
		if (u != null && u == 1 && c != null && c == 1) {
			DATA.updateUser(call, md5);
			DATA.rewardUserByCode(reg.code);
			resp.err = Const.SUCCESS.val();
			resp.au = Const.REGISTERED.val();
			resp.code = md5;
		} else {
			resp.err = Const.FAILED.val();
		}

		return resp.toJson();
	}
}
