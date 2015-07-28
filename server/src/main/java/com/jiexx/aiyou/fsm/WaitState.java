package com.jiexx.aiyou.fsm;

import com.jiexx.aiyou.message.Ack;
import com.jiexx.aiyou.message.Command;
import com.jiexx.aiyou.message.Message;
import com.jiexx.aiyou.message.OpenAck;
import com.jiexx.aiyou.service.GameService;
import com.jiexx.aiyou.service.Round;

public class WaitState extends State{

	public WaitState(State root) {
		super(root);
		// TODO Auto-generated constructor stub
	}
	
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
		if( msg.cmd == Command.OPEN.val() && getRound().getHand( msg.uid ) == Round.Hand.DEALER ) {
			getRound().addUser(Round.Hand.DEALER , msg.uid);
			
			OpenAck ack = new OpenAck();
			ack.cmd = Command.WAIT.val();
			ack.endp = getRound().endPoint(Round.Hand.DEALER);
			GameService.instance.sendMessage("/"+String.valueOf(msg.uid), gson.toJson(ack));
		}
		else if( msg.cmd == Command.CONTINUE.val() ) {
			//getRound().dealer = msg.uid; no more change dealerid;
			
		}
		else if( msg.cmd == Command.TIMEOUT.val() ) {
			
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
				if( hand == Round.Hand.DEALER  ) {
					getRound().removeAllUser();
					getRound().addUser(Round.Hand.DEALER, getRound().getUser(hand.opponent()));
				}
				
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
