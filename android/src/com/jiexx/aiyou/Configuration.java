package com.jiexx.aiyou;

public class Configuration {
	public final static String rootUrl = "http://112.33.8.90:9090";/*"http://10.101.1.67:9090";"http://192.168.2.104:9090";*/
	
	public static String dirWWW() {
		return "/data/data/com.jiexx.aiyou/www/"; //Context.getFilesDir().getPath() 
	}
	
	public static String dir3rd() {
		return "/data/data/com.jiexx.aiyou/3rd-lib/"; //Context.getFilesDir().getPath() 
	}
	
	public static String fileUpgradeStored(String version) {
		return "/data/data/com.jiexx.aiyou/upgrade/" + version + ".pkg";
	}

	public static String fileCodeStored(String version) {
		return "/data/data/com.jiexx.aiyou/upgrade/" + version + ".code";
	}
	
	public static String fileResourceStored(String version) {
		return "/data/data/com.jiexx.aiyou/upgrade/" + version + ".resource";
	}
	
	public static String fileMapStored(String version) {
		return "/data/data/com.jiexx.aiyou/upgrade/" + version + ".map";
	}
}
