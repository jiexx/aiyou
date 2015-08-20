package com.jiexx.aiyou.comm;

public class LB {
	public float lat_start;
	public float lat_end;
	public float lng_start;
	public float lng_end;
	public final static float distance = 0.1f; // 2*1.85km
	public LB(float lat, float lon) {
		lat_start = lat - distance;
		lat_end = lat + distance;
		lng_start = lon - distance;
		lng_end = lon + distance;
	}
}
