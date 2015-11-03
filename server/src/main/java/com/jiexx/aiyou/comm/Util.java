package com.jiexx.aiyou.comm;

import java.io.BufferedInputStream;
import java.io.IOException;
import java.security.GeneralSecurityException;
import java.security.SecureRandom;
import java.security.spec.KeySpec;
import java.sql.SQLException;
import java.text.SimpleDateFormat;
import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.LinkedList;

import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.DESKeySpec;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.PBEKeySpec;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.util.Base64Utils;

import com.google.gson.Gson;
import com.jiexx.aiyou.model.User;
import com.jiexx.aiyou.resp.Response;
import com.mysql.jdbc.Blob;

public class Util {
	protected static Gson gson = new Gson();
	public static String toJsonp(Response resp) {
		return "angular.callbacks._0("+gson.toJson(resp)+")";
	}
	public static String toJson(Response resp) {
		return gson.toJson(resp);
	}
	public static <T> T fromJson(String json, Class<T> clazz) {
		return gson.fromJson(json, clazz);
	}
	public static class Grid {
		private static final float cellx = 0.001f;
		private static final float celly = 0.001f;
		private static final int level = 2;
		private int[][] delta;
		private float originX;
		private float originY;
		private HashMap<Long, User> cells = new HashMap<Long, User>();
		private final int[][][] coord = {{{1,0},{0,1}}, {{0,-1},{1,0}}, {{-1,0},{0,-1}}, {{0,1},{-1,0}}};
		public Grid() {
			int perimeter  = 4 * ( level + 1 ) * level;
			delta = new int[perimeter][2];
			int pos = 0;
			for(int i = 1 ; i <= level ; i ++) {
				int distance = i ;
				for(int c = 0 ; c < 4 ; c ++ ) {
					for(int e = -distance ; e < distance ; e ++) {
						delta[pos][0] = coord[c][0][0] * e +coord[c][0][1] * distance;
						delta[pos][1] = coord[c][1][0] * e +coord[c][1][1] * distance;
						pos ++;
					}
				}
			}
			System.out.println("step===>"+gson.toJson(delta));
		}
		public void setOrigin(User user) {
			originX = user.x;
			originY = user.y;
			cells.clear();
		}
		public int getPosX(User user) {
			return (int) Math.floor((user.x - originX) / cellx);
		}
		public int getPosY(User user) {
			return (int) Math.floor((user.y - originY) / celly);
		}
		public User get(long i, long j) {
			return cells.get(i<<32 | j);
		}
		public void change(User user) {
			int x = getPosX(user);
			int y = getPosY(user);
			long X = x;
			long Y = y;
			if(get(x, y) == null) {
				cells.put(X<<32 | Y, user);
			}else {
				int i = 0;
				while(get(x+delta[i][0], y+delta[i][1]) != null && i++ < delta.length) ;
				if(i < delta.length) {
					X += delta[i][0];
					Y += delta[i][1];
					user.x = user.x + delta[i][0] * cellx;
					user.y = user.y + delta[i][1] * celly;
					cells.put(X<<32 | Y, user);
				}else {
					Util.log(" "+user.id, "Density of user is too big, grid level is not enough to change coordination");
				}
			}
		}
	}
	public static Grid grid = new Grid();
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
			return Base64Utils.encodeToString(b.getBytes(1, (int) b.length()));
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return null;
	}

	public static byte[] base64ToBytes(String b64) {
		return Base64Utils.decodeFromString(b64);
	}

	public static void quickSort(byte[] list, int low, int high) {
		//System.out.println("quickSort   "+Arrays.toString(list)+" high "+high+" low "+low);
		int i = low, j = high;
		byte tmp;
		int pivot = list[low + (high-low)/2];
		while (i <= j) {
			while (list[i] < pivot) {
				i++;
			}
			while (list[j] > pivot) {
				j--;
			}
			if (i <= j) {
				tmp = list[j];
				list[j] = list[i];
				list[i] = tmp;
				i++;
				j--;
			}
		}
		if (low < i-1)
			quickSort(list, low, i-1);
		if (i < high)
			quickSort(list, i, high);
	}
	public static int findBytes(LinkedList<Byte> arr, byte value) {
		int i = 0;
		while( i < arr.size() && arr.get(i) != value  ) i++;
		if( i < arr.size() )
			return i;
		return -1;
	}
	public static void insert(LinkedList<Byte> arr, byte value) {
		int i = 0;
		while( arr.get(i) < value && i < arr.size() ) i++;
		arr.add(i, value);
	}
	public static class Disc {
		public byte disc1;
		public byte disc2;
		public byte disc3;
		Disc(int i, int j, int k){
			disc1 = (byte) i; disc2 = (byte) j; disc3 = (byte) k;
		}
	}
	public static Disc parseDisc(int opt) {
		return new Disc(((byte)opt&0x00ff0000>>16), ((byte)opt&0x0000ff00>>8), ((byte)opt&0x000000ff));
	}
	
	public static void log(String user, String str) {
		StackTraceElement traceElement = ((new Exception()).getStackTrace())[1]; 
		Date now = new Date(); 
		SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss.SSS"); 
		System.out.println(sdf.format(now)+"   ["+user+"]   "+traceElement.getMethodName());
		System.out.println("                                           "+str+"\n");
	}
	
	public static SecretKey generateKeyFromPassword(String password, byte[] saltBytes) throws GeneralSecurityException {

	    KeySpec keySpec = new PBEKeySpec(password.toCharArray(), saltBytes, 100, 128);
	    SecretKeyFactory keyFactory = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA1");
	    SecretKey secretKey = keyFactory.generateSecret(keySpec);

	    return new SecretKeySpec(secretKey.getEncoded(), "AES");
	}
	
	public static String decrypt(String encryptedData, SecretKeySpec sKey, IvParameterSpec ivParameterSpec) throws Exception { 

	    Cipher c = Cipher.getInstance("AES/CBC/PKCS5Padding");
	    c.init(Cipher.DECRYPT_MODE, sKey, ivParameterSpec);
	    byte[] decordedValue = Base64Utils.decodeFromString(encryptedData);
	    byte[] decValue = c.doFinal(decordedValue);
	    String decryptedValue = new String(decValue);

	    return decryptedValue;
	}

}
