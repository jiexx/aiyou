package com.jiexx.aiyou.resp;

import com.jiexx.aiyou.comm.Util;
import com.jiexx.aiyou.model.Const;

public class Response {
	public int err = Const.FAILED.val();
    public int au = Const.UNREGISTERED.val();
    public String code;
    
    public void success() {
    	err = Const.SUCCESS.val();
    }
    
    public String toResp() {
    	return Util.toJson(this);
    }
    public String toJson() {
    	return Util.toJson(this);
    }
}
