package com.jiexx.aiyou.fsm;

import com.jiexx.aiyou.message.Ack;
import com.jiexx.aiyou.service.GameService;

public class WaitState extends State{

	public WaitState(State root) {
		super(root);
		// TODO Auto-generated constructor stub
		round = (Round) getRoot();
	}
	
	private Round round = null;
	
	@Override
	public void Exit(final Message msg ){
		super.Exit(msg);
		
	}

	@Override
	public void Enter(final Message msg) {
		// TODO Auto-generated method stub
		if(Command.OPEN.equal(msg.cmd) || Command.CONTINUE.equal(msg.cmd)) {
			/*Layout create*/
			round.mgr.addUser(msg.uid);
		}
		else if(Command.EXIT.equal(msg.cmd)) {
			round.mgr.removeUser(msg.uid);
			round.mgr.broadcast(gson.toJson(new Ack(Command.EXIT)));
		}
		else if(Command.FINAL.equal(msg.cmd)) {
			round.mgr.removeUser(msg.uid);
			round.mgr.punishOrReward(msg.uid);
			round.mgr.broadcast(gson.toJson(new Ack(Command.EXIT)));
		}
	}

	@Override
	public void reset() {
		// TODO Auto-generated method stub
		
	}


}
