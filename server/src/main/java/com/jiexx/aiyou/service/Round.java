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
	public int hand;
	
	public void dealerHand(int dealerhand) {
		if( dealerhand == 1 )
			hand = 1;
		else
			hand = 0;
	}
	public String handEndPoint(){
		if( hand == 1 )
			return String.valueOf(id)+"/dealer";
		else 
			return String.valueOf(id)+"/player";
	}
	public void exhand(){
		hand = hand == 1 ? 0 : 1;
	}
	public String opponentEndPoint() {
		if( hand == 1 )
			return String.valueOf(id)+"player";
		else 
			return String.valueOf(id)+"dealer";
	}
	
	public Round() {
		curr = new NullState(null);
		curr.set(this);
		
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
		
		init.addTransition(Command.START, dealer);
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
