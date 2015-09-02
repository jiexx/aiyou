package com.jiexx.aiyou.resp;

public class GameId extends Response{
    public int gid;
    public int balance1;
    public int balance2;
    
	public GameId(int id, int b1, int b2) {
	    gid = id;
	    balance1 = b1;
	    balance2 = b2;
	}
}
