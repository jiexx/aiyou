package com.jiexx.aiyou;

import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
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
	UpgradePrefs_ up;

	@SystemService
	NotificationManager notificationManager;

	HashMap<String, String> localCode = new HashMap<String, String>();

	@Override
	protected void onHandleIntent(Intent i) {
		// TODO Auto-generated method stub
		Upgrade ui = uq.getUpgradeInfo("android", currentVersion());
		try {
			ui.handleCommand(this);
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
	
	public byte[] updateDown(String version) {
		return ud.getUpdateBytes(version);
	}
	
	public byte[] upgradeDown(String version) {
		return ud.getUpgradeBytes(version);
	}

	public File save(String version, byte[] buff) throws IOException {
		int size = 0;
		File f = null;
		FileOutputStream fos = null;
		BufferedOutputStream bos = null;
		FileInputStream fis = null;
		try {
			f = new File(fileStored(version));
			fos = new FileOutputStream(f);
			bos = new BufferedOutputStream(fos);
			bos.write(buff);
            if( f.exists() ) {
				fis = new FileInputStream(f);
				size= fis.available();
            }
		} finally {
			if (fos != null) {
				fos.close();
			}
			if (bos != null) {
				bos.close();
			}
			if (fis != null) {
				fis.close();
			}
		}
		if( size > -1 )
			return f;
		return null;
	}
	
	public void pushVersion(String version) {
		File f = new File(fileStored(previousVersion()));
		if( f.exists() ) {
			f.delete();
			up.previous().put(currentVersion());
		}
		up.version().put(version);
	}
	
	public String currentVersion() {
		return up.version().get();
	}
	
	public String previousVersion() {
		return up.previous().get();
	}

	public String fileStored(String version) {
		return "/data/data/" + this.getPackageName() + "/" + version + ".pkg";
	}
	

	public boolean extract(String version) throws IOException {
		ZipFile zip = null;
		localCode.clear();
		try {
			zip = new ZipFile(fileStored(version));
			Enumeration<? extends ZipEntry> z = zip.entries();
			StringBuilder total = new StringBuilder();
			String line;
			ZipDecryptInputStream zdis = null;
			BufferedReader br = null;
			while (z.hasMoreElements()) {
				try {
					ZipEntry ze = z.nextElement();
					zdis = new ZipDecryptInputStream(zip.getInputStream(ze), String.valueOf(0xff123456));
					br = new BufferedReader(new InputStreamReader(zdis));
					while ((line = br.readLine()) != null) {
						total.append(line);
					}
					localCode.put(ze.getName(), total.toString());
				}finally {
					zdis.close();
					br.close();
				}
			}
		} finally {
			if( zip != null )
				zip.close();
		}
		return localCode.size() > 0;
	}
	
	public HashMap<String, String> getLocalCode() {
		return localCode;
	}
	
	public void start() {
		MainActivity_.intent(this).code(localCode).start();
	}

}
