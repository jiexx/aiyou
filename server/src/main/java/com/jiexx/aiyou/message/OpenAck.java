package com.jiexx.aiyou.message;

public class OpenAck extends Ack{
	public OpenAck(Command cmd) {
		super(cmd);
		// TODO Auto-generated constructor stub
	}
	public String endp;
	public int roundid;
}
