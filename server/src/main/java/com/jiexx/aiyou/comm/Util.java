package com.jiexx.aiyou.comm;

import java.io.BufferedInputStream;
import java.io.IOException;
import java.security.SecureRandom;
import java.sql.SQLException;

import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.DESKeySpec;

import org.springframework.util.Base64Utils;

import com.mysql.jdbc.Blob;

public class Util {
	public static String decrypt(String encryptedData, String key) {
		String ret = null;
		byte[] keyByte = getByteArray(key);
		byte[] byteData = getByteArray(encryptedData.toLowerCase());
		try {
			ret = new String(decrypt(byteData, keyByte));
		} catch (Exception e) {
			e.printStackTrace();
		}

		return ret;
	}

	public static byte[] encrypt(byte[] data, byte[] keyBytes) throws Exception {
		DESKeySpec dks = new DESKeySpec(keyBytes);
		SecretKeyFactory keyFactory = SecretKeyFactory.getInstance("DES");
		SecretKey key = keyFactory.generateSecret(dks);
		SecureRandom sr = new SecureRandom();
		Cipher cipher = Cipher.getInstance("DES");
		cipher.init(Cipher.ENCRYPT_MODE, key, sr);
		byte[] encryptedData = cipher.doFinal(data);
		return encryptedData;
	}

	public static byte[] decrypt(byte[] data, byte[] keyBytes) throws Exception {
		DESKeySpec dks = new DESKeySpec(keyBytes);
		SecretKeyFactory keyFactory = SecretKeyFactory.getInstance("DES");
		SecretKey key = keyFactory.generateSecret(dks);
		SecureRandom sr = new SecureRandom();
		Cipher cipher = Cipher.getInstance("DES");
		cipher.init(Cipher.DECRYPT_MODE, key, sr);
		byte[] decryptedData = cipher.doFinal(data);
		return decryptedData;
	}

	public static byte[] getKey() throws Exception {
		SecureRandom sr = new SecureRandom();
		KeyGenerator kg = KeyGenerator.getInstance("DES");
		kg.init(56);
		kg.init(sr);
		SecretKey key = kg.generateKey();
		byte[] b = key.getEncoded();
		return b;
	}

	public static String getHexString(byte[] b) {
		StringBuffer result = new StringBuffer();
		for (int i = 0; i < b.length; i++) {
			String hex = Integer.toHexString(b[i] & 0xFF);
			if (hex.length() == 1) {
				hex = '0' + hex;
			}
			result.append(hex.toLowerCase());
		}
		return result.toString();
	}

	public static byte[] getByteArray(String hex) {
		int len = (hex.length() / 2);
		byte[] result = new byte[len];
		char[] achar = hex.toCharArray();
		for (int i = 0; i < len; i++) {
			int pos = i * 2;
			result[i] = (byte) (toByte(achar[pos]) << 4 | toByte(achar[pos + 1]));
		}
		return result;
	}

	private static int toByte(char c) {
		byte b = (byte) "0123456789abcdef".indexOf(c);
		return b;
	}
	
	public static byte[] blobToBytes(Blob blob) {

		BufferedInputStream is = null;

		try {
			is = new BufferedInputStream(blob.getBinaryStream());
			byte[] bytes = new byte[(int) blob.length()];
			int len = bytes.length;
			int offset = 0;
			int read = 0;

			while (offset < len && (read = is.read(bytes, offset, len - offset)) >= 0) {
				offset += read;
			}
			return bytes;
		} catch (Exception e) {
			return null;
		} finally {
			try {
				is.close();
				is = null;
			} catch (IOException e) {
				return null;
			}
		}
	}
	
	public static String blobToBase64(Blob b) {
		try {
			return  Base64Utils.encodeToString(b.getBytes(1, (int) b.length()));
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return null;
	}
	
	public static byte[] base64ToBytes(String b64) {
		return  Base64Utils.decodeFromString(b64);
	}
	
	public static int getMiddle(char[] list, int low, int high) {
		char tmp = list[low];    
		while (low < high) {
			while (low < high && list[high] > tmp) {
				high--;
			}
			list[low] = list[high];  
			while (low < high && list[low] < tmp) {
				low++;
			}
			list[high] = list[low];   
		}
		list[low] = tmp;             
		return low;                  
	}
	
	public static void quickSort(char[] list, int low, int high) {
		if (low < high) {
			int middle = getMiddle(list, low, high);  
			quickSort(list, low, middle - 1);       
			quickSort(list, middle + 1, high);     
		}
	}


}
