package com.jiexx.aiyou.model;

public enum Const {
	UNREGISTERED(0x10000000),
	REGISTERED(0x10010000),
	
	CLZ_COMMON(0x20000000),
	CLZ_SHOP(0x21000000),
	CLZ_USER(0x20100000),
	CLZ_LOVE(0x20010000),
	CLZ_PLAY(0x20001000),
	
	SUCCESS(0x00000000),
	FAILED(0x00000001),

	;
	
	private final int value;
	
	Const(int val) {
        this.value = val;
    }
    
    public int val() {
        return value;
    }
    
    public String str() {
        return Integer.toHexString(value);
    }
}
