package com.jiexx.aiyou.service;

import java.util.LinkedHashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import com.jiexx.aiyou.message.Message;
import com.jiexx.aiyou.model.Const;

public enum GameService {
	instance;
	
	@Autowired
	private SimpMessagingTemplate sendor;
	
	public void sendMessage(String endpoint, String msg) {
		sendor.convertAndSend(endpoint, msg);
	}
	
	private Map<Integer, Round> dealers = new LinkedHashMap<Integer, Round>();
	private Map<Integer, Round> players = new LinkedHashMap<Integer, Round>();
	private List<Round> active = new LinkedList<Round>();
	private List<Round> dead = new LinkedList<Round>();

	private void clearDealerPlayer(long uid, long toid) {
		dealers.remove(uid);
		players.remove(toid);
	}
	public void createRound(Message msg) {
		Round round = null;
		if( dead.size() == 0 ) {
			round = new Round();
			round.id = active.size();
		}else {
			round = dead.get(0);
			dead.remove(0);
			
			dealers.remove(round.dealer);
			players.remove(round.player);
		}
		active.add(round);
		dealers.put((int) msg.uid, round);
		
		round.reset();
		round.dealer = msg.uid;
		round.player = msg.toid;
		round.receive(msg);
	}
	public void removeRound(Message msg) {
		Round r;
		for( int i = 0 ; i < active.size() ; i ++ ) {
			r = active.get(i);
			if( r.dealer == msg.uid || r.player == msg.toid ) {
				r.receive(msg);
				break;
			}
		}
		clearDealerPlayer(msg.uid, msg.toid);
		clearDealerPlayer(msg.toid, msg.uid);
	}
	public void receive(Message msg) {
		Round r;
		if( (r = dealers.get(msg.uid)) != null ) {
			r.receive(msg);
		}else if( (r = players.get(msg.uid)) != null ) {
			r.receive(msg);
		}
	}
}
