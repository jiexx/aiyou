package com.jiexx.aiyou.fsm;

import com.jiexx.aiyou.message.Command;
import com.jiexx.aiyou.message.Message;
import com.jiexx.aiyou.message.OpenAck;
import com.jiexx.aiyou.service.GameService;
import com.jiexx.aiyou.service.Round;

public class WaitState extends State{

	public WaitState(State root) {
		super(root);
		// TODO Auto-generated constructor stub
	}

	@Override
	public void Enter(final Message msg) {
		// TODO Auto-generated method stub
		if( msg.cmd == Command.OPEN.val() ) {
			getRound().offensive(Round.Hand.DEALER);
			
			OpenAck ack = new OpenAck();
			ack.cmd = Command.WAIT.val();
			ack.endp = getRound().endPoint(Round.Hand.DEALER);
			GameService.instance.sendMessage("/"+String.valueOf(msg.uid), gson.toJson(ack));
		}
		
	}


}
