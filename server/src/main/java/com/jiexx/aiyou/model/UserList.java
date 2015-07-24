package com.jiexx.aiyou.model;

public class UserList extends Response{
	public User[] star;
	
	public UserList(Const isRegistered, String md5) {
		au = isRegistered.val();
		code = md5;
	}
}
