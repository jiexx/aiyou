package com.jiexx.aiyou;

public class J2J {
	private LoadingFragment lf;
	public J2J(LoadingFragment lf) {
		this.lf = lf;
	}
	public void didLoad() {
		if(lf != null)
			lf.getFragmentManager().beginTransaction().hide(lf).commit();
		System.out.println("j2j ....");
	}
}
