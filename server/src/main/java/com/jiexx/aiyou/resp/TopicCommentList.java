package com.jiexx.aiyou.resp;

import java.util.List;

import com.jiexx.aiyou.model.TopicComment;

public class TopicCommentList extends Response{
	
	public List<TopicComment> star;
	
	public TopicCommentList(List<TopicComment> star) {
		this.star = star;
	}

}
