package com.jiexx.aiyou.message;

public enum Command {
	/*-----------------from client to server--------------*/
	OPEN(0x10000001),
	JOIN(0x10000002),
	EXIT(0x10000003),
	CONTINUE(0x10000004),
	
	DISCARD(0x20000001),
	
	DISCARD_PONG(0x30000001),
	DISCARD_CHI(0x30000002),
	DISCARD_DRAW(0x30000003),
	/*-----------------from server to client--------------*/
	WAIT(0x40000001),
	START(0x40000002),
	OVER(0x40000003),
	START_DEALER(0x40000004),
	START_PLAYER(0x40000005),
	
	/*-----------------from server to every --------------*/
	WHO(0x50000001),
	TIMEOUT(0x50000002),
	FINAL(0x50000003),
	SELFDRAWHO(0x50000004),
	STANDOFF(0x50000005),
	;
	private final int value;
	
	Command(int val) {
        this.value = val;
    }
    
    public int val() {
        return value;
    }
    
    public boolean equal(int val) {
    	return this.value == val;
    }
}
