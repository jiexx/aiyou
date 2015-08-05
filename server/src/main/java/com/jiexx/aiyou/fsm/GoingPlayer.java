package com.jiexx.aiyou.fsm;

import com.jiexx.aiyou.message.Command;
import com.jiexx.aiyou.message.DiscardAck;
import com.jiexx.aiyou.message.HuAck;
import com.jiexx.aiyou.message.Message;
import com.jiexx.aiyou.service.GameService;
import com.jiexx.aiyou.service.Round;

public class GoingPlayer extends State{

	public GoingPlayer(State root) {
		super(root);
		// TODO Auto-generated constructor stub
		cards = ((GoingState) getParent()).cards;
	}
	Card cards;
	byte handcards[];
	Round.Hand endPoint = null;
	@Override
	public void Exit(final Message msg) {
		super.Exit(msg);
		if( msg.cmd == Command.DISCARD.val() && getRound().getHand( msg.uid ) == endPoint ) {
			byte handcard = handcards[msg.opt];
			
			DiscardAck ackdealer = new DiscardAck();
			ackdealer.cmd = Command.DISCARD.val();
			ackdealer.card = handcard;
			GameService.instance.sendMessage(getRound().endPoint(endPoint.opponent()), gson.toJson(ackdealer));
		}
	}
	@Override
	public void Enter(final Message msg) {
		// TODO Auto-generated method stub
		if( msg.cmd == Command.DISCARD.val() && getRound().getHand( msg.uid ) == endPoint ) {
			if( endPoint == null ) {
				endPoint = cards.first.opponent();
				handcards = cards.handcards[cards.first.opponent().val()];
			}
			
			DiscardAck ackplayer = new DiscardAck();
			ackplayer.cmd = Command.DISCARD.val();
			ackplayer.card = cards.cards[cards.pos++];
			Card.sort(handcards, ackplayer.card);
			if( Card.hu(handcards) ) {
				msg.opt = endPoint.val();
				msg.cmd = Command.WHO.val();
				getRound().receive(msg);
			}else {
				GameService.instance.sendMessage(getRound().endPoint(endPoint), gson.toJson(ackplayer));
			}
		}	
	}
	@Override
	public void reset() {
		// TODO Auto-generated method stub
		endPoint = null;
		handcards = null;
	}


}
