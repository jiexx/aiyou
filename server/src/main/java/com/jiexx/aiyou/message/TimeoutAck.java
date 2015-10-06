package com.jiexx.aiyou.message;

public class TimeoutAck extends Ack {
	public TimeoutAck(Command cmd) {
		super(cmd);
		// TODO Auto-generated constructor stub
	}

	public int reason;
}
