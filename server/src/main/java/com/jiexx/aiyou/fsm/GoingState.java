package com.jiexx.aiyou.fsm;

import com.jiexx.aiyou.message.OpenJoinAck;

public class GoingState extends State{

	public GoingState(State root) {
		super(root);
		// TODO Auto-generated constructor stub
		round = (Round) getRoot();
	}
	
	private Round round = null;

	@Override
	public void Enter(final Message msg) {
		// TODO Auto-generated method stub
		if(Command.JOIN.equal(msg.cmd) || Command.CONTINUE.equal(msg.cmd)) {
			/*Layout create*/
			round.mgr.addUser(msg.uid);
			round.mgr.playDice();
			
			OpenJoinAck oja1 = new OpenAck(Command.START_DEALER);
			oja1.endp = round.mgr.getDealerEndpoint();
			oja1.card = round.mgr.getDealerCards();
			oja1.hu = round.mgr.whoIsDealer();
			oja1.id = round.mgr.othersExceptDealer();
			round.mgr.notifyDealer(gson.toJson(oja1));
			
			OpenJoinAck oja2 = new OpenAck(Command.START_PLAYER);
			oja2.endp = round.mgr.getPlayerEndpoint();
			oja2.card = round.mgr.getPlayerCards();
			oja2.hu = round.mgr.whoIsPlayer();
			oja2.id = round.mgr.othersExceptPlayer();
			round.mgr.notifyPlayer(gson.toJson(oja2));
		}
	}

	@Override
	public void reset() {
		// TODO Auto-generated method stub
		
	}


}
