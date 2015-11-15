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
import java.io.InputStreamReader;
import java.security.SecureRandom;
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

	static HashMap<String, String> localCode = new HashMap<String, String>();

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
			buff = null;
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
		return "/data/data/" + this.getPackageName() + "/www/"; //Context.getFilesDir().getPath() 
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
	
	private ByteArrayInputStream convert(String version) {
		try {
			FileInputStream fis = new FileInputStream(fileStored(version));
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
			baos.close();
			bis.close();
			return new ByteArrayInputStream(decrypt);
		}catch( Exception e ) {
			e.printStackTrace();
		}
		return null;
	}

	public boolean extract(String version) throws IOException {
		ByteArrayInputStream bais = convert(version);
		if( bais == null ) 
			return false;
		localCode.clear();
		
		StringBuilder total = new StringBuilder();
		ZipDecryptInputStream zdis = null;
		ZipInputStream zis = null;
		try {
			String line, name, mime;
			//String pwd = String.valueOf(0xff123456L);//4279383126
			//zdis = new ZipDecryptInputStream(fis, pwd);
			zis = new ZipInputStream(bais);
			BufferedReader br = null;
			ZipEntry ze;
	        while ((ze = zis.getNextEntry()) != null) {
	        	name = ze.getName();
	        	if( !ze.isDirectory() ) {
	        		mime = name.substring(name.lastIndexOf('.'));
	        		if(mime.equals(".html") || mime.equals(".js")) {
    		        	br = new BufferedReader(new InputStreamReader(zis));
    		        	while ((line = br.readLine()) != null) {
    		        		total.append(line);
    		            }
    					localCode.put(ze.getName(), total.toString());
    					total.delete( 0, total.length());
    					//br.close();
	        		}else {
	        			writeFile(zis, name);
	        		}
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
			bais.close();
		}
		return localCode.size() > 0;
	}
	
	public HashMap<String, String> getLocalCode() {
		return localCode;
	}
	
	public void start() {
		MainActivity_.intent(getApplication()).flags(Intent.FLAG_ACTIVITY_NEW_TASK).start();
	}

}
