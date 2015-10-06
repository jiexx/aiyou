package com.jiexx.aiyou.message;

import java.util.LinkedList;

public class StartAck extends Ack {
	public String endp;
	public LinkedList<Byte> card;
	public boolean hu = false;
	public LinkedList<Long> id;
	public int rid;
	public StartAck(Command cmd){
		super(cmd);
	}
}
