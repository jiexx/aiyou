package com.jiexx.aiyou.fsm;

import java.util.Arrays;
import java.util.LinkedList;

import com.jiexx.aiyou.comm.Util;
import com.jiexx.aiyou.message.Ack;
import com.jiexx.aiyou.message.Command;
import com.jiexx.aiyou.message.DiscardAck;
import com.jiexx.aiyou.message.HuAck;
import com.jiexx.aiyou.message.Message;
import com.jiexx.aiyou.message.PongchiAck;
import com.jiexx.aiyou.service.GameService;

public class GoingDealer extends State{

	public GoingDealer(State root) {
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
		if(Command.DISCARD_PONG.equal(msg.cmd) 
			if( round.mgr.pong((byte) msg.opt) {
				round.mgr.startLoop();
				while(round.mgr.nextUser()){
					round.mgr.notifyUser(gson.toJson(new Ack(Command.DISCARD_PONG)));
				}
			}
		}
		else if(Command.DISCARD_CHI.equal(msg.cmd)) {
			Util.Disc d = Util.parseDisc(msg.opt);
			if( round.mgr.ci(d.disc1, d.disc2, d.disc3) {
				round.mgr.startLoop();
				while(round.mgr.nextUser()){
					round.mgr.notifyUser(gson.toJson(new Ack(Command.DISCARD_CHI)));
				}
			}
		}
		else if(Command.DISCARD_DRAW.equal(msg.cmd)) {
			round.mgr.draw((byte) msg.opt);
			round.mgr.startLoop();
			if(round.mgr.whoIsUser()) {
				round.mgr.notifyUser(gson.toJson(new HuAck(Command.WHO)));
			}
			while(round.mgr.nextUser()){
				round.mgr.notifyUser(gson.toJson(new Ack(Command.DISCARD_DRAW)));
			}
		}
	}
	@Override
	public void reset() {
		// TODO Auto-generated method stub

	}


}
