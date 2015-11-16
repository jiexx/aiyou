package com.jiexx.aiyou;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.StringBufferInputStream;
import java.util.HashMap;

import org.androidannotations.annotations.EActivity;
import org.androidannotations.annotations.Extra;

import android.os.Bundle;
import android.util.Log;
import android.webkit.ConsoleMessage;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceResponse;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.app.Activity;
import android.graphics.Bitmap;

@EActivity
public class MainActivity extends Activity {

	@Extra("package")
	HashMap<String, InputStream> code;

	WebView wv;

	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.activity_main);
		
		code = UpgradeService.localCode;

		wv = (WebView) findViewById(R.id.webview);
		wv.getSettings().setJavaScriptEnabled(true);
		wv.getSettings().setDomStorageEnabled(true);
		wv.getSettings().setAllowFileAccessFromFileURLs(true);
		wv.getSettings().setJavaScriptCanOpenWindowsAutomatically(true);
		wv.getSettings().setDefaultTextEncodingName("utf-8");
		wv.loadUrl(wwwHome());
		//String html = readAssetFile("client/index.html");
		//wv.loadDataWithBaseURL("file:///android_asset/client/", html, "text/html", "utf-8", null);
		
		wv.setWebChromeClient(new WebChromeClient(){
			@Override
		    public boolean onConsoleMessage(ConsoleMessage cm)
		    {
		        Log.d("CONTENT", String.format("%s @ %d: %s", cm.message(), cm.lineNumber(), cm.sourceId()));
		        return true;
		    }
			
		});

		/*wv.setWebViewClient(new WebViewClient() {
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
					InputStream js = code.get(url.substring(url.lastIndexOf("/www/")+5));
					try {
						System.out.println("           "+url+ "   " +js.available());
					} catch (IOException e) {
						// TODO Auto-generated catch block
						e.printStackTrace();
					}
					return new WebResourceResponse("text/javascript", "utf-8", js);
				} else if (url.endsWith("html")) {
					InputStream html = code.get(url.substring(url.lastIndexOf("/www/")+5));
					try {
						System.out.println("           "+url+ "   " +html.available());
					} catch (IOException e) {
						// TODO Auto-generated catch block
						e.printStackTrace();
					}
					return new WebResourceResponse("text/html", "utf-8", html);
				}
				return super.shouldInterceptRequest(view, url);
			}
		});*/
	}

	private String readAssetFile(String fileName) {
	    StringBuilder buffer = new StringBuilder();
	    try {
		    InputStream fileInputStream = getAssets().open(fileName);
		    BufferedReader bufferReader = new BufferedReader(new InputStreamReader(fileInputStream, "UTF-8"));
		    String str;
	
		    while ((str=bufferReader.readLine()) != null) {
		        buffer.append(str);
		    }
		    fileInputStream.close();
	    }catch (Exception e ) {
	    	
	    }

	    return buffer.toString();
	}
	
	public String wwwHome() {
		return "file:///android_asset/client/index.html";//"file:///data/data/" + this.getPackageName() + "/www/index.html";
	}

}
