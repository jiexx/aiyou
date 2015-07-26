package com.jiexx.aiyou.resp;

import java.util.List;

import com.jiexx.aiyou.comm.Util;
import com.jiexx.aiyou.model.Const;
import com.jiexx.aiyou.model.User;

public class UserList extends Response{
	public class Star {
	    public String clz;
	    public long id = 0;
	    public int gender;
	    public String avatar;
	    public float x;
	    public float y;
	    public String name;
	}
	public Star[] star;
	
	public UserList() {
		
	}
	
	public UserList(Const isRegistered, String md5) {
		au = isRegistered.val();
		code = md5;
	}
	
	public void clone( List<User> users ) {
		star = new Star[users.size()];
		for( int i = 0 ; i < users.size() ; i ++ ) {
			star[i].clz = users.get(i).clz;
			star[i].id = users.get(i).id;
			star[i].gender = users.get(i).gender;
			star[i].avatar = Util.blobToBase64(users.get(i).avatar);
			star[i].x = users.get(i).x;
			star[i].y = users.get(i).y;
			star[i].name = users.get(i).name;
		}
	}
}
