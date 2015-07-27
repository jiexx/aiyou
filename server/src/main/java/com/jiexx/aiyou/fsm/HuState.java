package com.jiexx.aiyou.fsm;

import com.jiexx.aiyou.message.Command;
import com.jiexx.aiyou.message.HuAck;
import com.jiexx.aiyou.message.Message;
import com.jiexx.aiyou.message.StartAck;
import com.jiexx.aiyou.service.GameService;
import com.jiexx.aiyou.service.Round;

public class HuState extends TimeOutState{

	public HuState(State root) {
		super(root);
		// TODO Auto-generated constructor stub
	}

	@Override
	public void Enter(final Message msg) {
		super.Enter(msg);
		// TODO Auto-generated method stub
		
		HuAck ackdealer = new HuAck();
		ackdealer.cmd = Command.START.val();
		ackdealer.hu = getRound().who(Round.Hand.DEALER);
		GameService.instance.sendMessage(getRound().endPoint(Round.Hand.DEALER), gson.toJson(ackdealer));
		
		HuAck ackplayer = new HuAck();
		ackplayer.cmd = Command.START.val();
		ackplayer.hu = getRound().who(Round.Hand.DEALER);
		GameService.instance.sendMessage(getRound().endPoint(Round.Hand.PLAYER), gson.toJson(ackplayer));
	}


}
