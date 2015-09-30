package com.jiexx.aiyou.fsm;

import java.util.Timer;
import java.util.TimerTask;

import com.jiexx.aiyou.message.Ack;
import com.jiexx.aiyou.message.Command;
import com.jiexx.aiyou.message.Message;
import com.jiexx.aiyou.message.OpenAck;
import com.jiexx.aiyou.model.Const;
import com.jiexx.aiyou.service.GameService;

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
		Round r = (Round) getRoot();
		if(Command.OPEN.equal(msg.cmd)) {
			
			/*Layout create*/
			r.addUser(msg.uid);
			
			//OpenAck ack = new OpenAck();
			//ack.cmd = Command.WAIT.val();
			//ack.endp = getRound().endPoint(com.jiexx.aiyou.fsm.Hand.DEALER);
			//ack.roundid = getRound().getId();
			//GameService.instance.sendMessage("/"+String.valueOf(msg.uid), gson.toJson(ack));
		}
		else if(Command.CONTINUE.equal(msg.cmd)) {
			Round r = (Round) getRoot();
			r.addUser(msg.uid);
		}
		else if( msg.cmd == Command.TIMEOUT.val() ) {
			Ack ackdealer = new Ack();
			ackdealer.cmd = Command.TIMEOUT.val();
			GameService.instance.sendMessage(getRound().endPoint(com.jiexx.aiyou.fsm.Hand.DEALER), gson.toJson(ackdealer));

			GameService.instance.sendMessage(getRound().endPoint(com.jiexx.aiyou.fsm.Hand.PLAYER), gson.toJson(ackdealer));
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
				getRound().removeUser(hand);
				
				Ack ackdealer = new Ack();
				ackdealer.cmd = Command.EXIT.val();
				GameService.instance.sendMessage(getRound().endPoint(hand.opponent()), gson.toJson(ackdealer));
			}
		}
	}

	@Override
	public void reset() {
		// TODO Auto-generated method stub
		
	}


}
