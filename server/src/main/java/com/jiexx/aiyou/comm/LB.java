package com.jiexx.aiyou.comm;

public class LB {
	public float lat_start;
	public float lat_end;
	public float lon_start;
	public float lon_end;
	public final static float distance = 0.02f; // 2*1.85km
	public LB(float lat, float lon) {
		lat_start = lat - distance;
		lat_end = lat + distance;
		lon_start = lon - distance;
		lon_end = lon + distance;
	}
}
