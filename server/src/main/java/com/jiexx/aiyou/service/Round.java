package com.jiexx.aiyou.service;

import java.util.LinkedHashMap;
import java.util.Map;

import com.jiexx.aiyou.fsm.*;
import com.jiexx.aiyou.message.Command;
import com.jiexx.aiyou.message.Message;


public class Round {

	State curr, going, empty, init;
	public int id;
	public long dealer; //1
	public long player; //0
	public long time;
	public Hand hand;
	public enum Hand {
		DEALER(1),
		PLAYER(0);
		private int value;
		Hand(int v) {
			value = v;
		}
		public int val() {
			return value;
		}
	}
	public boolean who(Hand h) {
		if( hand == h )
			return true;
		return false;
	}
	public void offensive(Hand h) {
		hand = h;
	}
	public void exchangeHand(){
		hand = hand == Hand.DEALER ? Hand.PLAYER : Hand.DEALER;
	}
	public String endPoint(Hand h){
		if( h == Hand.DEALER )
			return "/"+String.valueOf(id)+"/dealer";
		return "/"+String.valueOf(id)+"/player";
	}
	
	public String currEndPoint() {
		if( hand == Hand.DEALER )
			return "/"+String.valueOf(id)+"/dealer";
		return "/"+String.valueOf(id)+"/player";
	}
	public String nextEndPoint() {
		if( hand == Hand.DEALER )
			return "/"+String.valueOf(id)+"/player";
		return "/"+String.valueOf(id)+"/dealer";
	}
	
	public Round() {
		curr = new NullState(null);
		curr.setRound(this);
		
		empty = new NullState(curr);
		State wait = new WaitState(curr);
		going = new GoingState(curr);
		State hu = new HuState(curr);
		State end = new EndState(curr);
		
		empty.addTransition(Command.OPEN, wait);
		
		wait.addTransition(Command.JOIN, going);
		wait.addTransition(Command.EXIT, end);
		
		going.addTransition(Command.WHO, hu);
		going.addTransition(Command.EXIT, end);
		going.addTransition(Command.DISCARD, going);
		
		hu.addTransition(Command.CONTINUE, wait);
		hu.addTransition(Command.EXIT, wait);
		
		curr.setInitState(empty);
		
		init = new NullState(going);
		State player = new GoingPlayer(going);
		State dealer = new GoingDealer(going);
		
		init.addTransition(Command.JOIN, dealer);
		dealer.addTransition(Command.DISCARD, player);
		player.addTransition(Command.DISCARD, dealer);
		
		going.setInitState(init);
	}
	
	public void receive( Message msg ) {
		curr.next(msg);
	}
	
	public void reset() {
		curr.setInitState(empty);
		going.setInitState(init);
		time = System.currentTimeMillis();
	}
}
