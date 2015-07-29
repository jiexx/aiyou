package com.jiexx.aiyou.fsm;

import java.util.Timer;
import java.util.TimerTask;

import com.jiexx.aiyou.message.Command;
import com.jiexx.aiyou.message.Message;
// if all tokens are arrived, FSM auto transfer to next state 
// if one token is not arrived in defined time,  FSM always stay current state.
// dealer/player id could be hold here instead of round
public class TokenState extends State {

	public TokenState(State root) {
		super(root);
		// TODO Auto-generated constructor stub
		self = this;
	}
	private State self;

	@Override
	public void Enter(final Message msg) {
		// TODO Auto-generated method stub
		final Message message = msg;
		message.cmd = Command.TIMEOUT.val();
		Timer timer = new Timer(true);
		timer.schedule(new TimerTask() { 
			public void run() {
				if( getRound().getCurrState() == self )
					getRound().receive(message);
			}
		}, 0, 10000);
	}

	@Override
	public void reset() {
		// TODO Auto-generated method stub
		
	}

}
