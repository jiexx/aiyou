package com.jiexx.aiyou.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.support.ClassPathXmlApplicationContext;
import org.springframework.stereotype.Controller;
import org.springframework.util.DigestUtils;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.context.support.WebApplicationContextUtils;

import com.jiexx.aiyou.comm.LB;
import com.jiexx.aiyou.comm.Util;
import com.jiexx.aiyou.model.Comment;
import com.jiexx.aiyou.model.Const;
import com.jiexx.aiyou.model.Goods;
import com.jiexx.aiyou.model.TopicComment;
import com.jiexx.aiyou.model.User;
import com.jiexx.aiyou.model.UserComment;
import com.jiexx.aiyou.resp.CommentList;
import com.jiexx.aiyou.resp.Response;
import com.jiexx.aiyou.resp.TopicCommentList;
import com.jiexx.aiyou.resp.UserCommentList;
import com.jiexx.aiyou.resp.UserList;
import com.jiexx.aiyou.service.DataService;

@Controller
@RequestMapping("/bbs")
public class BBS extends DataService {

	@Autowired
	private ApplicationContext appContext;

	@RequestMapping(value = "user.do", params = { "id" }, method = RequestMethod.GET)
	@ResponseBody
	public String user(@RequestParam(value = "id") long id) {
		// System.out.println(appContext.getClassLoader().getResource("jdbc.properties"));

		List<Goods> lg = DATA.queryTopGoods();
		List<UserComment> luc = DATA.queryCommentList(id);
		UserCommentList resp = new UserCommentList();
		resp.addList(luc);
		resp.addGoodsList(lg);
		if (luc != null)
			resp.success();

		return resp.toResp();
	}
	
	@RequestMapping(value = "topic.do", params = { "id" }, method = RequestMethod.GET)
	@ResponseBody
	public String topic(@RequestParam(value = "id") long id) {
		// System.out.println(appContext.getClassLoader().getResource("jdbc.properties"));

		List<TopicComment> star = DATA.queryTopicList(id);
		TopicCommentList resp = new TopicCommentList(star);
		if (star != null)
			resp.success();

		return resp.toResp();
	}

	@RequestMapping(value = "comment.do", params = { "toid", "uid", "str" }, method = RequestMethod.GET)
	@ResponseBody
	public String comment(@RequestParam(value = "toid") long toid, @RequestParam(value = "uid") long uid,
			@RequestParam(value = "str") String str) {
		// System.out.println(appContext.getClassLoader().getResource("jdbc.properties"));
		if(str.length() < 8)
			return null;

		Response resp = new Response();
		Comment topic = new Comment();
		topic.toid = toid;
		topic.uid = uid;
		topic.content = str;
		topic.dnd = 1;
		Integer i = DATA.replyComment(topic);
		if (i != null) {
			resp.success();
			resp.code = String.valueOf(topic.id);
		}

		return resp.toResp();
	}

	@RequestMapping(value = "reply.do", params = { "id", "uid", "str" }, method = RequestMethod.GET)
	@ResponseBody
	public String reply(@RequestParam(value = "id") long topicid, @RequestParam(value = "uid") long uid,
			@RequestParam(value = "str") String str) {
		// System.out.println(appContext.getClassLoader().getResource("jdbc.properties"));
		if(str.length() < 8)
			return null;
		
		Response resp = new Response();
		
		Comment comment = DATA.queryComment(topicid);
		if (comment != null) {
			Comment topic = new Comment();
			topic.toid = comment.toid;
			topic.uid = uid;
			topic.content = str;
			topic.dnd = 1;
			Integer i = DATA.replyComment(topic);
			Integer j = DATA.reply(comment.id, topic.id);

			if (i != null && j != null)
				resp.success();
		}
		return resp.toResp();
	}

}
