package com.jiexx.aiyou.fsm;

import com.jiexx.aiyou.message.Command;
import com.jiexx.aiyou.message.DiscardAck;
import com.jiexx.aiyou.message.HuAck;
import com.jiexx.aiyou.message.Message;
import com.jiexx.aiyou.service.GameService;

public class StandoffState extends TimeOutState{

	public StandoffState(State root) {
		super(root);
		// TODO Auto-generated constructor stub
		round = (Round) getRoot();
	}
	
	private Round round = null;
	
	@Override
	public void Enter(final Message msg) {
		super.Enter(msg);
		// TODO Auto-generated method stub
		if(Command.STANDOFF.equal(msg.cmd)) {
			round.mgr.startLoop();
			do{
				HuAck ha = new HuAck(Command.STANDOFF);
				ha.hu = false;
				ha.other = round.mgr.getCardsOfOther();
				ha.bonus = 0 ;
				round.mgr.notifyUser(gson.toJson(ha));
			}while(round.mgr.nextUser());
		} 
	}

}
