package com.jiexx.aiyou.resp;

import java.util.List;

import com.jiexx.aiyou.model.Comment;

public class CommentList extends Response{
	
	public List<Comment> star;
	
	public CommentList(List<Comment> star) {
		this.star = star;
	}

}
