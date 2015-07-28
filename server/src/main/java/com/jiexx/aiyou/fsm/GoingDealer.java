package com.jiexx.aiyou.fsm;

import com.jiexx.aiyou.message.Command;
import com.jiexx.aiyou.message.DiscardAck;
import com.jiexx.aiyou.message.Message;
import com.jiexx.aiyou.service.GameService;
import com.jiexx.aiyou.service.Round;

public class GoingDealer extends State{

	public GoingDealer(State root) {
		super(root);
		// TODO Auto-generated constructor stub
		cards = ((GoingState) getParent()).cards;
	}
	Card cards;
	char handcards[];
	Round.Hand endPoint;

	@Override
	public void Exit(final Message msg) {
		super.Exit(msg);
		if( msg.cmd == Command.DISCARD.val() && getRound().getHand( msg.uid ) == endPoint ) {
			char handcard = handcards[msg.opt];
			
			DiscardAck ackplayer = new DiscardAck();
			ackplayer.cmd = Command.DISCARD.val();
			ackplayer.card = handcard;
			GameService.instance.sendMessage(getRound().endPoint(endPoint.opponent()), gson.toJson(ackplayer));
		}
	}

	@Override
	public void Enter(final Message msg) {
		// TODO Auto-generated method stub
		if( msg.cmd == Command.JOIN.val() ) {
			endPoint = cards.first;
			handcards = cards.handcards[cards.first.val()];
		}
		else if( msg.cmd == Command.DISCARD.val() && getRound().getHand( msg.uid ) == endPoint ) {
			handcards[msg.opt] = cards.cards[cards.pos++];

			DiscardAck ackdealer = new DiscardAck();
			ackdealer.cmd = Command.DISCARD.val();
			ackdealer.card = handcards[msg.opt];
			Card.sort(handcards, ackdealer.card);
			if( Card.hu(handcards) ) {
				msg.cmd = Command.WHO.val();
				msg.opt = endPoint.val();
				getRound().receive(msg);
			}else {
				GameService.instance.sendMessage(getRound().endPoint(endPoint), gson.toJson(ackdealer));
			}
		}
	}
	@Override
	public void reset() {
		// TODO Auto-generated method stub
		endPoint = null;
		handcards  = null;
	}


}
