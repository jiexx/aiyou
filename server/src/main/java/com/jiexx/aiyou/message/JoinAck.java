package com.jiexx.aiyou.message;

import java.util.LinkedList;

public class JoinAck extends Ack {
	public String endp;
	public LinkedList<Byte> card;
	public boolean hu = false;
}
