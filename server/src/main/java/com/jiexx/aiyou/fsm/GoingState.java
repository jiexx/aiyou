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
			
			round.mgr.startLoop();
			do {
				StartAck sa = round.mgr.isUserDealer() ? new StartAck(Command.START_DEALER) : new StartAck(Command.START_PLAYER);
				sa.endp = round.mgr.getUserEndpoint();
				sa.card = round.mgr.getUserCards();
				sa.hu = round.mgr.whoIsUser();
				sa.id = round.mgr.getIdsOfOther();
				sa.rid = round.mgr.getRoundId();
				round.mgr.notifyStub(gson.toJson(sa));
			}
			while(round.mgr.nextUser())
		}
	}

	@Override
	public void reset() {
		// TODO Auto-generated method stub
		
	}


}
