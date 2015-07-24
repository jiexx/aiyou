package com.jiexx.aiyou.comm;

import java.security.SecureRandom;

import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.DESKeySpec;

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
	
}
