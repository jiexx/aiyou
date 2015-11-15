package com.jiexx.aiyou;

import java.io.IOException;
import java.io.StringBufferInputStream;
import java.util.HashMap;

import org.androidannotations.annotations.EActivity;
import org.androidannotations.annotations.Extra;

import android.os.Bundle;
import android.util.Log;
import android.webkit.WebResourceResponse;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.app.Activity;
import android.graphics.Bitmap;

@EActivity
public class MainActivity extends Activity {

	@Extra("package")
	HashMap<String, String> code;

	WebView wv;

	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.activity_main);
		
		code = UpgradeService.localCode;

		wv = (WebView) findViewById(R.id.webview);
		wv.getSettings().setJavaScriptEnabled(true);
		wv.getSettings().setDomStorageEnabled(true);
		wv.loadUrl(wwwHome());

		wv.setWebViewClient(new WebViewClient() {
			@Override
			public boolean shouldOverrideUrlLoading(WebView view, String url) {
				return true;
			}

			@Override
			public void onPageStarted(WebView view, String url, Bitmap favicon) {
			}
			@Override
			public void onPageFinished(WebView view, String url) {
				// view.loadUrl("javascript:window.HTMLOUT.processHTML('<html>'+document.getElementsByTagName('html')[0].innerHTML+'</html>');");
			}

			@Override
			public WebResourceResponse shouldInterceptRequest(WebView view,	String url) {
				if (url.endsWith("js")) {
					return new WebResourceResponse("text/javascript", "utf-8", new StringBufferInputStream(code.get("."+url.substring(url.lastIndexOf('/')))));
				} else if (url.endsWith("html")) {
					return new WebResourceResponse("text/html", "utf-8", new StringBufferInputStream(code.get("."+url.substring(url.lastIndexOf('/')))));
				}else if(url.endsWith("css")) {
					return new WebResourceResponse("text/css", "utf-8", new StringBufferInputStream(code.get("."+url.substring(url.lastIndexOf('/')))));
				}
				return null;
			}
		});
	}

	public String wwwHome() {
		return "file:///data/data/" + this.getPackageName() + "/www/index.html";
	}

}
