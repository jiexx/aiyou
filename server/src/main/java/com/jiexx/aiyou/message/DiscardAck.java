package com.jiexx.aiyou.message;

public class DiscardAck extends Ack {
	public byte disc ;
	public byte deal ;
	public boolean hu ;
	public DiscardAck(Command cmd) {
		super(cmd);
	}
}
