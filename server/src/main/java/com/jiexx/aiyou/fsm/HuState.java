package com.jiexx.aiyou.fsm;

import com.jiexx.aiyou.message.Command;
import com.jiexx.aiyou.message.HuAck;
import com.jiexx.aiyou.message.Message;
import com.jiexx.aiyou.service.GameService;
import com.jiexx.aiyou.service.Round;

public class HuState extends TimeOutState{

	public HuState(State root) {
		super(root);
		// TODO Auto-generated constructor stub

	}
	private void winOrLose( Round.Hand h ) {
			GameService.instance.win(getRound().getUser(h));
			GameService.instance.lose(getRound().getUser(h.opponent()));
	}
	@Override
	public void Enter(final Message msg) {
		super.Enter(msg);
		// TODO Auto-generated method stub
		if( msg.cmd == Command.WHO.val()  ) {
			Round.Hand hand = Round.Hand.from(msg.opt);
			
			winOrLose(hand);
			
			HuAck ackdealer = new HuAck();
			ackdealer.cmd = Command.START.val();
			ackdealer.hu = true;
			ackdealer.bonus = 10;
			GameService.instance.sendMessage(getRound().endPoint(hand), gson.toJson(ackdealer));
			
			HuAck ackplayer = new HuAck();
			ackplayer.cmd = Command.START.val();
			ackplayer.hu = false;
			ackdealer.bonus = -10;
			GameService.instance.sendMessage(getRound().endPoint(hand.opponent()), gson.toJson(ackplayer));
		} 
		else if( msg.cmd == Command.TIMEOUT.val() ) {
			
		}
	}


}
