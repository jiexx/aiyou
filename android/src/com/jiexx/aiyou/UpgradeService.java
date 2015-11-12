package com.jiexx.aiyou;

import java.io.BufferedOutputStream;
import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.zip.ZipEntry;
import java.util.zip.ZipFile;
import java.util.zip.ZipInputStream;

import org.androidannotations.annotations.EService;
import org.androidannotations.annotations.SystemService;
import org.androidannotations.annotations.rest.RestService;
import org.androidannotations.annotations.sharedpreferences.Pref;
import org.springframework.util.support.Base64;

import android.app.IntentService;
import android.app.NotificationManager;
import android.content.Intent;
import android.net.Uri;

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
		try {
			Upgrade ui = uq.getUpgradeInfo("android", Base64.encodeBytes(currentVersion().getBytes()));
			ui.handleCommand(this);
		} catch (Exception e) {
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
		String path = fileStored(version);
		try {
			f = new File(path.substring(0, path.lastIndexOf('/')));
			if( !f.exists() ) {
				f.mkdirs();
			}
			fos = new FileOutputStream(path);
			bos = new BufferedOutputStream(fos);
			bos.write(buff);
			f = new File(path);
            if( f.exists() ) {
				fis = new FileInputStream(f);
				size= fis.available();
            }
		} finally {
			if (fos != null) {
				fos.close();
				fos = null;
			}
			if (bos != null) {
				bos.close();
				bos = null;
			}
			if (fis != null) {
				fis.close();
				fis = null;
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
		File www = new File(fileStored(up.version().get()));
		if(www.exists()){  
			return up.version().get();
        }
		up.version().put("null");
		return up.version().get();
	}
	
	public String previousVersion() {
		return up.previous().get();
	}

	public String fileStored(String version) {
		return "/data/data/" + this.getPackageName() + "/upgrade/" + version + ".pkg";
	}
	
	
	public String dirWWW() {
		return "/data/data/" + this.getPackageName() + "/www/";
	}
	

	public boolean extract(String version) throws IOException {
		FileInputStream fis = new FileInputStream(fileStored(version));
		if( fis.available() <= 0 )
			return false;
		localCode.clear();
		
		StringBuilder total = new StringBuilder();
		ZipDecryptInputStream zdis = null;
		ZipInputStream zis = null;
		try {
			String line;
			
			zdis = new ZipDecryptInputStream(fis, String.valueOf(0xff123456));
			zis = new ZipInputStream(zdis);
			BufferedReader br = new BufferedReader(new InputStreamReader(zis)); 
			
			ZipEntry ze;
	        while ((ze = zis.getNextEntry()) != null) {
	        	try {
		        	br = new BufferedReader(new InputStreamReader(zis));
		        	while ((line = br.readLine()) != null) {
		        		total.append(line);
		            }
	        	}finally {
					if( total != null ) {
						total.delete( 0, total.length());
					}
					if( br != null ) {
						br.close();
						br = null;
					}
					zis.closeEntry();
				}
	        }
		} finally {
			if( zdis != null ) {
				zdis.close();
				zdis = null;
			}
			if( zis != null ) {
				zis.close();
				zis = null;
			}
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
