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
			boolean selfdrawho = round.mgr.whoIsUser();
			boolean commonwho = round.mgr.whoIsUser((byte) msg.opt);
			round.mgr.startLoop();
			if(selfdrawho || commonwho) {
				round.mgr.punishOrReward(msg.uid);
				if(commonwho) {
					round.mgr.draw((byte) msg.opt);
				}
				do{
					HuAck ha = new HuAck(Command.WHO);
					ha.hu = (round.mgr.getUserId() == msg.uid);
					ha.other = round.mgr.getCardsOfOther();
					ha.bonus = (round.mgr.getUserId() == msg.uid ? round.mgr.getChip() : -round.mgr.getChip()) ;
					round.mgr.notifyUser(gson.toJson(ha));
				}while(round.mgr.nextUser());

			}
		} 
	}

}
