package com.jiexx.aiyou;

import org.androidannotations.annotations.AfterViews;
import org.androidannotations.annotations.EActivity;
import org.androidannotations.annotations.Receiver;

import android.os.Bundle;
import android.widget.TextView;
import android.app.Activity;

@EActivity
public class LoadingActivity extends Activity {

	TextView lodingInfo;
	
	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.activity_loading);
		lodingInfo = (TextView) findViewById(R.id.lodingInfo);

		UpgradeService_.intent(getApplication()).start();
	}

	@AfterViews
	void afterViews() {

	}

	@Receiver(actions = "com.jiexx.aiyou.PROGRESS")
	protected void onProgress(@Receiver.Extra("info") String info) {
		lodingInfo.setText(info);
	}

}
