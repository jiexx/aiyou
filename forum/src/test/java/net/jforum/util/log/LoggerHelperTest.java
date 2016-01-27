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

import org.apache.commons.io.FileUtils;
import org.apache.log4j.Logger;
import org.junit.AfterClass;
import org.junit.Assert;
import org.junit.BeforeClass;
import org.junit.Test;

/**
 * Tests the LoggerHelper class, except its method loggerFrameworkFullyConfigured() 
 * (see LoggerConfigured test case)
 * <p>
 * 
 * @author Heri
 */
public class LoggerHelperTest
{
    /** logger for this class */
    private static final Logger LOGGER =
        Logger.getLogger( LoggerHelperTest.class );

    private static LoggerHelper myClassUnderTest;

    private static String myRootDir;

    private static File myFakedTestFolder;


    @BeforeClass
    public static void setupStatic()
    {
        myClassUnderTest = new LoggerHelper();

        myRootDir = LoggerHelperTest.class.getResource("/").getPath();
        myFakedTestFolder = new File( myRootDir, "fakedTemplateDir" );
        if ( !myFakedTestFolder.exists() )
        {
            myFakedTestFolder.mkdir();
        }
    }

    @AfterClass
    public static void tearDownStatic() throws IOException
    {
        if ( myFakedTestFolder.exists() )
        {
            FileUtils.cleanDirectory( myFakedTestFolder );
            myFakedTestFolder.delete();
        }
    }

    @Test
    public void testCheckTemplate() throws Throwable
    {
        File template = new File( myFakedTestFolder, "log4j_template.xml" );
        if ( !template.exists() )
        {
            template.createNewFile();
        }
        File legacy = new File( myFakedTestFolder, "log4j.xml" );
        if ( legacy.exists() )
        {
            legacy.delete();
        }

        File result;

        LOGGER.debug( "good case" );
        result = myClassUnderTest.checkTemplate( myFakedTestFolder.getPath() );
        Assert.assertNotNull( result );
        Assert.assertTrue( template.equals( result ) );

        LOGGER.debug( "legacy case" );
        template.delete();
        legacy.createNewFile();
        result = myClassUnderTest.checkTemplate( myFakedTestFolder.getPath() );
        Assert.assertNotNull( result );
        Assert.assertTrue( legacy.equals( result ) );

        LOGGER.debug( "exception case" );
        try
        {
            legacy.delete();
            result = myClassUnderTest.checkTemplate( myFakedTestFolder.getPath() );
            Assert.fail( "Exception expected" );
        }
        catch ( Exception e )
        {
            LOGGER.debug( "expected exception occured: ", e );
        } 

    }

    @Test
    public void testCheckFolderExists() throws Exception
    {
        LOGGER.debug( "good case" );
        myClassUnderTest.checkFolderExists( myFakedTestFolder.getPath() );  // must not throw

        LOGGER.debug( "folder not existing" );
        File notExisting = new File( myFakedTestFolder, "blabla" );
        try
        {
            myClassUnderTest.checkFolderExists( notExisting.getPath() ); 
            Assert.fail( "Exception expected" );
        }
        catch ( Exception e )
        {
            LOGGER.debug( "expected exception occured: ", e );
        } 

        LOGGER.debug( "not a folder" );
        File file = new File( myRootDir, "log4j.xml" );
        try
        {
            myClassUnderTest.checkFolderExists( file.getPath() ); 
            Assert.fail( "Exception expected" );
        }
        catch ( Exception e )
        {
            LOGGER.debug( "expected exception occured: ", e );
        } 

    }

    @Test
    public void testCheckClasspathDir() throws Exception
    {

        LOGGER.debug( "good case" );
        myClassUnderTest.checkFolderExists( myRootDir );  // must not throw

        LOGGER.debug( "exception case" );
        try
        {
            myClassUnderTest.checkClasspathDir( myFakedTestFolder.getPath() );
            Assert.fail( "Exception expected" );
        }
        catch ( Exception e )
        {
            LOGGER.debug( "expected exception occured: ", e );
        } 
    }

    @Test
    public void testCheckDestFile() throws Exception
    {
        File file = new File( myFakedTestFolder, "log4j.xml" );

        try
        {
            File result;

            LOGGER.debug( "not present" );
            result = myClassUnderTest.checkDestFile( myFakedTestFolder.getPath() );
            Assert.assertNotNull( result );
            Assert.assertTrue( file.equals( result ) );

            LOGGER.debug( "Exception case: already present" );
            try
            {
                file.createNewFile();
                result = myClassUnderTest.checkDestFile( myFakedTestFolder.getPath() );
                Assert.fail( "Exception expected" );
            }
            catch ( Exception e )
            {
                LOGGER.debug( "expected exception occured: ", e );
            } 

        }
        finally
        {
            FileUtils.cleanDirectory( myFakedTestFolder );
        }

    }



}
