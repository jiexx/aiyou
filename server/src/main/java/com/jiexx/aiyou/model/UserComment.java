package com.jiexx.aiyou.model;

import java.sql.Timestamp;

import com.mysql.jdbc.Blob;

public class UserComment {
	public long id = 0;
    public long toid = 0;
    public long uid;
	public String content;
    public int dnd;
    public Timestamp time;
    public String user;
    public String avatar;
}
