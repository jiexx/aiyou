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
 * following  disclaimer.
 * 2)  Redistributions in binary form must reproduce the 
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
 * Created on 29/09/2004 - 18:16:46
 * The JForum Project
 * http://www.jforum.net
 */
package net.jforum;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.Properties;

import net.jforum.util.I18n;
import net.jforum.util.preferences.ConfigKeys;
import net.jforum.util.preferences.SystemGlobals;

import org.apache.commons.io.FileUtils;
import org.apache.commons.lang3.StringUtils;
import org.apache.log4j.LogManager;
import org.apache.log4j.Logger;
import org.apache.log4j.xml.DOMConfigurator;

import freemarker.template.Configuration;

/**
 * General utilities for the test cases.
 * 
 * @author Rafael Steil
 * @version $Id$
 */
public final class TestCaseUtils
{
    /** logger for this class */
    private static final Logger LOGGER = Logger.getLogger( TestCaseUtils.class );

    private static TestCaseUtils utils = new TestCaseUtils();
    private static String rootDir;

    private TestCaseUtils() 
    {
        checkTestOverloads( getRootDir() );
    }

    public static void loadEnvironment() throws Exception
    {
        utils.init();
    }

    /**
     * Initializes the database stuff. 
     * Must be called <b>after</b> #loadEnvironment
     * 
     * @throws Exception
     */
    public static void initDatabaseImplementation() throws Exception
    {
        SystemGlobals.loadAdditionalDefaults(SystemGlobals.getValue(ConfigKeys.DATABASE_DRIVER_CONFIG));

        SystemGlobals.loadQueries(SystemGlobals.getValue(ConfigKeys.SQL_QUERIES_GENERIC),
                                  SystemGlobals.getValue(ConfigKeys.SQL_QUERIES_DRIVER));

        // Start the dao.driver implementation
        ConfigLoader.createLoginAuthenticator();
        ConfigLoader.loadDaoImplementation();

        DBConnection.createInstance();
        DBConnection.getImplementation().init();
    }

    public static String getRootDir()
    {
        if (rootDir == null) {
            rootDir = TestCaseUtils.class.getResource("/").getPath();
            if (rootDir.indexOf("build") == -1) {
                rootDir = rootDir.substring(0, rootDir.length() - "/test-classes/".length());							
            } 
            else {
                rootDir = rootDir.substring(0, rootDir.length() - "/build/classes/".length());
            }
        }

        return rootDir;
    }

    private void init() throws IOException 
    {	
        SystemGlobals.reset();
        SystemGlobals.initGlobals(getRootDir()+"/jforum", getRootDir()
                                  + "/jforum/WEB-INF/config/SystemGlobals.properties");

        // Configure the template engine
        Configuration templateCfg = new Configuration(Configuration.VERSION_2_3_23);
        File templateDir = new File(SystemGlobals.getApplicationPath(), "templates");
        LOGGER.debug( "templateDir: " + templateDir );
        templateCfg.setDirectoryForTemplateLoading( templateDir );
        templateCfg.setTemplateUpdateDelayMilliseconds(0);
        JForumExecutionContext.setTemplateConfig(templateCfg);

        I18n.load();		
    }

    /**
     * This is still experimental.
     * <p> 
     * If a file user.home/.JForum/testoverload.properties can be found and its content
     * is satisfying then the listed files there are replaced in the test environment.
     * <p>
     * @param aRootDir
     *        used for building the destination file name
     */
    private void checkTestOverloads( String aRootDir )
    {
        String userHome = System.getProperties().getProperty( "user.home" );
        if ( StringUtils.isEmpty( userHome ) )
        {
            return;
        }
        File overloadConfig = new File( userHome, ".JForum/testoverload.properties" );
        if ( !overloadConfig.exists() )
        {
            return;
        }
        if ( StringUtils.isEmpty( aRootDir ) )
        {
            LOGGER.warn( "RootDir not valid: " + aRootDir );
            return;
        }
        File targetRoot = new File( aRootDir );
        if ( !targetRoot.exists() || !targetRoot.isDirectory() )
        {
            LOGGER.warn( "Configured overload path does not exist or is not directory: " + aRootDir );
            return;
        }

        try
        {
            Properties overloads = new Properties();
            overloads.load( new FileInputStream( overloadConfig ) );
            String path = overloads.getProperty( "testoverload.src.dir" );
            if ( StringUtils.isEmpty( path ) )
            {
                return;
            }
            File overloadPath = new File ( path );
            if ( !overloadPath.exists() || !overloadPath.isDirectory() )
            {
                LOGGER.warn( "Configured overload path does not exist or is not directory: " + path );
                return;
            }

            String fileCopyPrefixKey = "copy.";
            for ( Object o : overloads.keySet() )
            {
                String key = (String) o;
                if ( !key.startsWith( fileCopyPrefixKey ) )
                {
                    continue;
                }
                String value = overloads.getProperty( key );
                if ( StringUtils.isEmpty( value ) )
                {
                    continue;
                }
                String srcName = key.substring( fileCopyPrefixKey.length() );
                File src = new File( overloadPath, srcName );
                File dst = new File( targetRoot, value ); 
                if ( dst.exists() )
                {
                    dst.delete();
                }
                LOGGER.info( "replacing file " + dst + " by a version found in test overload folder" );
                FileUtils.copyFile( src, dst, true );

                if ( value.equals( "test-classes/log4j.xml" ) )
                {
                    LOGGER.info( "recoonfiguring Log4j" );
                    LogManager.resetConfiguration();
                    DOMConfigurator.configure( dst.toURI().toURL() );
                }

            }

        }
        catch ( Exception t )
        {
            LOGGER.error( t.getMessage(), t );
            return;
        }


    }
}
