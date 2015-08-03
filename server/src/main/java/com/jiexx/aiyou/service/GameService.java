package com.jiexx.aiyou.service;

import java.util.LinkedHashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import com.jiexx.aiyou.message.Command;
import com.jiexx.aiyou.message.Message;
import com.jiexx.aiyou.model.Const;

public enum GameService {
	instance;
	
	@Autowired
	private SimpMessagingTemplate sendor;
	
	public void sendMessage(String endpoint, String msg) {
		sendor.convertAndSend(endpoint, msg);
	}

	private List<Round> active = new LinkedList<Round>();

	public void receive(Message msg) {
		Round r;
		if( msg.toid < active.size() ) {
			if( (r = active.get((int) msg.toid)) != null ) {
				r.receive(msg);
			}
		}else if ( msg.cmd == Command.OPEN.val()  ) {
			r = new Round( active.size() );
			active.add(r);
			r.receive(msg);
		}
	}
	public void delRound(int id) {
		active.remove(id);
	}
	
	public void win(long  id) {
		
	}
	public void lose(long  id) {
		
	}
	public void punish(long  id) {
		
	}
	public void reward(long  id) {
		
	}
}
