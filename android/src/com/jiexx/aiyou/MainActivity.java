package com.jiexx.aiyou;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.InputStream;
import java.util.HashMap;

import org.androidannotations.annotations.Background;
import org.androidannotations.annotations.EActivity;
import org.androidannotations.annotations.FragmentById;
import org.androidannotations.annotations.Receiver;
import org.androidannotations.annotations.UiThread;
import org.androidannotations.annotations.ViewById;

import android.os.Bundle;
import android.util.Log;
import android.webkit.WebResourceResponse;
import android.app.Activity;
import android.app.FragmentManager;
import android.app.FragmentTransaction;

import org.springframework.util.support.Base64;
import org.xwalk.core.XWalkPreferences;
import org.xwalk.core.XWalkResourceClient;
import org.xwalk.core.XWalkUIClient;
import org.xwalk.core.XWalkView;

@EActivity(R.layout.activity_main)
public class MainActivity extends Activity {

	HashMap<String, InputStream> code;
	
	LoadingFragment lf;

	@ViewById(R.id.webView)
	XWalkView wv;

	@Override
	public void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.activity_main);
		
		UpgradeService_.intent(this).start();

		code = UpgradeService.localCode;
		
		lf = new LoadingFragment_().builder().build();
		FragmentManager fm = getFragmentManager();
		FragmentTransaction ft = fm.beginTransaction();
		ft.add(R.id.loadingView, lf);
		ft.commit();
	}
	@Receiver(actions = "com.jiexx.aiyou.START")
	protected void onProgress() {
		getFragmentManager().beginTransaction().hide(lf).commit();
		go();
	}
	
	@UiThread
	public void go() {
		wv = (XWalkView) findViewById(R.id.webView);
		XWalkPreferences.setValue("enable-javascript", true);
		XWalkPreferences.setValue(XWalkPreferences.REMOTE_DEBUGGING, true);
		wv.setUIClient(new XWalkUIClient(wv) {
			@Override
			public void onPageLoadStopped(XWalkView view, String url, LoadStatus status) {
				if( LoadStatus.FINISHED == status ) {
					getFragmentManager().beginTransaction().hide(lf).commit();
				}
			}
			@Override
            public boolean onConsoleMessage(XWalkView view, String message, int lineNumber, String sourceId, ConsoleMessageType messageType) {
				Log.d("CONTENT", String.format("%s @ %d: %s", message, lineNumber, sourceId));
                return super.onConsoleMessage(view, message, lineNumber, sourceId, messageType);
            }
		});
		wv.clearCache(true);
		wv.setResourceClient(new XWalkResourceClient(wv) {

			@Override
			public	WebResourceResponse shouldInterceptLoadRequest(XWalkView view,	String url) {
				Log.e("cache", "shouldInterceptRequest-url="+url +"   "+code.size());
				int i = 0;
				if (url.endsWith("js")) {
					InputStream js = code.get(url.substring(url.lastIndexOf("/www/")+5));
					return new WebResourceResponse("text/javascript", "utf-8", js);
				} else if ( ( i = url.indexOf("html") ) > -1) {
					InputStream html = code.get(url.substring(url.lastIndexOf("/www/")+5, i+4));
					return new WebResourceResponse("text/html", "utf-8", html);
				}else if( ( i = url.indexOf("3rd-lib") ) > -1 ) {
					File f = new File(url.substring(7).toLowerCase());
					try {
						if( !f.exists() ) {
							return new WebResourceResponse("", "", new FileInputStream(Configuration.dirWWW()+"asserts/bg-white.png"));
						} else {
							return new WebResourceResponse("", "", new FileInputStream(f) );
						}
					} catch (FileNotFoundException e) {
						// TODO Auto-generated catch block
						e.printStackTrace();
					}
				}
				return super.shouldInterceptLoadRequest(view, url);
			}
		});
		wv.load(wwwHome(), null);
	}
//	
	public String wwwHome() {
		//return "file:///android_asset/client/index.html#/?id=15800000000&lng=121.429&lat=31.289&srv="+Base64.encodeBytes(Configuration.rootUrl.getBytes()); 
		return  "file://"+Configuration.dirWWW()+"index.html#/?id=15800000000&lng=121.429&lat=31.289&srv="+Base64.encodeBytes(Configuration.rootUrl.getBytes());
	}

}
