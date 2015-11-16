package com.jiexx.aiyou;

import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.security.SecureRandom;
import java.text.DecimalFormat;
import java.util.Arrays;
import java.util.HashMap;
import java.util.zip.ZipEntry;
import java.util.zip.ZipFile;
import java.util.zip.ZipInputStream;

import javax.crypto.Cipher;
import javax.crypto.CipherInputStream;
import javax.crypto.CipherOutputStream;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.DESKeySpec;
import javax.crypto.spec.PBEKeySpec;
import javax.crypto.spec.SecretKeySpec;

import org.androidannotations.annotations.EService;
import org.androidannotations.annotations.SystemService;
import org.androidannotations.annotations.rest.RestService;
import org.androidannotations.annotations.sharedpreferences.Pref;
import org.springframework.util.support.Base64;

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

	static HashMap<String, InputStream> localCode = new HashMap<String, InputStream>();

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
	
	public byte[] codeDown(String version) {
		return ud.getCodeBytes(version);
	}
	
	public byte[] resourceDown(String version) {
		return ud.getResourceBytes(version);
	}
	
	public byte[] upgradeDown(String version) {
		return ud.getUpgradeBytes(version);
	}

	public File save(String path, byte[] buff) throws IOException {
		TOTAL_SIZE += buff.length;
		int size = 0;
		File f = null;
		FileOutputStream fos = null;
		BufferedOutputStream bos = null;
		FileInputStream fis = null;
		try {
			f = new File(path);
			if( !f.exists() ) {
				f.getParentFile().mkdirs();
			}
			fos = new FileOutputStream(path);
			bos = new BufferedOutputStream(fos);
			bos.write(buff);
			fos.flush();
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
			buff = null;
		}
		if( size > -1 )
			return f;
		return null;
	}
	
	public void pushVersion(String version) {
		File code = new File(fileCodeStored(previousVersion()));
		File res = new File(fileResourceStored(previousVersion()));
		if( code.exists() || res.exists() ) {
			code.delete();
			res.delete();
			up.previous().put(currentVersion());
		}
		up.version().put(version);
	}
	
	public String currentVersion() {
		File code = new File(fileCodeStored(up.version().get()));
		File res = new File(fileResourceStored(up.version().get()));
		if( code.exists() && res.exists() ){  
			return up.version().get();
        }
		up.version().put("null");
		return up.version().get();
	}
	
	public String previousVersion() {
		File code = new File(fileCodeStored(up.previous().get()));
		File res = new File(fileResourceStored(up.previous().get()));
		if( code.exists() && res.exists() ){  
			return up.version().get();
        }
		up.previous().put("null");
		return up.previous().get();
	}
	
	public String fileUpgradeStored(String version) {
		return "/data/data/" + this.getPackageName() + "/upgrade/" + version + ".pkg";
	}

	public String fileCodeStored(String version) {
		return "/data/data/" + this.getPackageName() + "/upgrade/" + version + ".code";
	}
	
	public String fileResourceStored(String version) {
		return "/data/data/" + this.getPackageName() + "/upgrade/" + version + ".resource";
	}
	
	
	public String dirWWW() {
		return "/data/data/" + this.getPackageName() + "/www/"; //Context.getFilesDir().getPath() 
	}
	
	private void deleteFile(File file){
	     if(file.isDirectory()){
	          File[] files = file.listFiles();
	          for(int i=0; i<files.length; i++){
	               deleteFile(files[i]);
	          }
	     }
	     file.delete();
	}
	
	public void clearWWW() {
		File f = new File(dirWWW());
		if( f.exists() ) {
			deleteFile(f);
		}
	}
	
	public void writeFile( ZipInputStream zis, String file ) throws IOException {
		File f = new File(dirWWW()+file);
		long start = System.currentTimeMillis();
		System.out.println("       "+file+" size: " + zis.available());
		f.getParentFile().mkdirs();
		FileOutputStream fos = new FileOutputStream(f);
		byte[] buffer = new byte[4096];
		  
		int count, size = 0;
		while( ( count = zis.read(buffer) ) != -1 ){
			fos.write(buffer, 0, count);
			size += count;
			//System.out.println("       "+file+" write: "+ (System.currentTimeMillis() - start) +"    "+count );
		}
		fos.flush();
		System.out.println("       "+file+" flush: "+ (System.currentTimeMillis() - start) +" size: "+size );
		fos.close();
		System.out.println("       "+file+" finish: "+ (System.currentTimeMillis() - start) );
	}
	private static byte[] decrypt(byte[] raw, String password) throws Exception {
		long start = System.currentTimeMillis();
		byte[] salt = {1,1,1,1};
		SecretKeyFactory skf = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA1");
		PBEKeySpec spec = new PBEKeySpec(password.toCharArray(), salt, 2, 128);
		SecretKey sk = skf.generateSecret(spec);
		SecretKey secret = new SecretKeySpec(sk.getEncoded(), "AES");
		System.out.println("        decrypt: " + (System.currentTimeMillis() - start) + "  " + secret.getEncoded());
		
	    Cipher cipher = Cipher.getInstance("AES");
	    cipher.init(Cipher.DECRYPT_MODE, secret);
	    byte[] decrypted = cipher.doFinal(raw);
	    
	    System.out.println("        decrypt: " + (System.currentTimeMillis() - start) + "  "  + decrypted.length);
	    return decrypted;
	}
	
	private static Cipher getCipher(String password) throws Exception {
		long start = System.currentTimeMillis();
		byte[] salt = {1,1,1,1};
		SecretKeyFactory skf = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA1");
		PBEKeySpec spec = new PBEKeySpec(password.toCharArray(), salt, 2, 128);
		SecretKey sk = skf.generateSecret(spec);
		SecretKey secret = new SecretKeySpec(sk.getEncoded(), "AES");
		
	    SecretKeySpec skeySpec = new SecretKeySpec(secret.getEncoded(), "AES");
	    Cipher cipher = Cipher.getInstance("AES");
	    cipher.init(Cipher.DECRYPT_MODE, skeySpec);
	    
	    return cipher;
	}
	
	public ByteArrayInputStream getCodeInputStream(String version) {
		try {
			FileInputStream fis = new FileInputStream(fileCodeStored(version));
			if( fis.available() <= 0 ) {
				fis.close();
				return null;
			}
			long start = System.currentTimeMillis();
			BufferedInputStream bis = new BufferedInputStream(fis);
			byte[] buffer = new byte[4096];
			ByteArrayOutputStream baos = new ByteArrayOutputStream();
			int count;
			while( (count = bis.read(buffer)) != -1 ) {
				baos.write(buffer, 0, count);
			}
			System.out.println("        convert: " + (System.currentTimeMillis() - start) + " size: " + baos.size());
			byte[] decrypt = decrypt(baos.toByteArray(), String.valueOf(0xff123456L));
			baos.flush();
			baos.close();
			bis.close();
			return new ByteArrayInputStream(decrypt);
		}catch( Exception e ) {
			e.printStackTrace();
		}
		return null;
	}
	
	public InputStream getResourceInputStream(String version) {
		try {
			FileInputStream fis = new FileInputStream(fileResourceStored(version));
			return new BufferedInputStream(fis);
		}catch( Exception e ) {
			e.printStackTrace();
		}
		return null;
	}

	public void extract(InputStream is) throws IOException {
		if( is == null ) 
			return;
		
		ByteArrayOutputStream total = null;
		ZipDecryptInputStream zdis = null;
		ZipInputStream zis = null;
		try {
			String name, mime;
			//String pwd = String.valueOf(0xff123456L);//4279383126
			//zdis = new ZipDecryptInputStream(fis, pwd);
			zis = new ZipInputStream(is);
			BufferedInputStream bis = null;
			byte[] buffer = new byte[4096];
			int count;
			ZipEntry ze;
	        while ((ze = zis.getNextEntry()) != null) {
	        	name = ze.getName().substring(2);
	        	if( !ze.isDirectory() ) {
	        		mime = name.substring(name.lastIndexOf('.'));
	        		if(mime.equals(".html") || mime.equals(".js")) {
    		        	bis = new BufferedInputStream(zis);
    		        	total = new ByteArrayOutputStream();
    		        	while ((count = bis.read(buffer, 0, 4096)) != -1) {
    		        		total.write(buffer, 0, count);
    		            }
    		        	total.flush();
    		        	HANDLED_SIZE += total.size();
    		        	System.out.println("        localCode: " + name + " size: " + total.size());
    					localCode.put(name, new ByteArrayInputStream(total.toByteArray()));
    					total.close();
    					//br.close();
	        		}else {
	        			writeFile(zis, name);
	        			HANDLED_SIZE += zis.available();
	        		}
	        		
	        	}
	        	notifyProgress();
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
			is.close();
		}
		notify("启动");
	}
	
	public HashMap<String, InputStream> getLocalCode() {
		return localCode;
	}
	
	public void start() {
		MainActivity_.intent(getApplication()).flags(Intent.FLAG_ACTIVITY_NEW_TASK).start();
	}
	
	public void notify(String info) {
		Intent intent = new Intent();  
        intent.setAction("com.jiexx.aiyou.PROGRESS");  
        intent.putExtra("info", info);  
        sendBroadcast(intent);
	}
	
	public void notifyProgress() {
		float per = (float)HANDLED_SIZE/(float)TOTAL_SIZE;
		notify( "解压中 " + new DecimalFormat("##%").format(per) );
	}
	
	private int TOTAL_SIZE = 0;
	private int HANDLED_SIZE = 0;
	

}
