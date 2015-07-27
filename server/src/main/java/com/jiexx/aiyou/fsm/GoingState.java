package com.jiexx.aiyou.fsm;

import com.jiexx.aiyou.message.Ack;
import com.jiexx.aiyou.message.Command;
import com.jiexx.aiyou.message.DiscardAck;
import com.jiexx.aiyou.message.JoinAck;
import com.jiexx.aiyou.message.Message;
import com.jiexx.aiyou.service.GameService;

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
			this.get().dealerHand(cards.dealer);
			
			JoinAck ackdealer = new JoinAck();
			ackdealer.cmd = Command.START.val();
			ackdealer.hand = cards.handcards[cards.dealer];
			GameService.instance.sendMessage(String.valueOf(this.get().id)+"/dealer", gson.toJson(ackdealer));
			
			JoinAck ackplayer = new JoinAck();
			ackplayer.cmd = Command.START.val();
			ackplayer.hand = cards.handcards[cards.player];
			ackplayer.endp = String.valueOf(this.get().id)+"/player";
			GameService.instance.sendMessage("/"+String.valueOf(msg.uid), gson.toJson(ackplayer));
		}
		else if( msg.cmd == Command.CONTINUE.val() ) {
			if( cards != null ) {
				cards.dieDealDraw();
				this.get().dealerHand(cards.dealer);
				
				JoinAck ackdealer = new JoinAck();
				ackdealer.cmd = Command.START.val();
				ackdealer.hand = cards.handcards[cards.dealer];
				GameService.instance.sendMessage(String.valueOf(this.get().id)+"/dealer", gson.toJson(ackdealer));
				
				JoinAck ackplayer = new JoinAck();
				ackplayer.cmd = Command.START.val();
				ackplayer.hand = cards.handcards[cards.player];
				GameService.instance.sendMessage("/"+String.valueOf(msg.uid), gson.toJson(ackplayer));
			}
		}
		else if( msg.cmd == Command.DISCARD.val() ) {
			if( msg.uid == this.get().hand ) {
				DiscardAck ackplayer = new DiscardAck();
				ackplayer.cmd = Command.DISCARD.val();
				ackplayer.hand[0] = cards.cards[cards.pos++];
				ackplayer.hand[1] = cards.cards[cards.pos++];
				GameService.instance.sendMessage("/"+String.valueOf(msg.uid), gson.toJson(ackplayer));
			}
		}
		
	}


}
