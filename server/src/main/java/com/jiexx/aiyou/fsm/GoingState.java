package com.jiexx.aiyou.fsm;

import com.jiexx.aiyou.message.Ack;
import com.jiexx.aiyou.message.Command;
import com.jiexx.aiyou.message.DiscardAck;
import com.jiexx.aiyou.message.JoinAck;
import com.jiexx.aiyou.message.Message;
import com.jiexx.aiyou.message.StartAck;
import com.jiexx.aiyou.service.GameService;
import com.jiexx.aiyou.service.Round;

public class GoingState extends State{

	public GoingState(State root) {
		super(root);
		// TODO Auto-generated constructor stub
	}
	
	public Card cards = null;

	@Override
	public void Enter(final Message msg) {
		// TODO Auto-generated method stub
		if( msg.cmd == Command.JOIN.val() ) {
			cards = new Card();
			cards.dieDealDraw();
			getRound().offensive(cards.dealer);
			
			StartAck ackdealer = new StartAck();
			ackdealer.cmd = Command.START.val();
			ackdealer.card = cards.handcards[cards.dealer.val()];
			ackdealer.hu = Card.hu(ackdealer.card);
			GameService.instance.sendMessage(getRound().endPoint(Round.Hand.DEALER), gson.toJson(ackdealer));
			
			JoinAck ackplayer = new JoinAck();
			ackplayer.cmd = Command.START.val();
			ackplayer.card = cards.handcards[cards.player.val()];
			ackplayer.endp = getRound().endPoint(Round.Hand.PLAYER);
			GameService.instance.sendMessage("/"+String.valueOf(msg.uid), gson.toJson(ackplayer));
		}
		else if( msg.cmd == Command.CONTINUE.val() && cards != null ) {
			cards.dieDealDraw();
			getRound().offensive(cards.dealer);
			
			StartAck ackdealer = new StartAck();
			ackdealer.cmd = Command.START.val();
			ackdealer.card = cards.handcards[cards.dealer.val()];
			GameService.instance.sendMessage(getRound().endPoint(Round.Hand.DEALER), gson.toJson(ackdealer));
			
			StartAck ackplayer = new StartAck();
			ackplayer.cmd = Command.START.val();
			ackplayer.card = cards.handcards[cards.player.val()];
			GameService.instance.sendMessage(getRound().endPoint(Round.Hand.PLAYER), gson.toJson(ackplayer));
		}
		else if( msg.cmd == Command.DISCARD.val() && msg.uid == getRound().hand.val() ) {
			getRound().exchangeHand();
		}
		
	}


}
