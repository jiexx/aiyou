package com.jiexx.aiyou.fsm;

import java.util.Arrays;
import java.util.LinkedList;

import com.jiexx.aiyou.comm.Util;
import com.jiexx.aiyou.message.Ack;
import com.jiexx.aiyou.message.Command;
import com.jiexx.aiyou.message.DiscardAck;
import com.jiexx.aiyou.message.HuAck;
import com.jiexx.aiyou.message.Message;
import com.jiexx.aiyou.message.PongchiAck;
import com.jiexx.aiyou.service.GameService;
import com.jiexx.aiyou.service.Round;

public class GoingDealer extends State{

	public GoingDealer(State root) {
		super(root);
		// TODO Auto-generated constructor stub
		cards = ((GoingState) getParent()).cards;
	}
	Card cards;
	LinkedList<Byte> handcards;
	Round.Hand endPoint;
	@Override
	public void Exit(final Message msg) {
		super.Exit(msg);
		if( msg.cmd == Command.DISCARD.val() && endPoint == null ) {
			cards = ((GoingState) getParent()).cards;
			endPoint = cards.first;
			handcards = cards.getHandCards(endPoint);
		}
		if( msg.cmd == Command.DISCARD.val() && getRound().getHand( msg.uid ) == endPoint ) {
			int pos = Util.findBytes(handcards,  (byte) msg.opt);
			if( pos > -1 ) {
				handcards.remove(pos);
				Ack self = new Ack();
				self.cmd = Command.DISCARD.val();
				GameService.instance.sendMessage(getRound().endPoint(endPoint), gson.toJson(self));
			}
		}
		System.out.println("GoingDealer Exit   "+msg.cmd + " :" + getRound().getHand( msg.uid ).getClass().getSimpleName() +handcards.toString());
	}

	@Override
	public void Enter(final Message msg) {
		// TODO Auto-generated method stub
		if( msg.cmd == Command.DISCARD.val() && endPoint == null ) {
			endPoint = cards.first.opponent();
			handcards = cards.getInitHandCards(endPoint);
		}
		if( msg.cmd == Command.DISCARD.val() && getRound().getHand( msg.uid ) == endPoint.opponent() ) {
			DiscardAck self = new DiscardAck();
			self.cmd = Command.DISCARD.val();
			self.disc = (byte) msg.opt;
			//self.deal = cards.cards[cards.pos++];
			self.hu = cards.hu(handcards, self.disc);
			GameService.instance.sendMessage(getRound().endPoint(endPoint), gson.toJson(self));
		}
		else if( msg.cmd == Command.DISCARD_PONG.val()  ){
			int pos = Util.findBytes(handcards,  (byte) msg.opt);
			if( pos > -1 && msg.opt == handcards.get(pos+1) && msg.opt == handcards.get(pos+2)  ) {
				HuAck self = new HuAck();
				self.cmd = msg.cmd;
				self.hu = cards.hu(handcards, (byte) msg.opt );
				GameService.instance.sendMessage(getRound().endPoint(endPoint), gson.toJson(self));
				
				PongchiAck other = new PongchiAck();
				other.cmd = msg.cmd;
				other.disc1 = (byte) msg.opt;
				other.disc2 = other.disc1;
				other.disc3 = other.disc1;
				GameService.instance.sendMessage(getRound().endPoint(endPoint.opponent()), gson.toJson(other));
			}
		}
		else if( msg.cmd == Command.DISCARD_CHI.val() ) {
			int pos = Util.findBytes(handcards,  (byte) msg.opt);
			if( pos > -1 && msg.opt == handcards.get(pos-1) +1 && msg.opt == handcards.get(pos+1) -1 ) {
				HuAck self = new HuAck();
				self.cmd = msg.cmd;
				self.hu = cards.hu(handcards, (byte) msg.opt );
				GameService.instance.sendMessage(getRound().endPoint(endPoint), gson.toJson(self));
				
				PongchiAck other = new PongchiAck();
				other.cmd = msg.cmd;
				other.disc1 = (byte) (msg.opt - 1);
				other.disc2 = (byte) (other.disc1 + 1);
				other.disc3 = (byte) (other.disc1 + 2);
				GameService.instance.sendMessage(getRound().endPoint(endPoint.opponent()), gson.toJson(other));
			}
		}
		else if( msg.cmd == Command.DISCARD_DRAW.val() ){
			if( msg.opt ==  cards.cards[cards.pos] ) {				
				DiscardAck self = new DiscardAck();
				self.cmd = Command.DISCARD_DRAW.val();
				self.deal = cards.cards[cards.pos];
				self.hu = cards.hu(handcards, self.deal );
				GameService.instance.sendMessage(getRound().endPoint(endPoint), gson.toJson(self));
				
				int pos = Util.insBytes(handcards,  (byte) msg.opt);
				handcards.add(pos, (byte) msg.opt);
			}
		}
		if( handcards != null )
			System.out.println("GoingDealer Enter   "+msg.cmd + " :" + getRound().getHand( msg.uid ).toString()  +handcards.toString());
		else
			System.out.println("GoingDealer Enter   "+msg.cmd + " :" + getRound().getHand( msg.uid ).toString()  );
	}
	@Override
	public void reset() {
		// TODO Auto-generated method stub
		endPoint = null;
		if( handcards != null ) {
			handcards.clear();
			handcards = null;
		}
	}


}
