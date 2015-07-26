package com.jiexx.aiyou.service;

import java.util.LinkedList;
import java.util.List;

import com.jiexx.aiyou.model.Const;

public enum GameService {
	instance;
	GameService() {
	}
	private class Round {
		int id;
		long dealer;
		long player;
		long time;
	}
	private List<Round> active = new LinkedList<Round>();
	private List<Round> dead = new LinkedList<Round>();
	public void createOneRound(long dealer) {
		Round round = null;
		if( dead.size() == 0 ) {
			round = new Round();
			round.id = active.size();
			active.add(round);
		}else {
			round = dead.get(0);
			active.add(round);
			dead.remove(0);
		}
		round.dealer = dealer;
		round.player = Const.INVALID_PLAYER.val();
		round.time = System.currentTimeMillis();
	}
	public void sendOverMessage(long who) {
		
	}
	public void sendWaitMessage(long who) {
		
	}
	public void destroyOneRound(long who) {
		for( int i = 0 ; i < active.size() ; i ++ ) {
			Round r = active.get(i);
			if( r.dealer == who ) {
				sendOverMessage(r.player);
			}else if( r.player == who ) {
				sendWaitMessage(r.dealer);
			}
			
		}
	}
}
