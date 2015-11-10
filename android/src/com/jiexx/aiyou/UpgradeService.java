package com.jiexx.aiyou;

import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.BufferedReader;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.zip.ZipEntry;
import java.util.zip.ZipFile;

import org.androidannotations.annotations.EService;
import org.androidannotations.annotations.SystemService;
import org.androidannotations.annotations.rest.RestService;
import org.androidannotations.annotations.sharedpreferences.Pref;

import android.app.IntentService;
import android.app.NotificationManager;
import android.content.Intent;

@EService
public class UpgradeService extends IntentService {

	public UpgradeService() {
		super(UpgradeService.class.getSimpleName());
		// TODO Auto-generated constructor stub
	}

	@RestService
	UpgradeQuery uq;

	@RestService
	UpgradeDown ud;

	@Pref
	UpgradePrefs up;

	@SystemService
	NotificationManager notificationManager;

	HashMap<String, String> localCode = new HashMap<String, String>();

	@Override
	protected void onHandleIntent(Intent i) {
		// TODO Auto-generated method stub
		UpgradeInfo ui = uq.getUpgradeInfo("android", currentVersion());
		ui.handleCommand(this);
	}

	public void download(String version) throws IOException {
		byte[] buff = ud.getBytes(version);

		BufferedOutputStream bos = null;
		try {
			File f = new File(fileStored(version));
			FileOutputStream fos = new FileOutputStream(f);
			bos = new BufferedOutputStream(fos);
			bos.write(buff);
		} finally {
			if (bos != null) {
				bos.close();
			}
		}
	}
	
	public String currentVersion() {
		return up.version();
	}
	
	public String previousVersion() {
		return up.previous();
	}

	public String fileStored(String version) {
		return "/data/data/" + this.getPackageName() + "/" + version + ".pkg";
	}

	public void extract(String version) throws IOException {
		ZipFile zip = null;
		try {
			zip = new ZipFile(fileStored(version));
			Enumeration<? extends ZipEntry> z = zip.entries();
			StringBuilder total = new StringBuilder();
			String line;
			while (z.hasMoreElements()) {
				ZipEntry ze = z.nextElement();
				ZipDecryptInputStream zdis = new ZipDecryptInputStream(zip.getInputStream(ze), String.valueOf(0xff123456));
				BufferedReader br = new BufferedReader(new InputStreamReader(zdis));
				while ((line = br.readLine()) != null) {
					total.append(line);
				}
				localCode.put(ze.getName(), total.toString());
			}
		} finally {
			if( zip != null )
				zip.close();
		}

	}

}
