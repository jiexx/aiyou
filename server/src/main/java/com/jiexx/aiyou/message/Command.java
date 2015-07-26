package com.jiexx.aiyou.message;

public enum Command {
	OPEN(0x10000000),
	JOIN(0x10000001),
	START(0x10000002),
	
	DISCARD(0x20000003),
	READ(0x20000004),
	WHO(0x20000005),
	
	DISCARD_PONG(0x30000001),
	DISCARD_CHI(0x30000002);
	
	private final int value;
	
	Command(int val) {
        this.value = val;
    }
    
    public int val() {
        return value;
    }
}
