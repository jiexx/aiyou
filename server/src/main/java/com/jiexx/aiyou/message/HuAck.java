package com.jiexx.aiyou.message;

import java.util.LinkedList;

public class HuAck extends Ack {
	public HuAck(Command cmd) {
		super(cmd);
		// TODO Auto-generated constructor stub
	}
	public LinkedList<LinkedList<Byte>> other;
	public int bonus;
	public int balance;
	public boolean hu;
}
