package com.jiexx.aiyou.fsm;

import java.util.Timer;
import java.util.TimerTask;

import com.jiexx.aiyou.message.Command;
import com.jiexx.aiyou.message.Message;

public class TimeOutState extends State {

	public TimeOutState(State root) {
		super(root);
		// TODO Auto-generated constructor stub
		self = this;
	}

	private State self;

	@Override
	public void Enter(final Message msg) {
		// TODO Auto-generated method stub
		new Thread() {
			public void run() {
				try {
					Thread.sleep(1800000);
//					if (getRound().getCurrState() == self) {
						msg.cmd = Command.TIMEOUT.val();
//						getRound().receive(msg);
//					}
				} catch (InterruptedException e) {
				}
			}
		}.start();
	}

	@Override
	public void reset() {
		// TODO Auto-generated method stub

	}

}
