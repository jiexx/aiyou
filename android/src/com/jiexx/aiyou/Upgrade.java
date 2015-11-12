package com.jiexx.aiyou;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;


import android.app.Notification;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;


public class Upgrade  {
	String command;
	String version;
	
	public void handleCommand(UpgradeService us) throws IOException {
		if( command == null )
			return;
		if( command.equals("update") ) 
			cmdUpdate(us);
		else if( command.equals("rollback") )
			cmdRollback(us);
		else if( command.equals("start") )
			cmdStart(us);
		else if( command.equals("upgrade") )
			cmdUpgrade(us);
	}
	public void cmdUpgrade(UpgradeService us) throws IOException {
		Intent i = new Intent(us, MainActivity.class).addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
		PendingIntent pi = PendingIntent.getActivity(us, 0, i,	0);
		
		Notification un = new Notification();
		un.icon = android.R.drawable.stat_sys_download;
		un.tickerText = us.getString(R.string.upgrading);
		un.flags |= Notification.FLAG_ONGOING_EVENT | Notification.FLAG_NO_CLEAR;
		un.setLatestEventInfo(us, us.getString(R.string.app_name), "downloading...",	pi);
		
		NotificationManager mgr = (NotificationManager) us.getSystemService(Context.NOTIFICATION_SERVICE);
		mgr.notify(0, un);

		File f = null;
		if( (f = us.save("install/upgrade", us.upgradeDown(version))) != null ) {
			Uri u = Uri.fromFile(f);
			i = new Intent(Intent.ACTION_VIEW).setDataAndType(u, "application/vnd.android.package-archive");
			pi = PendingIntent.getActivity(us, 0, i, 0);
			
			un.defaults = Notification.DEFAULT_SOUND;
			un.icon = android.R.drawable.stat_sys_download_done;
			un.setLatestEventInfo(us, us.getString(R.string.app_name),	us.getString(R.string.upgrading), pi);
			
			mgr.notify(0, un);
			
			i = new Intent(Intent.ACTION_VIEW).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK).setDataAndType(u, "application/vnd.android.package-archive");
            us.startActivity(i);
		}
	}
	public void cmdUpdate(UpgradeService us) throws IOException {
		if( us.save(version, us.updateDown(version)) != null ){
			us.pushVersion(version);
		}
		if( us.extract(us.currentVersion()) ) {
			us.start();
		}
	}
	public void cmdRollback(UpgradeService us) throws IOException {
		if( us.extract(us.previousVersion()) )
			us.start();
	}
	public void cmdStart(UpgradeService us) throws IOException {
		if( us.extract(us.currentVersion()) ) {
			us.start();
		}else {
			us.save(version, us.upgradeDown(version));
			if( us.extract(us.currentVersion()) ) {
				us.start();
			}
		}
	}
}
