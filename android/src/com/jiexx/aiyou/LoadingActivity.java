package com.jiexx.aiyou;

import org.androidannotations.annotations.AfterViews;
import org.androidannotations.annotations.EActivity;
import org.androidannotations.annotations.rest.RestService;
import org.androidannotations.annotations.sharedpreferences.Pref;

import android.os.Bundle;
import android.app.Activity;

@EActivity
public class LoadingActivity extends Activity {

	
	
	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.activity_loading);
	}
	
	@AfterViews
    void afterViews() {
		
    }


}
