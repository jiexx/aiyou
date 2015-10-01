package com.jiexx.aiyou.fsm;

import java.util.LinkedList;

import com.jiexx.aiyou.comm.Util;
import com.jiexx.aiyou.message.Ack;
import com.jiexx.aiyou.message.Command;
import com.jiexx.aiyou.message.DiscardAck;
import com.jiexx.aiyou.message.DrawAck;
import com.jiexx.aiyou.message.HuAck;
import com.jiexx.aiyou.message.Message;
import com.jiexx.aiyou.message.PongchiAck;
import com.jiexx.aiyou.service.GameService;

public class GoingPlayer extends State{

	public GoingPlayer(State root) {
		super(root);
		// TODO Auto-generated constructor stub
		round = (Round) getRoot();
	}
	
	private Round round = null;
	
	@Override
	public void Exit(final Message msg) {
		super.Exit(msg);
	}
	
	@Override
	public void Enter(final Message msg) {
		// TODO Auto-generated method stub
		if(Command.DISCARD.equal(msg.cmd)) {
			round.mgr.startLoop();
			while(round.mgr.nextUser()){
				DiscardAck da = new DiscardAck(Command.DISCARD);
				da.disc = (byte) msg.opt;
				da.deal = round.mgr.deal();
				da.hu = round.mgr.whoIsUser();
				round.mgr.notifyUser(gson.toJson(da));
			}
			round.mgr.step();
		}
	}
	@Override
	public void reset() {
		// TODO Auto-generated method stub
	}


}
