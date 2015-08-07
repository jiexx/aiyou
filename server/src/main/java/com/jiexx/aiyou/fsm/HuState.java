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
			Round.Hand hand = getRound().getHand( msg.uid );
			
			winOrLose(hand);
			
			HuAck winack = new HuAck();
			winack.cmd = Command.WHO.val();
			winack.other = getRound().getCards(hand.opponent());
			winack.hu = true;
			winack.bonus = 10;
			GameService.instance.sendMessage(getRound().endPoint(hand), gson.toJson(winack));
			
			HuAck lossack = new HuAck();
			lossack.cmd = Command.WHO.val();
			lossack.other = getRound().getCards(hand);
			lossack.hu = false;
			lossack.bonus = -10;
			GameService.instance.sendMessage(getRound().endPoint(hand.opponent()), gson.toJson(lossack));
		} 
		else if( msg.cmd == Command.TIMEOUT.val() ) {
			
		}
	}


}
