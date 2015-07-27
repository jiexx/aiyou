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
	String endPoint;
	String opponent;
	@Override
	public void Exit(final Message msg) {
		if( msg.cmd == Command.DISCARD.val() && msg.uid == getRound().hand.val()) {
			char handcard = handcards[msg.opt];
			
			DiscardAck ackplayer = new DiscardAck();
			ackplayer.cmd = Command.DISCARD.val();
			ackplayer.card = handcard;
			GameService.instance.sendMessage(opponent, gson.toJson(ackplayer));
		}
	}

	@Override
	public void Enter(final Message msg) {
		// TODO Auto-generated method stub
		if( msg.cmd == Command.JOIN.val() ) {
			endPoint = getRound().endPoint(Round.Hand.DEALER);
			opponent = getRound().endPoint(Round.Hand.PLAYER);
			handcards = cards.handcards[cards.dealer.val()];
		}
		else if( msg.cmd == Command.DISCARD.val() && msg.uid == getRound().hand.val()) {
			handcards[msg.opt] = cards.cards[cards.pos++];

			DiscardAck ackdealer = new DiscardAck();
			ackdealer.cmd = Command.DISCARD.val();
			ackdealer.card = handcards[msg.opt];
			Card.sort(handcards, ackdealer.card);
			if( Card.hu(handcards) ) {
				msg.cmd = Command.WHO.val();
				getRound().receive(msg);
			}else {
				GameService.instance.sendMessage(endPoint, gson.toJson(ackdealer));
			}
		}
	}


}
