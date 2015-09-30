package com.jiexx.aiyou.service;

import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.stereotype.Service;

import com.jiexx.aiyou.controller.WebSocketConfig;
import com.jiexx.aiyou.dao.Data;
import com.jiexx.aiyou.fsm.Round;
import com.jiexx.aiyou.message.Command;
import com.jiexx.aiyou.message.Message;
import com.jiexx.aiyou.model.Const;

@Repository
public class GameService {
	public static GameService instance = null;
	
	@Autowired
	private SimpMessagingTemplate sendor;
	
	public GameService(){
		instance = this;
	}
	
	public void sendMessage(String endpoint, String msg) {
		System.out.println("sendMessage  "+WebSocketConfig.broker+endpoint+" "+msg);
		sendor.convertAndSend(WebSocketConfig.broker+endpoint, msg);
	}

	private List<Round> active = new LinkedList<Round>();

	public void receive(Message msg) {
		Round r;
		if( msg.toid < active.size() ) {
			if( (r = active.get((int) msg.toid)) != null ) {
				r.receive(msg);
			}
		}else if ( msg.cmd == Command.OPEN.val()  ) {
			r = new Round( active.size(), msg.opt );
			active.add(r);
			r.receive(msg);
		}
	}
	public int findWaitingUser(long id) {
		for( int i = 0 ; i < active.size() ; i ++ ) {
			if( active.get(i).isWatingUser(id) )
				return i;
		}
		return -1;
	}
	public int findExistedUser(long id) {
		for( int i = 0 ; i < active.size() ; i ++ ) {
			if( active.get(i).isExistedUser(id) )
				return i;
		}
		return -1;
	}
	
	public int getRoundChip(int index) {
		return active.get(index).getChip()  ;
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
	//----------------------------------------------
	private HashMap<String, Long> sessionWithId = new HashMap<String, Long>();
	public void regSessionWithId(String sessionid, long uid) {
		sessionWithId.put(sessionid, uid);
	}
	public void exitSession(String sessionid) {
		long uid = sessionWithId.get(sessionid);
		int roundid = findExistedUser(uid);
		if( roundid > -1 ) {
			Message msg = new Message();
			msg.cmd = Command.EXIT.val();
			msg.toid = roundid;
			msg.uid = uid;
			receive(msg);
		}
	}
}
