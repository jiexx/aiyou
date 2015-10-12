package com.jiexx.aiyou.fsm;

import com.jiexx.aiyou.message.Command;
import com.jiexx.aiyou.message.DiscardAck;
import com.jiexx.aiyou.message.HuAck;
import com.jiexx.aiyou.message.Message;
import com.jiexx.aiyou.service.GameService;

public class HuState extends TimeOutState{

	public HuState(State root) {
		super(root);
		// TODO Auto-generated constructor stub
		round = (Round) getRoot();
	}
	
	private Round round = null;
	
	@Override
	public void Enter(final Message msg) {
		super.Enter(msg);
		// TODO Auto-generated method stub
		if(Command.WHO.equal(msg.cmd)) {
			round.mgr.startLoop();
			if(round.mgr.whoIsUser() || round.mgr.whoIsUser((byte) msg.opt)) {
				round.mgr.punishOrReward(msg.uid);
				
				while(round.mgr.nextUser()){
					HuAck ha = new HuAck(Command.WHO);
					ha.other = round.mgr.getCardsOfOther();
					ha.hu = (round.mgr.getUserId() == msg.toid);
					ha.bonus = (round.mgr.getUserId() == msg.toid ? round.mgr.getChip() : -round.mgr.getChip()) ;
					round.mgr.notifyUser(gson.toJson(ha));
				}

			}
		} 
	}

}
