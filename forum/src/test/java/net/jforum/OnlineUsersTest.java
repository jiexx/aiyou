/*
 * Created on Jun 15, 2005 11:57:08 AM
 */
package net.jforum;

import junit.framework.TestCase;
import net.jforum.cache.DefaultCacheEngine;
import net.jforum.context.ForumContext;
import net.jforum.context.JForumContext;
import net.jforum.context.RequestContext;
import net.jforum.context.ResponseContext;
import net.jforum.context.web.WebRequestContext;
import net.jforum.context.web.WebResponseContext;
import net.jforum.entities.UserSession;
import net.jforum.http.FakeHttpRequest;
import net.jforum.http.FakeHttpResponse;
import net.jforum.util.preferences.ConfigKeys;
import net.jforum.util.preferences.SystemGlobals;

import org.apache.log4j.Logger;
import org.apache.log4j.xml.DOMConfigurator;
import org.junit.Before;
import org.junit.Test;

/**
 * Test {@link net.jforum.SessionFacade} methods for online users
 * 
 * @author Rafael Steil
 * @version $Id$
 */
public class OnlineUsersTest extends TestCase
{
    private static boolean started;
    private static final int ANONYMOUS = 1;

    @Override
    @Before
    protected void setUp() throws Exception
    {		
        Logger logger = Logger.getLogger( this.getClass() );
        logger.debug( "hello, I am already initialized" );
        if (!started) {
            DOMConfigurator.configure(TestCaseUtils.getRootDir()+"/test-classes/log4j.xml");
            TestCaseUtils.loadEnvironment();

            new SessionFacade().setCacheEngine(new DefaultCacheEngine());

            RequestContext requestContext = new WebRequestContext(new FakeHttpRequest());
            ResponseContext responseContext = new WebResponseContext(new FakeHttpResponse());

            ForumContext forumContext = new JForumContext(
                                                          requestContext.getContextPath(),
                                                          SystemGlobals.getValue(ConfigKeys.SERVLET_EXTENSION),
                                                          requestContext,
                                                          responseContext,
                                                          false
                );
            JForumExecutionContext ex = JForumExecutionContext.get();
            ex.setForumContext( forumContext );

            JForumExecutionContext.set(ex);

            ConfigLoader.startCacheEngine();

            SystemGlobals.setValue(ConfigKeys.ANONYMOUS_USER_ID, Integer.toString(ANONYMOUS));
            started = true;
        } 
    }

    /**
     * Check if guest users are being counted correctly
     */
    @Test
    public void testAnonymousCount()
    {
        String[] sessionId = new String[3];
        for (int i = 0; i < sessionId.length; i++) {
            sessionId[i] = i + "_" + System.currentTimeMillis();
            this.createUserSession(ANONYMOUS, sessionId[i]);
        }

        assertEquals(3, SessionFacade.anonymousSize());
        // clean up to prevent Cache error
        for (int i = 0; i < sessionId.length; i++) {
            SessionFacade.remove(sessionId[i]);
        }
    }

    /**
     * Check if counting of both guest and logged users is correct
     */
    @Test
    public void test2Anymous1Logged() 
    {
        String[] sessionId = new String[3];
        // Anonymous
        for (int i = 0; i < 2; i++) {
            sessionId[i] = i + "_" + System.currentTimeMillis();
            this.createUserSession(ANONYMOUS, sessionId[i]);
        }		

        // Logged
        SessionFacade.setAttribute("logged", "1");
        sessionId[2] = "logged_" + System.currentTimeMillis();
        this.createUserSession(2, sessionId[2]);

        // Assert
        assertEquals(2, SessionFacade.anonymousSize());
        assertEquals(1, SessionFacade.registeredSize());

        // clean up to prevent Cache error
        for (int i = 0; i < sessionId.length; i++) {
            SessionFacade.remove(sessionId[i]);
        }
    }

    /**
     * First register as anonymous, then change to logged, and check counting
     */
    @Test
    public void testAnonymousThenLogged()
    {
        // Anonymous
        String sessionId = "1_" + System.currentTimeMillis();
        this.createUserSession(ANONYMOUS, sessionId);

        assertEquals(1, SessionFacade.anonymousSize());
        assertEquals(0, SessionFacade.registeredSize());

        // Logged
        UserSession us = SessionFacade.getUserSession(sessionId);		
        SessionFacade.setAttribute("logged", "1");
        SessionFacade.remove(sessionId);
        us.setUserId(2);
        SessionFacade.add(us);

        assertEquals(0, SessionFacade.anonymousSize());
        assertEquals(1, SessionFacade.registeredSize());

        SessionFacade.remove(sessionId);
    }

    @Test
    public void test3LoggedThen1Logout()
    {
        String[] sessionId = new String[3];
        // Logged
        SessionFacade.setAttribute("logged", "1");
        for (int i = 0; i < sessionId.length; i++) {
            sessionId[i] = i+2 + "_" + System.currentTimeMillis();
            this.createUserSession(i+2, sessionId[i]);
        }		

        assertEquals(3, SessionFacade.registeredSize());
        assertEquals(0, SessionFacade.anonymousSize());

        // Logout (goes as guest)
        SessionFacade.removeAttribute("logged");
        SessionFacade.remove(sessionId[1]);

        this.createUserSession(ANONYMOUS, sessionId[1]);

        assertEquals(2, SessionFacade.registeredSize());
        assertEquals(1, SessionFacade.anonymousSize());

        // clean up to prevent Cache error
        for (int i = 0; i < sessionId.length; i++) {
            SessionFacade.remove(sessionId[i]);
        }		
    }

    private void createUserSession(int userId, String sessionId)
    {
        UserSession us = new UserSession();

        us.setUserId(userId);
        us.setSessionId(sessionId);
        us.setUsername("blah_" + System.currentTimeMillis());

        SessionFacade.add(us, sessionId);
    }
}
