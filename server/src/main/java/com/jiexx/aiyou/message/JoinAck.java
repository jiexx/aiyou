package com.jiexx.aiyou.message;

import java.util.LinkedList;

public class JoinAck extends Ack {
	public JoinAck(Command cmd) {
		super(cmd);
		// TODO Auto-generated constructor stub
	}
	public String endp;
	public LinkedList<Byte> card;
	public boolean hu = false;
}
