package com.paypal.base;

import java.util.Enumeration;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Properties;
import java.util.Set;
import java.util.regex.Pattern;

import com.paypal.base.rest.PayPalRESTException;

/**
 * SDKUtil class holds utility methods for processing data transformation
 * 
 */
public final class SDKUtil {

	private SDKUtil() {
	}

	/**
	 * Pattern for replacing Ampersand '&' character
	 */
	private static final Pattern AMPERSAND_REPLACE = Pattern
			.compile("&((?!amp;)(?!lt;)(?!gt;)(?!apos;)(?!quot;))");

/**
	 * Pattern for replacing Lesser-than '<' character
	 */
	private static final Pattern LESSERTHAN_REPLACE = Pattern.compile("<");

	/**
	 * Pattern for replacing Greater-than '>' character
	 */
	private static final Pattern GREATERTHAN_REPLACE = Pattern.compile(">");

	/**
	 * Pattern for replacing Quote '"' character
	 */
	private static final Pattern QUOT_REPLACE = Pattern.compile("\"");

	/**
	 * Pattern for replacing Apostrophe ''' character
	 */
	private static final Pattern APOSTROPHE_REPLACE = Pattern.compile("'");

	/**
	 * Ampersand escape
	 */
	private static final String AMPERSAND = "&amp;";

	/**
	 * Greater than escape
	 */
	private static final String GREATERTHAN = "&gt;";

	/**
	 * Lesser than escape
	 */
	private static final String LESSERTHAN = "&lt;";

	/**
	 * Quot escape
	 */
	private static final String QUOT = "&quot;";

	/**
	 * Apostrophe escape
	 */
	private static final String APOSTROPHE = "&apos;";

	/**
	 * Method replaces invalid XML entities with proper escapes, this method
	 * does not depend on regular expressions
	 * 
	 * @param textContent
	 *            Original text
	 * @return Replaced text
	 */
	public static String escapeInvalidXmlChars(String textContent) {
		StringBuilder stringBuilder = null;
		String response = null;
		if (textContent != null) {
			stringBuilder = new StringBuilder();
			int contentLength = textContent.toCharArray().length;
			for (int i = 0; i < contentLength; i++) {
				char ch = textContent.charAt(i);
				if (ch == '&') {
					if (i != (contentLength - 1)) {
						if (!(i + 3 > contentLength - 1)
								&& (textContent.charAt(i + 1) == 'g' || textContent
										.charAt(i + 1) == 'l')
								&& textContent.charAt(i + 2) == 't'
								&& textContent.charAt(i + 3) == ';') {
							stringBuilder.append(ch);
						} else if (!(i + 4 > contentLength - 1)
								&& textContent.charAt(i + 1) == 'a'
								&& textContent.charAt(i + 2) == 'm'
								&& textContent.charAt(i + 3) == 'p'
								&& textContent.charAt(i + 4) == ';') {
							stringBuilder.append(ch);
						} else if (!(i + 5 > contentLength - 1)
								&& ((textContent.charAt(i + 1) == 'q'
										&& (textContent.charAt(i + 2) == 'u'
												&& textContent.charAt(i + 3) == 'o' && textContent
												.charAt(i + 4) == 't') || (textContent
										.charAt(i + 1) == 'a' && (textContent
										.charAt(i + 2) == 'p'
										&& textContent.charAt(i + 3) == 'o' && textContent
										.charAt(i + 4) == 's'))
										&& textContent.charAt(i + 5) == ';'))) {
							stringBuilder.append(ch);
						} else {
							stringBuilder.append(AMPERSAND);
						}
					} else {
						stringBuilder.append(AMPERSAND);
					}
				} else if (ch == '<') {
					stringBuilder.append(LESSERTHAN);
				} else if (ch == '>') {
					stringBuilder.append(GREATERTHAN);
				} else if (ch == '"') {
					stringBuilder.append(QUOT);
				} else if (ch == '\'') {
					stringBuilder.append(APOSTROPHE);
				} else {
					stringBuilder.append(ch);
				}
			}
			response = stringBuilder.toString();
		}
		return response;
	}

	/**
	 * Method replaces invalid XML entities with proper escapes, this method
	 * depends on regular expressions
	 * 
	 * @param textContent
	 *            Original text
	 * @return Replaced text
	 */
	public static String escapeInvalidXmlCharsRegex(String textContent) {
		String response = "";
		if (textContent != null && textContent.length() != 0) {
			response = APOSTROPHE_REPLACE.matcher(
					QUOT_REPLACE.matcher(
							GREATERTHAN_REPLACE.matcher(
									LESSERTHAN_REPLACE.matcher(
											AMPERSAND_REPLACE.matcher(
													textContent).replaceAll(
													AMPERSAND)).replaceAll(
											LESSERTHAN))
									.replaceAll(GREATERTHAN)).replaceAll(QUOT))
					.replaceAll(APOSTROPHE);
		}
		return response;
	}

