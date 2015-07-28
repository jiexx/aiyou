package com.jiexx.aiyou.fsm;

import com.jiexx.aiyou.message.Command;
import com.jiexx.aiyou.message.Message;
import com.jiexx.aiyou.service.GameService;

public class EndState extends State{

	public EndState(State root) {
		super(root);
		// TODO Auto-generated constructor stub
	}

	@Override
	public void Enter(final Message msg) {
		// TODO Auto-generated method stub
		if ( msg.cmd == Command.FINAL.val() ) {
			GameService.instance.delRound(getRound().getId());
		}
	}

	@Override
	public void reset() {
		// TODO Auto-generated method stub
		
	}


}
