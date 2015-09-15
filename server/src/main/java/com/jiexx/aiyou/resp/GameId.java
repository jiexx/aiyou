package com.jiexx.aiyou.resp;

public class GameId extends Response{
    public int gid;
    public String avatar1;
    public String name1;
    public int balance1;
    public int balance2;
    
	public GameId(int id, String a1, String a2, String n1, String n2, int b1, int b2) {
	    gid = id;
	    avatar1 = a1;
	    name1 = n1;
	    balance1 = b1;
	    balance2 = b2;
	}
}
