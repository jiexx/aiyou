package com.jiexx.aiyou.message;

public class Ack {
	public int cmd;
	public Ack(Command cmd) {
		this.cmd = cmd.val();
	}
}
