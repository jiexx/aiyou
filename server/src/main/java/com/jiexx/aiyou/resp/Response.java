package com.jiexx.aiyou.resp;

import com.jiexx.aiyou.comm.Util;
import com.jiexx.aiyou.model.Const;

public class Response {
	public int err = Const.SUCCESS.val();
    public int au = Const.UNREGISTERED.val();
    public String code;
    public String toResp() {
    	return Util.toResp(this);
    }
}
