package com.jiexx.aiyou;

import java.util.HashMap;

import org.androidannotations.annotations.EActivity;
import org.androidannotations.annotations.Extra;

import android.os.Bundle;
import android.webkit.WebView;
import android.app.Activity;

@EActivity
public class MainActivity extends Activity {
	
	@Extra("package")
    HashMap<String, String> code;
	
	WebView wv;
	
	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.activity_main);
		
		wv = (WebView) findViewById(R.id.webview);
	}


}
