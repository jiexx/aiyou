package com.jiexx.aiyou.fsm;

import java.util.Timer;
import java.util.TimerTask;

import com.jiexx.aiyou.message.Ack;
import com.jiexx.aiyou.message.Command;
import com.jiexx.aiyou.message.Message;
import com.jiexx.aiyou.message.OpenAck;
import com.jiexx.aiyou.model.Const;
import com.jiexx.aiyou.service.GameService;
import com.jiexx.aiyou.service.Round;

public class WaitState extends State{

	public WaitState(State root) {
		super(root);
		// TODO Auto-generated constructor stub
		self = this;
	}
	private State self;
	
	private void punishOrReward( Round.Hand h ) {
		GameService.instance.punish(getRound().getUser(h));
		GameService.instance.reward(getRound().getUser(h.opponent()));
	}
	
	@Override
	public void Exit(final Message msg ){
		super.Exit(msg);
		
	}

	@Override
	public void Enter(final Message msg) {
		// TODO Auto-generated method stub
		if( msg.cmd == Command.OPEN.val() /*&& getRound().getHand( msg.uid ) == Round.Hand.DEALER */) {
			getRound().addUser(Round.Hand.DEALER , msg.uid);
			
			OpenAck ack = new OpenAck();
			ack.cmd = Command.WAIT.val();
			ack.endp = getRound().endPoint(Round.Hand.DEALER);
			ack.roundid = getRound().getId();
			GameService.instance.sendMessage("/"+String.valueOf(msg.uid), gson.toJson(ack));
		}
		else if( msg.cmd == Command.CONTINUE.val() ) {
			//getRound().dealer = msg.uid; no more change dealerid;
			final long id = msg.uid;
			Timer timer = new Timer(true);
			timer.schedule(new TimerTask() { 
				public void run() {
					if( getRound().getCurrState() == self ) {
//						getRound().removeAllUser();
//						getRound().addUser(Round.Hand.DEALER, id);
						getRound().removeUser(getRound().getHand(id).opponent());
						
						Ack ackdealer = new Ack();
						ackdealer.cmd = Command.TIMEOUT.val();
						GameService.instance.sendMessage(getRound().endPoint(getRound().getHand(id)), gson.toJson(ackdealer));
					}
				}
			}, 0, 10000);
		}
		else if( msg.cmd == Command.TIMEOUT.val() ) {
			Ack ackdealer = new Ack();
			ackdealer.cmd = Command.TIMEOUT.val();
			GameService.instance.sendMessage(getRound().endPoint(Round.Hand.DEALER), gson.toJson(ackdealer));

			GameService.instance.sendMessage(getRound().endPoint(Round.Hand.PLAYER), gson.toJson(ackdealer));
		}
		else if( msg.cmd == Command.EXIT.val() ) {
			if( getRound().countOfUser()  == 1 ) {
				msg.cmd = Command.FINAL.val();
				getRound().receive(msg);
			}else { // 2 user
				Round.Hand hand = getRound().getHand(msg.uid);
				
				if( getParent().getPreviousState() instanceof  GoingState ) {
					punishOrReward( hand );
				}
//				if( hand == Round.Hand.DEALER  ) { // if exit is dealer
//					getRound().removeAllUser();
//					getRound().addUser(Round.Hand.DEALER, getRound().getUser(hand.opponent()));
//				}
				getRound().removeUser(hand.opponent());
				
				Ack ackdealer = new Ack();
				ackdealer.cmd = Command.OVER.val();
				GameService.instance.sendMessage(getRound().endPoint(hand.opponent()), gson.toJson(ackdealer));
			}
		}
	}

	@Override
	public void reset() {
		// TODO Auto-generated method stub
		
	}


}
