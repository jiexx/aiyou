package com.jiexx.aiyou.service;

import java.util.LinkedHashMap;
import java.util.LinkedList;
import java.util.Map;

import com.jiexx.aiyou.controller.WebSocketConfig;
import com.jiexx.aiyou.fsm.*;
import com.jiexx.aiyou.message.Command;
import com.jiexx.aiyou.message.Message;
import com.jiexx.aiyou.model.Const;


public class Round {

	State curr ;
	GoingState going;
	private int id;
	private long user[] = {Const.INVALID_PLAYER.val(), Const.INVALID_PLAYER.val()};
	private long time;
	public enum Hand {
		DEALER(0),
		PLAYER(1),
		INVALID(2);
		private int value;
		Hand(int v) {
			value = v;
		}
		public int val() {
			return value;
		}
		public static Hand from( int v) {
			if( v == DEALER.val() )
				return DEALER;
			return PLAYER;
		}
		public Hand opponent() {
			if( value == DEALER.value )
				return PLAYER;
			return DEALER;
		}
	}
	
	public Hand getHand(long uid){
		if( uid == user[Hand.DEALER.val()]  )
			return Hand.DEALER;
		else if( uid == user[Hand.PLAYER.val()]  )
			return Hand.PLAYER;
		else 
			return Hand.INVALID;
	}
	
	public String endPoint(Hand h){
		if( h == Hand.DEALER )
			return "/"+String.valueOf(id)+"/dealer";
		return "/"+String.valueOf(id)+"/player";
	}
	
	public void addUser(Hand who, long uid) {
		user[who.val()] = uid;
	}
	public void appendUser(long uid) {
		if( user[0] == Const.INVALID_PLAYER.val() && user[1] != Const.INVALID_PLAYER.val() ) 
			user[0] = uid;
		else if ( user[1] == Const.INVALID_PLAYER.val() && user[0] != Const.INVALID_PLAYER.val() )
			user[1] = uid;
	}
	public long getUser(Hand who) {
		return user[who.val()];
	}
	public void removeUser(Hand who) {
		user[who.val()] = Const.INVALID_PLAYER.val();
	}
	public void removeAllUser() {
		user[0] = Const.INVALID_PLAYER.val();
		user[1] = Const.INVALID_PLAYER.val();
	}
	public int countOfUser() {
		int count = 0;
		if( user[0] != Const.INVALID_PLAYER.val() ) count++;
		if( user[1] != Const.INVALID_PLAYER.val() ) count++;
		return count;
	}
			
	public int getId() {
		return id;
	}
	public Round( int Id ) {
		time = System.currentTimeMillis();
		id = Id;
		
		curr = new NullState(null);
		curr.setRound(this);
		
		State empty = new NullState(curr);
		State wait = new WaitState(curr);
		going = new GoingState(curr);
		State hu = new HuState(curr);
		State end = new EndState(curr);
		
		empty.addTransition(Command.OPEN, wait);
		
		wait.addTransition(Command.JOIN, going);
		wait.addTransition(Command.EXIT, wait);
		wait.addTransition(Command.FINAL, end);
		wait.addTransition(Command.CONTINUE, going);
		
		going.addTransition(Command.WHO, hu);
		going.addTransition(Command.EXIT, wait);
		
		hu.addTransition(Command.CONTINUE, wait);
		hu.addTransition(Command.EXIT, wait);
		hu.addTransition(Command.TIMEOUT, wait);
		
		curr.setInitState(empty);
		
		//init = new NullState(going);
		State player = new GoingPlayer(going);
		State dealer = new GoingDealer(going);
		
		//init.addTransition(Command.JOIN, dealer);
		dealer.addTransition(Command.DISCARD, player);
		dealer.addTransition(Command.DISCARD_CHI, dealer);
		dealer.addTransition(Command.DISCARD_PONG, dealer);
		dealer.addTransition(Command.DISCARD_DRAW, dealer);
		
		player.addTransition(Command.DISCARD, dealer);
		player.addTransition(Command.DISCARD_CHI, player);
		player.addTransition(Command.DISCARD_PONG, player);
		player.addTransition(Command.DISCARD_DRAW, player);
		
		going.setInitState(dealer);
	}
	
	public void receive( Message msg ) {
		curr.recv(msg);
	}
	
	public State getCurrState() {
		return curr;
	}
	
	public LinkedList<Byte>  getCards( Hand hand ) {
		return going.cards.getHandCards(hand);
	}
	
	public void reset() {
		//curr.setInitState(empty);
		//going.setInitState(init);
		time = System.currentTimeMillis();
	}
}
