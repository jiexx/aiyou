package com.jiexx.aiyou.resp;

import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;

import com.jiexx.aiyou.comm.Util;
import com.jiexx.aiyou.model.Const;
import com.jiexx.aiyou.model.User;
import com.jiexx.aiyou.service.GameService;

public class UserList extends Response{
	public class Star {
	    public String clz;
	    public long id = 0;
	    public int gender;
	    public String img;
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
	private class Grid {
		private static final float cellx = 0.001f;
		private static final float celly = 0.001f;
		private static final int level = 2;
		private int[][] step;
		private float originX;
		private float originY;
		private HashMap<Long, User> cells = new HashMap<Long, User>();
		public Grid() {
			int size = 2*level+1;
			step = new int[size*size][2];
			for(int i = 0 ; i < level ; i ++) {
			}
		}
		public void setOrigin(User user) {
			originX = user.x;
			originY = user.y;
			put(user);
		}
		public int getPosX(User user) {
			return (int) Math.floor((user.x - originX) / cellx);
		}
		public int getPosY(User user) {
			return (int) Math.floor((user.y - originY) / celly);
		}
		public void put(User user) {
			long i = getPosX(user);
			long j = getPosY(user);
			cells.put(i<<32 | j, user);
		}
		public User get(int x, int y) {
			long i = x;
			long j = y;
			return cells.get(i<<32 | j);
		}
		public User add(User user) {
			int x = getPosX(user);
			int y = getPosY(user);
			int k = 0;
			while(get(x+step[k][0], y+step[k][1]) != null && k++ < 9) ;
			if(k < 9){}
		}
	}
	
	public void fixcopy( List<User> users, long selfid, float lat, float lng ) {
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
			star[i].img = users.get(i).img;
			star[i].thumb = users.get(i).avatar;
			if( users.get(i).x - lat < 0.001f && users.get(i).x - lat > -0.001f && users.get(i).y - lng < 0.001f && users.get(i).y - lng > -0.001f && users.get(i).id != selfid){
				star[i].x = users.get(i).x + 0.003f;
				star[i].y = users.get(i).y + 0.003f;
			}else {
				star[i].x = users.get(i).x;
				star[i].y = users.get(i).y;
			}
			star[i].name = users.get(i).name;
		}
	}
}
