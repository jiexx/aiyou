/*
 * Copyright (c) JForum Team
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
 * Created on 01.11.2013 by Heri
 * The JForum Project
 * http://www.jforum.net
 */

package net.jforum.util.log;

import java.io.File;
import java.io.IOException;

import org.apache.log4j.xml.DOMConfigurator;
import org.junit.Assert;
import org.junit.Test;

/**
 * Tests the LoggerHelper.loggerFrameworkFullyConfigured() method.
 * <p>
 * Remark: The test method checks first the bad cases (not configured) since once configured it 
 * cannot be undone anymore. 
 * <p>  
 * Remark II: This test runs standalone successfully but I does not pass if maven
 * runs all tests subsequently. TODO: We have to fork the test execution(each test runs in its
 * own JVM). This is the reason why this class is called LoggerConfigured and not LoggerConfiguredTest.
 * Like this it is not picked up by the maven test runner. But it can be run standalone within eclipse.
 * <p>
 * 
 * @author Heri
 */
public class LoggerConfigured
{

    @Test
    public void testConfig()
    {
    	final String rootDir = getClass().getResource("/").getPath();
        final File goodConfig = new File( rootDir, "log4j.xml" );
        final File backupGood = new File( rootDir, "log4j.xml.bak" );

        // TODO: we have to find a way for loading the LogManager class new on each test step.
        // This approach did not work:
//        URL url = getClass().getResource("/org/apache/log4j/LogManager.class");
//        ClassLoader clSave = Thread.currentThread().getContextClassLoader();
//        ClassLoader cl = URLClassLoader.newInstance( new URL[] {url}, clSave );
//        Thread.currentThread().setContextClassLoader( cl );
//        try
//        {
//            // teststep here
//        }
//        finally
//        {
//            Thread.currentThread().setContextClassLoader( clSave );
//        } // try..finally

        // no config on the classpath:
        try
        {
            goodConfig.renameTo( backupGood );
            Assert.assertFalse( LoggerHelper.loggerFrameworkFullyConfigured() );

        }
        finally
        {
            backupGood.renameTo( goodConfig );
        } // try..finally

        // bad config on the classpath
        try
        {
            goodConfig.renameTo( backupGood );

            try
            {
                goodConfig.createNewFile();
                Assert.assertFalse( LoggerHelper.loggerFrameworkFullyConfigured() );
            }
            catch ( IOException t )
            {
                t.printStackTrace();
                Assert.fail();
            }
            finally
            {
                goodConfig.delete();
            } // try..finally
        }
        finally
        {
            backupGood.renameTo( goodConfig );
        } // try..finally

        // good config on the classpath
        try
        {
            DOMConfigurator.configure( goodConfig.toURI().toURL() );
        }
        catch ( Exception t )
        {
            t.printStackTrace();
            Assert.fail();
        }
        Assert.assertTrue( LoggerHelper.loggerFrameworkFullyConfigured() );
    }

}
