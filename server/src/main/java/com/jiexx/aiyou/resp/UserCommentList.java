package com.jiexx.aiyou.resp;

import java.util.List;

import com.jiexx.aiyou.model.Goods;
import com.jiexx.aiyou.model.UserComment;

public class UserCommentList extends Response{
	
	public List<UserComment> star;
	public List<Goods> goods;
	
	public UserCommentList() {
		this.star = null;
	}
	
	public void addList(List<UserComment> star) {
		this.star = star;
	}
	
	public void addGoodsList(List<Goods> goods) {
		this.goods = goods;
	}

}