	/**
	 * Method replaces invalid XML entities with proper escapes, this method
	 * depends on regular expressions
	 * 
	 * @param intContent
	 *            Integer object
	 * @return Replaced text
	 */
	public static String escapeInvalidXmlCharsRegex(Integer intContent) {
		String response = null;
		String textContent = null;
		if (intContent != null) {
			textContent = intContent.toString();
			response = escapeInvalidXmlCharsRegex(textContent);
		}
		return response;
	}
	
	/**
	 * Method replaces invalid XML entities with proper escapes, this method
	 * depends on regular expressions
	 * 
	 * @param longContent
	 *            Long object
	 * @return Replaced text
	 */
	public static String escapeInvalidXmlCharsRegex(Long longContent) {
		String response = null;
		String textContent = null;
		if (longContent != null) {
			textContent = longContent.toString();
			response = escapeInvalidXmlCharsRegex(textContent);
		}
		return response;
	}

	/**
	 * Method replaces invalid XML entities with proper escapes, this method
	 * depends on regular expressions
	 * 
	 * @param boolContent
	 *            Boolean object
	 * @return Replaced text
	 */
	public static String escapeInvalidXmlCharsRegex(Boolean boolContent) {
		String response = null;
		String textContent = null;
		if (boolContent != null) {
			textContent = boolContent.toString();
			response = escapeInvalidXmlCharsRegex(textContent);
		}
		return response;
	}

	/**
	 * Method replaces invalid XML entities with proper escapes, this method
	 * depends on regular expressions
	 * 
	 * @param doubleContent
	 *            Double object
	 * @return Replaced text
	 */
	public static String escapeInvalidXmlCharsRegex(Double doubleContent) {
		String response = null;
		String textContent = null;
		if (doubleContent != null) {
			textContent = doubleContent.toString();
			response = escapeInvalidXmlCharsRegex(textContent);
		}
		return response;
	}
	
	/**
	 * Method replaces invalid XML entities with proper escapes, this method
	 * depends on regular expressions
	 * 
	 * @param floatContent
	 *            Float object
	 * @return Replaced text
	 */
	public static String escapeInvalidXmlCharsRegex(Float floatContent) {
		String response = null;
		String textContent = null;
		if (floatContent != null) {
			textContent = floatContent.toString();
			response = escapeInvalidXmlCharsRegex(textContent);
		}
		return response;
	}

	/**
	 * Constructs a Map<String, String> from a {@link Properties} object by
	 * combining the default values. See {@link ConfigManager} for default
	 * values
	 * 
	 * @param properties
	 *            Input {@link Properties}
	 * @return Map<String, String>
	 */
	public static Map<String, String> constructMap(Properties properties) {
		Map<String, String> propsMap = null;
		Properties combinedProperties = ConfigManager
				.combineDefaultProperties(properties);
		propsMap = new HashMap<String, String>();

		// Since the default properties are only searchable
		Enumeration<?> keys = combinedProperties.propertyNames();
		while (keys.hasMoreElements()) {
			String key = keys.nextElement().toString().trim();
			String value = combinedProperties.getProperty(key).trim();
			propsMap.put(key, value);
		}
		return propsMap;
	}

	/**
	 * Combines some {@link Map} with default values. See {@link ConfigManager}
	 * for default values.
	 * 
	 * @param receivedMap
	 *            {@link Map} used to combine with Default {@link Map}
	 * @return Combined {@link Map}
	 */
	public static Map<String, String> combineDefaultMap(
			Map<String, String> receivedMap) {
		return combineMap(receivedMap, ConfigManager.getDefaultSDKMap());
	}
	
	public static Map<String, String> combineMap(Map<String, String> highMap, Map<String, String> lowMap) {
		 lowMap = lowMap != null ? lowMap : new HashMap<String, String>();
		 highMap = highMap != null ? highMap : new HashMap<String, String>();
		 lowMap.putAll(highMap);
		 return lowMap;
	}
	
	/**
	 * Utility method to validate if the key exists in the provided map, and returns string value of the object
	 * 
	 * @param map Map of String based key and values
	 * @param key object to be found in the key
	 * @return String value of the key
	 * @throws PayPalRESTException
	 */
	public static String validateAndGet(Map<String, String> map, String key) throws PayPalRESTException {
		if (map == null || key == null) {
			throw new PayPalRESTException("Map or Key cannot be null");
		}
		String value = map.get(key);
		if (value == null || value.equals("")) {
			for (Iterator<Entry<String, String>> itemIter = map.entrySet().iterator(); itemIter.hasNext();) {
				Entry<String, String> entry = itemIter.next();
				if (entry.getKey().equalsIgnoreCase(key)) {
					value = entry.getValue();
					break;
				}
			}
			
			if (value == null || value.equals("")) {
				throw new PayPalRESTException(key + " cannot be null");
			}
		}
		return value;
	}


}
