/*
 * Copyright (c) 2003, 2004 Rafael Steil
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, 
 * with or without modification, are permitted provided 
 * that the following conditions are met:
 * 
 * 1) Redistributions of source code must retain the above 
 * copyright notice, this list of conditions and the 
 * following disclaimer.
 * 2) Redistributions in binary form must reproduce the 
 * above copyright notice, this list of conditions and 
 * the following disclaimer in the documentation and/or 
 * other materials provided with the distribution.
 * 3) Neither the name of "Rafael Steil" nor 
 * the names of its contributors may be used to endorse 
 * or promote products derived from this software without 
 * specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT 
 * HOLDERS AND CONTRIBUTORS "AS IS" AND ANY 
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, 
 * BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF 
 * MERCHANTABILITY AND FITNESS FOR A PARTICULAR 
 * PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL 
 * THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE 
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, 
 * EXEMPLARY, OR CONSEQUENTIAL DAMAGES 
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF 
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, 
 * OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER 
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER 
 * IN CONTRACT, STRICT LIABILITY, OR TORT 
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN 
 * ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF 
 * ADVISED OF THE POSSIBILITY OF SUCH DAMAGE
 * 
 * Created on 02/06/2004 23:29:51
 * The JForum Project
 * http://www.jforum.net
 */
package net.jforum.util;

import java.io.File;
import java.util.Map;
import java.util.Timer;
import java.util.TimerTask;
import java.util.concurrent.ConcurrentHashMap;

import org.apache.log4j.Level;
import org.apache.log4j.Logger;

/**
 * Monitor class for file changes.
 * 
 * @author Rafael Steil
 * @version $Id$
 */
public class FileMonitor
{
    private static final Logger LOGGER = Logger.getLogger(FileMonitor.class);
    private static final FileMonitor INSTANCE = new FileMonitor();
    private Timer timer;
    private Map<String, FileMonitorTask> timerEntries;

    private FileMonitor() {
        this.timerEntries = new ConcurrentHashMap<String, FileMonitorTask>();
        this.timer = new Timer("Timer-FileMonitor", true);
    }

    public static FileMonitor getInstance() {
        return INSTANCE;
    }

    /**
     * Add a file to the monitor
     * 
     * @param listener The file listener
     * @param filename The filename to watch
     * @param period The watch interval (in milli seconds)
     */
    public void addFileChangeListener(FileChangeListener listener, String filename, long period) {
        this.removeFileChangeListener(filename);

        if (LOGGER.isEnabledFor(Level.INFO)) {
        	LOGGER.info("Watching " + filename);
        }

        FileMonitorTask task = new FileMonitorTask(listener, filename);

        this.timerEntries.put(filename, task);
        this.timer.schedule(task, period, period);
    }

    /**
     * Stop watching a file
     * 
     * @param filename The filename to keep watch
     */
    public void removeFileChangeListener(String filename) {
        FileMonitorTask task = this.timerEntries.remove(filename);

        if (task != null) {
            task.cancel();
        }
    }

    public Timer getTimer() {
        return timer;
    }

    private static class FileMonitorTask extends TimerTask {
        private FileChangeListener listener;
        private String filename;
        private File monitoredFile;
        private long lastModified;

        public FileMonitorTask(FileChangeListener listener, String filename) {
            this.listener = listener;
            this.filename = filename;

            this.monitoredFile = new File(filename);
            if (this.monitoredFile.exists()) {
                this.lastModified = this.monitoredFile.lastModified();
            }
        }

        @Override
        public void run() {
            long latestChange = this.monitoredFile.lastModified();
            if (this.lastModified != latestChange) {
                this.lastModified = latestChange;

                this.listener.fileChanged(this.filename);
            }
        }
    }
}
