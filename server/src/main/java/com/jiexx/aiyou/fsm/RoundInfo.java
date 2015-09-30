package com.jiexx.aiyou.fsm;

import java.util.HashMap;
import java.util.Map;

public class RoundInfo {
	private static final int  INVALID = 0x0000000f;  
	private static final int  DEALER = 0x0000001f;  
    private static final int  PLAYER = 0x0000002f;   
    
	private int id;
	private int chip;
	private long time;
	
	class UserInfo {
		int state;
		UserInfo(int ep){
			state = ep;
		}
	}
	private Map<Integer, String> transform = new HashMap<Integer, String>();
	private Map<Long, UserInfo> users = new HashMap<Long, UserInfo>();

	public RoundInfo(int id, int chip) {
		this.id = id;
		this.chip =chip;
		this.time = System.currentTimeMillis();
		
		transform.put(DEALER, "dealer");
		transform.put(PLAYER, "player");
	}
	
	public void addUser(long userid) {
		users.put(userid, new UserInfo(INVALID));
	}
	
	public void setUser(long userid, int state) {
		users.get(userid).state = state;
	}
}
