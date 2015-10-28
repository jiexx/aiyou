package com.jiexx.aiyou.resp;

import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;

import org.aspectj.weaver.Utils;

import com.jiexx.aiyou.comm.Util;
import com.jiexx.aiyou.model.Const;
import com.jiexx.aiyou.model.User;
import com.jiexx.aiyou.service.GameService;

public class UserList extends Response{
	public class Star {
	    public String clz;
	    public long id = 0;
	    public int gender;
	    public float x;
	    public float y;
	    public String name;
	    public String thumb;
	}
	public Star[] star;
	
	public UserList() {
		
	}
	
	public UserList(Const isRegistered, String md5) {
		au = isRegistered.val();
		code = md5;
	}
	
	private class Cell {
		public int i;
		public int j;
		public User user;
	}
	
	public void copyFromUserList( List<User> users, long selfid, float lat, float lng ) {
		for( int i = 0 ; i < users.size() ; i ++ ) {
			User user = users.get(i);
			if(user.id == selfid) {
				Util.grid.setOrigin(users.get(i));
				users.remove(i);
				users.add(0, user);
			}
		}
		for( int i = 0 ; i < users.size() ; i ++ ) {
			User user = users.get(i);
			Util.grid.change(user);
		}
		
		star = new Star[users.size()];
		for( int i = 0 ; i < users.size() ; i ++ ) {
			star[i] = new Star();
			star[i].clz = users.get(i).clazz;
			if( star[i].clz != null ) {
				if( star[i].clz.charAt(1) == '1' ) {
					if( GameService.instance.findWaitingUser(users.get(i).id) > -1 )
						star[i].clz = star[i].clz.substring(0, 1)+"1"+ star[i].clz.substring(2);
					else
						star[i].clz = star[i].clz.substring(0, 1)+"2"+ star[i].clz.substring(2);
				}
				if( users.get(i).id == selfid  )
					star[i].clz = "3111";
			}
			star[i].id = users.get(i).id;
			star[i].gender = users.get(i).gender;
			star[i].thumb = users.get(i).avatar;
			star[i].name = users.get(i).name;
			star[i].x = users.get(i).x;
			star[i].y = users.get(i).y;
		}		
	}
}
