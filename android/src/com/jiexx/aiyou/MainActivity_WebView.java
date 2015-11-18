package com.jiexx.aiyou;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.StringBufferInputStream;
import java.util.HashMap;

import org.androidannotations.annotations.EActivity;
import org.androidannotations.annotations.Extra;
import org.androidannotations.annotations.FragmentById;
import org.androidannotations.annotations.Receiver;
import org.springframework.util.support.Base64;

import android.os.Bundle;
import android.util.Log;
import android.webkit.ConsoleMessage;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.app.Activity;
import android.app.FragmentManager;
import android.app.FragmentTransaction;
import android.graphics.Bitmap;

import org.xwalk.core.XWalkView;

@EActivity
public class MainActivity_WebView extends Activity {
//
//	@Extra("package")
//	HashMap<String, InputStream> code;
//
//	WebView wv;
//	
//	//LoadingFragment lf;
//	
//	@FragmentById(R.id.loadingView)
//	LoadingFragment lf;
//
//	@Override
//	protected void onCreate(Bundle savedInstanceState) {
//		super.onCreate(savedInstanceState);
//		setContentView(R.layout.activity_main);
//		
//		UpgradeService_.intent(this).start();
//		
//		/*lf = new LoadingFragment_().builder().build();
//        FragmentManager fm = getFragmentManager();
//        FragmentTransaction ft = fm.beginTransaction();
//        ft.replace(R.id.loadingView, lf);
//        ft.commit();*/
//		
//		code = UpgradeService.localCode;
//
//		wv = (WebView) findViewById(R.id.webView);
//		wv.getSettings().setJavaScriptEnabled(true);
//		wv.getSettings().setDomStorageEnabled(true);
//		wv.getSettings().setAllowFileAccessFromFileURLs(true);
//		wv.getSettings().setJavaScriptCanOpenWindowsAutomatically(true);
//		wv.getSettings().setDefaultTextEncodingName("utf-8");
//		wv.getSettings().setCacheMode(WebSettings.LOAD_NO_CACHE);
//		
//		//String html = readAssetFile("client/index.html");
//		//wv.loadDataWithBaseURL("file:///android_asset/client/", html, "text/html", "utf-8", null);
//		
//		wv.setWebChromeClient(new WebChromeClient(){
//			@Override
//		    public boolean onConsoleMessage(ConsoleMessage cm)
//		    {
//		        Log.d("CONTENT", String.format("%s @ %d: %s", cm.message(), cm.lineNumber(), cm.sourceId()));
//		        return true;
//		    }
//			
//		});
//
//		wv.setWebViewClient(new WebViewClient() {
//			/*@Override
//			public boolean shouldOverrideUrlLoading(WebView view, String url) {
//				view.loadUrl(url);
//				return true;
//			}
//			
//			@Override  
//		    public void onLoadResource(WebView view, String url) {  
//		        Log.e("cache", "onLoadResource-url="+url);  
//				if( url.indexOf("3rd-lib") > -1 ) {
//					File f = new File(url);
//					if( !f.exists() ) {
//						url = "file:///android_asset/client/asserts/bg-white.png";
//					}
//				}
//				super.onLoadResource(view, url);  
//		    }  */
//
//			@Override
//			public void onPageStarted(WebView view, String url, Bitmap favicon) {
//			}
//			@Override
//			public void onPageFinished(WebView view, String url) {
//				// view.loadUrl("javascript:window.HTMLOUT.processHTML('<html>'+document.getElementsByTagName('html')[0].innerHTML+'</html>');");
//				getFragmentManager().beginTransaction().hide(lf).commit();
//			}
//
//			@Override
//			public WebResourceResponse shouldInterceptRequest(WebView view,	String url) {
//				Log.e("cache", "shouldInterceptRequest-url="+url);
//				int i = 0;
//				if (url.endsWith("js")) {
//					InputStream js = code.get(url.substring(url.lastIndexOf("/www/")+5));
//					return new WebResourceResponse("text/javascript", "utf-8", js);
//				} else if ( ( i = url.indexOf("html") ) > -1) {
//					InputStream html = code.get(url.substring(url.lastIndexOf("/www/")+5, i+4));
//					return new WebResourceResponse("text/html", "utf-8", html);
//				}else if( ( i = url.indexOf("3rd-lib") ) > -1 ) {
//					File f = new File(url.substring(7).toLowerCase());
//					try {
//						if( !f.exists() ) {
//							return new WebResourceResponse("", "", new FileInputStream(Configuration.dirWWW()+"asserts/bg-white.png"));
//						} else {
//							return new WebResourceResponse("", "", new FileInputStream(f) );
//						}
//					} catch (FileNotFoundException e) {
//						// TODO Auto-generated catch block
//						e.printStackTrace();
//					}
//				}
//				return super.shouldInterceptRequest(view, url);
//			}
//		});
//	}
//
//	private String readAssetFile(String fileName) {
//	    StringBuilder buffer = new StringBuilder();
//	    try {
//		    InputStream fileInputStream = getAssets().open(fileName);
//		    BufferedReader bufferReader = new BufferedReader(new InputStreamReader(fileInputStream, "UTF-8"));
//		    String str;
//	
//		    while ((str=bufferReader.readLine()) != null) {
//		        buffer.append(str);
//		    }
//		    fileInputStream.close();
//	    }catch (Exception e ) {
//	    	
//	    }
//
//	    return buffer.toString();
//	}
//	
//	@Receiver(actions = "com.jiexx.aiyou.START")
//	protected void onProgress() {
//		wv.loadUrl(wwwHome());
//	}
//	
//	public String wwwHome() {
//		//return "file:///android_asset/client/index.html#/?id=15800000000&lng=121.429&lat=31.289&srv="+Base64.encodeBytes(Configuration.rootUrl.getBytes()); 
//		return  "file://"+Configuration.dirWWW()+"index.html#/?id=15800000000&lng=121.429&lat=31.289&srv="+Base64.encodeBytes(Configuration.rootUrl.getBytes());
//	}

}
