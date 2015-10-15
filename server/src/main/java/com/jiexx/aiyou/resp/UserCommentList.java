package com.jiexx.aiyou.resp;

import java.util.List;

import com.jiexx.aiyou.model.UserComment;

public class UserCommentList extends Response{
	
	public List<UserComment> star;
	
	public UserCommentList(List<UserComment> star) {
		this.star = star;
	}

}
