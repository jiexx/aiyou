package com.jiexx.aiyou.fsm;

import com.jiexx.aiyou.message.Command;
import com.jiexx.aiyou.message.Message;


public class Round extends State {

	public RoundManager mgr;
	
	public Round( int Id, int openChip ) {
		super(null);
		
		mgr = new RoundManager(Id, openChip);
		
		State start = new NullState(this);
		State wait = new WaitState(this);
		State hu = new HuState(this);
		State off = new StandoffState(this);
		GoingState going = new GoingState(this);
		State end = new EndState(this);
		
		State player = new GoingPlayer(going);
		State dealer = new GoingDealer(going);
		
		start.addTransition(Command.OPEN, wait);
		
		wait.addTransition(Command.JOIN, going);
		wait.addTransition(Command.CONTINUE, going);
		wait.addTransition(Command.EXIT, end);
		
		going.addTransition(Command.EXIT, wait);
		going.addTransition(Command.WHO, hu);
		going.addTransition(Command.STANDOFF, off);
		
		off.addTransition(Command.CONTINUE, wait);
		off.addTransition(Command.EXIT, wait);
		
		hu.addTransition(Command.CONTINUE, wait);
		hu.addTransition(Command.EXIT, wait);
		
		this.setInitState(start);

		dealer.addTransition(Command.DISCARD, player);
		
		player.addTransition(Command.DISCARD_CHI, dealer);
		player.addTransition(Command.DISCARD_PONG, dealer);
		player.addTransition(Command.DISCARD_DRAW, dealer);
		
		going.setInitState(dealer);
	}
	
	@Override
	public void Enter(Message msg) {
		// TODO Auto-generated method stub
		
	}

	@Override
	public void reset() {
		// TODO Auto-generated method stub
		
	}
}
