package com.jiexx.aiyou.resp;

import com.jiexx.aiyou.model.UserCredit;

public class CreditInfo extends Response{
    public String pwd;
    public int type;
    public String number = null;
    public String email = null;
    
    public CreditInfo(UserCredit uc) {
    	if( uc != null ) {
    		this.type = uc.type;
    		this.number = uc.num.substring(0, 2)+"**************"+uc.num.substring(uc.num.length()-2, uc.num.length()-1);
    	}
    }
}
