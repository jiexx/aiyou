package com.jiexx.aiyou.fsm;

import com.jiexx.aiyou.message.Command;
import com.jiexx.aiyou.message.DiscardAck;
import com.jiexx.aiyou.message.Message;
import com.jiexx.aiyou.service.GameService;

public class GoingPlayer extends State{

	public GoingPlayer(State root) {
		super(root);
		// TODO Auto-generated constructor stub
		cards = ((GoingState) getParent()).cards;
	}
	Card cards;
	char handcards[];
	String endPoint = null;
	String opponent;
	@Override
	public void Exit(final Message msg) {
		if( msg.cmd == Command.DISCARD.val() && msg.uid == getRound().hand.val()) {
			char handcard = handcards[msg.opt];
			
			DiscardAck ackdealer = new DiscardAck();
			ackdealer.cmd = Command.DISCARD.val();
			ackdealer.card = handcard;
			GameService.instance.sendMessage(opponent, gson.toJson(ackdealer));
		}
	}
	@Override
	public void Enter(final Message msg) {
		// TODO Auto-generated method stub
		if( msg.cmd == Command.DISCARD.val() && msg.uid == getRound().hand.val()) {
			if( endPoint == null ) {
				endPoint = getRound().currEndPoint();
				opponent = getRound().nextEndPoint();
				handcards = cards.handcards[cards.player.val()];
			}
			
			DiscardAck ackplayer = new DiscardAck();
			ackplayer.cmd = Command.DISCARD.val();
			ackplayer.card = cards.cards[cards.pos++];
			Card.sort(handcards, ackplayer.card);
			if( Card.hu(handcards) ) {
				msg.cmd = Command.WHO.val();
				getRound().receive(msg);
			}else {
				GameService.instance.sendMessage(endPoint, gson.toJson(ackplayer));
			}
		}	
	}


}
