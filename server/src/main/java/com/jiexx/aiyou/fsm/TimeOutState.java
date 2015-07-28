package com.jiexx.aiyou.fsm;

import java.util.Timer;
import java.util.TimerTask;

import com.jiexx.aiyou.message.Command;
import com.jiexx.aiyou.message.Message;

public class TimeOutState extends State {

	public TimeOutState(State root) {
		super(root);
		// TODO Auto-generated constructor stub
	}

	@Override
	public void Enter(final Message msg) {
		// TODO Auto-generated method stub
		final Message message = msg;
		message.cmd = Command.TIMEOUT.val();
		Timer timer = new Timer(true);
		timer.schedule(new TimerTask() { 
			public void run() {
				getRound().receive(message);
			}
		}, 0, 10000);
	}

	@Override
	public void reset() {
		// TODO Auto-generated method stub
		
	}

}
