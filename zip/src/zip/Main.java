package zip;

import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.security.SecureRandom;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.DESKeySpec;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.PBEKeySpec;
import javax.crypto.spec.SecretKeySpec;

import com.alutam.ziputils.ZipEncryptOutputStream;


// usage: java Main zip-file-name password filename1 [filename2 [filename3 [...]]]
public class Main {
	static void zip(String zipFileName, File inputFile, String pwd) throws Exception {
		// create a stream that will encrypt the resulting zip file
		// using the password provided in the second command line argument		
		//ZipEncryptOutputStream zeos = new ZipEncryptOutputStream(new FileOutputStream(zipFileName), pwd);
		//ZipOutputStream out = new ZipOutputStream(new FileOutputStream(zipFileName));
		// create the standard zip output stream, initialize it with our
		// encrypting stream
		ZipOutputStream zos = new ZipOutputStream(/*zeos*/new FileOutputStream(zipFileName));
		BufferedOutputStream bo = new BufferedOutputStream(zos);
		//BufferedOutputStream bo = new BufferedOutputStream(out);
		zip(zos, inputFile, inputFile.getName(), bo);
		bo.close();
		zos.close(); 
		//out.close(); 
		System.out.println("done");
	}
	private static int k = 1;
	private static byte[] encrypt(byte[] raw, String password) throws Exception {
		byte[] salt = {1,1,1,1};
		SecretKeyFactory skf = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA1");
		PBEKeySpec spec = new PBEKeySpec(password.toCharArray(), salt, 2, 128);
		SecretKey sk = skf.generateSecret(spec);
		SecretKey secret = new SecretKeySpec(sk.getEncoded(), "AES");

		Cipher cipher = Cipher.getInstance("AES");
		cipher.init(Cipher.ENCRYPT_MODE, secret);
		/*DESKeySpec keySpec = new DESKeySpec(password.getBytes());
		SecretKeyFactory keyFactory = SecretKeyFactory.getInstance("DES");
		SecretKey key = keyFactory.generateSecret(keySpec);
		
		Cipher cipher = Cipher.getInstance("DES"); // cipher is not thread safe
		cipher.init(Cipher.ENCRYPT_MODE, key);*/
	    byte[] encrypted = cipher.doFinal(raw);
	    return encrypted;
	}
	static void zip(ZipOutputStream out, File f, String base, BufferedOutputStream bo) throws Exception { // ·½·¨ÖØÔØ
		if (f.isDirectory()) {
			File[] fl = f.listFiles();
			if (fl.length == 0) {
				out.putNextEntry(new ZipEntry(base + "/")); 
				System.out.println(base + "/");
			}
			for (int i = 0; i < fl.length; i++) {
				zip(out, fl[i], base + "/" + fl[i].getName(), bo); 
			}
			System.out.println("zip "+f.getName());
			k++;
		} else {
			out.putNextEntry(new ZipEntry(base)); 
			System.out.println(base);
			FileInputStream in = new FileInputStream(f);
			BufferedInputStream bi = new BufferedInputStream(in);
			int b;
			while ((b = bi.read()) != -1) {
				bo.write(b); 
			}
			bi.close();
			in.close(); 
		}
	}

	public static void main(String[] args) throws Exception {
		File src = new File(args[1]);
		File tmp = new File(args[0]+".tmp");
		zip(args[0], src, args[2]);
		File f = new File(args[0]);
		System.out.println("          file: "+f.getName());
		if( f.exists() ) {
			BufferedInputStream bis = new BufferedInputStream(new FileInputStream(f));
			byte[] buffer = new byte[4096];
			BufferedOutputStream bos = new BufferedOutputStream(new FileOutputStream(tmp));
			ByteArrayOutputStream baos = new ByteArrayOutputStream();
			int count;
			while( (count = bis.read(buffer)) != -1 ) {
				baos.write(buffer, 0, count);
			}
			byte[] encrypt = encrypt(baos.toByteArray(), args[2]);
			bos.write(encrypt);
			bos.close();
			baos.close();
			bis.close();
		}
		/*// create a stream that will encrypt the resulting zip file
		// using the password provided in the second command line argument
		ZipEncryptOutputStream zeos = new ZipEncryptOutputStream(new FileOutputStream(args[0]), args[1]);
		// create the standard zip output stream, initialize it with our
		// encrypting stream
		ZipOutputStream zos = new ZipOutputStream(zeos);

		// write the zip file
		for (int i = 2; i < args.length; i++) {
			ZipEntry ze = new ZipEntry(args[i]);
			zos.putNextEntry(ze);
			InputStream is = new FileInputStream(args[i]);
			int b;
			while ((b = is.read()) != -1) {
				zos.write(b);
			}
			zos.closeEntry();
		}
		zos.close();*/
	}
}