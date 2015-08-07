package com.jiexx.aiyou.fsm;

import com.jiexx.aiyou.message.Ack;
import com.jiexx.aiyou.message.Command;
import com.jiexx.aiyou.message.DiscardAck;
import com.jiexx.aiyou.message.JoinAck;
import com.jiexx.aiyou.message.Message;
import com.jiexx.aiyou.message.StartAck;
import com.jiexx.aiyou.model.Const;
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
			
			if(  getRound().getUser(Round.Hand.DEALER) != Const.INVALID_PLAYER.val() ) {
				getRound().addUser(Round.Hand.PLAYER, msg.uid); 
				
				StartAck ackdealer = new StartAck();
				ackdealer.cmd = Command.START.val();
				ackdealer.card = cards.getInitHandCards(Round.Hand.DEALER);
				ackdealer.hu = Card.hu(ackdealer.card);
				GameService.instance.sendMessage(getRound().endPoint(Round.Hand.DEALER), gson.toJson(ackdealer));
				
				JoinAck ackplayer = new JoinAck();
				ackplayer.cmd = Command.START.val();
				ackplayer.card = cards.getInitHandCards(Round.Hand.PLAYER);
				ackplayer.endp = getRound().endPoint(Round.Hand.PLAYER);
				ackplayer.hu = Card.hu(ackplayer.card);
				GameService.instance.sendMessage("/"+String.valueOf(msg.uid), gson.toJson(ackplayer));
			}
			else {
				getRound().addUser(Round.Hand.DEALER, msg.uid); 
				
				StartAck ackdealer = new StartAck();
				ackdealer.cmd = Command.START.val();
				ackdealer.card = cards.getInitHandCards(Round.Hand.PLAYER);
				ackdealer.hu = Card.hu(ackdealer.card);
				GameService.instance.sendMessage(getRound().endPoint(Round.Hand.PLAYER), gson.toJson(ackdealer));
				
				JoinAck ackplayer = new JoinAck();
				ackplayer.cmd = Command.START.val();
				ackplayer.card = cards.getInitHandCards(Round.Hand.DEALER);
				ackplayer.endp = getRound().endPoint(Round.Hand.DEALER);
				ackplayer.hu = Card.hu(ackplayer.card);
				GameService.instance.sendMessage("/"+String.valueOf(msg.uid), gson.toJson(ackplayer));
			}
		}
		else if( msg.cmd == Command.CONTINUE.val() && cards != null ) {
			cards.dieDealDraw();
			//no more change playerid;
			
			StartAck ackdealer = new StartAck();
			ackdealer.cmd = Command.START.val();
			ackdealer.card = cards.getInitHandCards(cards.first);
			ackdealer.hu = Card.hu(ackdealer.card);
			GameService.instance.sendMessage(getRound().endPoint(cards.first), gson.toJson(ackdealer));
			
			StartAck ackplayer = new StartAck();
			ackplayer.cmd = Command.START.val();
			ackplayer.card = cards.getInitHandCards(cards.first.opponent());
			ackplayer.hu = Card.hu(ackplayer.card);
			GameService.instance.sendMessage(getRound().endPoint(cards.first.opponent()), gson.toJson(ackplayer));
		}
		else if( msg.cmd == Command.DISCARD.val()  ) {

		}
		
	}

	@Override
	public void reset() {
		// TODO Auto-generated method stub
		
	}


}
