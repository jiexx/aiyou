package net.jforum.util.preferences;

import java.util.prefs.BackingStoreException;

/**
 * A utility class to access Java's Preferences API
 */

public class Preferences {

	private static java.util.prefs.Preferences prefRoot = java.util.prefs.Preferences.userNodeForPackage(Preferences.class);

    public static boolean getBooleanValue (final String key, final boolean defaultValue) {
        return prefRoot.getBoolean(key, defaultValue);
    }

    public static int getIntValue (final String key, final int defaultValue) {
        return prefRoot.getInt(key, defaultValue);
    }

    public static String getStringValue (final String key, final String defaultValue) {
        return prefRoot.get(key, defaultValue);
    }

    public static void setValue (final String key, final boolean value) throws BackingStoreException {
        prefRoot.putBoolean(key, value);
		prefRoot.flush();
    }

    public static void setValue (final String key, final int value) throws BackingStoreException {
        prefRoot.putInt(key, value);
		prefRoot.flush();
	}

    public static void setValue (final String key, final String value) throws BackingStoreException {
        prefRoot.put(key, value);
		prefRoot.flush();
	}
}

