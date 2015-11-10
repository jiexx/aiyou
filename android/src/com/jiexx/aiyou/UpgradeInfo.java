package com.jiexx.aiyou;

import java.io.IOException;

import android.content.Intent;


public class UpgradeInfo  {
	String command;
	String version;
	
	public boolean less(String version) {
		String ver1 = this.version.replaceAll(".", "");
		String ver2 = version.replaceAll(".", "");
		return Integer.parseInt(ver1) > Integer.parseInt(ver2);
	}
	
	public void handleCommand(UpgradeService us) {
		if( command == null )
			return;
		if( command.equals("upgrade") ) 
			cmdUpgrad(us);
		else if( command.equals("rollback") )
			cmdRollback(us);
		else if( command.equals("start") )
			cmdStart(us);
	}
	
	public void cmdUpgrad(UpgradeService us) {
		Intent i = new Intent(us, MainActivity.class);
		us.extract(us.currentVersion());
		us.startActivity(i);
	}
	public void cmdRollback(UpgradeService us) throws IOException {
		Intent i = new Intent(us, MainActivity.class);
		us.extract(us.previousVersion());
		us.startActivity(i);
	}
	public void cmdStart(UpgradeService us) throws IOException {
		Intent i = new Intent(us, MainActivity.class);
		us.extract(us.currentVersion());
		us.startActivity(i);
	}
}
