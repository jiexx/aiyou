package com.jiexx.aiyou;

import org.androidannotations.annotations.sharedpreferences.DefaultString;
import org.androidannotations.annotations.sharedpreferences.SharedPref;

@SharedPref(value = SharedPref.Scope.UNIQUE)
public interface  UpgradePrefs  {
	@DefaultString("1.0.0")
    String version();
	
	@DefaultString("1.0.0")
    String previous();
}
