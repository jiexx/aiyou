package com.jiexx.aiyou.model;

public enum Const {
	UNREGISTERED(0x10000000),
	REGISTERED(0x10010000),
	
	CLZ_COMMON(0x30100000),
	
	SUCCESS(0x00000000),
	FAILED(0x00000001),
	
	INVALID(0x0000000f),
	TIMEOUT(0x0000001f)
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
