/*
 * Created on 09/09/2006 17:00:27
 */
package net.jforum.api.integration.rest;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.Calendar;
import java.util.Date;
import java.util.GregorianCalendar;

import junit.framework.TestCase;
import net.jforum.JForumExecutionContext;
import net.jforum.TestCaseUtils;
import net.jforum.api.rest.RESTAuthentication;
import net.jforum.dao.generic.AutoKeys;
import net.jforum.exceptions.DatabaseException;
import net.jforum.util.DbUtils;
import net.jforum.util.preferences.SystemGlobals;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;

/**
 * @author Rafael Steil
 * @version $Id$
 */
public class RESTAuthenticationTestCase extends TestCase
{
	public static final String API_KEY = "api.key.test";
	
	@Test
	public void testInvalid() throws Exception
	{
		RESTAuthentication auth = new RESTAuthentication();
		boolean isValid = auth.validateApiKey("1");
		
		assertFalse("The api key should not be valid", isValid);
	}
	
	@Test
	public void testValid() throws Exception
	{
		RESTAuthentication auth = new RESTAuthentication();
		boolean isValid = auth.validateApiKey(API_KEY);
		
		assertTrue("The api key should be valid", isValid);
	}
	
	protected Date tomorrow()
	{
		Calendar c = Calendar.getInstance();
		return new GregorianCalendar(c.get(Calendar.YEAR), 
			c.get(Calendar.MONTH), 
			c.get(Calendar.DATE) + 1).getTime();
	}

	/**
	 * @throws SQLException
	 */
	protected void createApiKey(Date validity) throws SQLException
	{
		ApiInsertDeleteDAO apiInsertDeleteDAO = new ApiInsertDeleteDAO();
		apiInsertDeleteDAO.insert(API_KEY, new Timestamp(validity.getTime()));
	}

	/**
	 * @throws SQLException
	 */
	protected void deleteApiKey() throws SQLException
	{
		PreparedStatement pstmt = null;
		
		try {
			pstmt = JForumExecutionContext.getConnection()
				.prepareStatement("DELETE FROM jforum_api WHERE api_key = ?");
			pstmt.setString(1, API_KEY);
			pstmt.executeUpdate();
		}
		finally {
			if (pstmt != null) {
				pstmt.close();
			}
		}
	}
	
	/**
	 * @see junit.framework.TestCase#setUp()
	 */
	@Before
	protected void setUp() throws Exception
	{
		TestCaseUtils.loadEnvironment();
		TestCaseUtils.initDatabaseImplementation();
		this.createApiKey(this.tomorrow());
	}

	/**
	 * @see junit.framework.TestCase#tearDown()
	 */
	@After
	protected void tearDown() throws Exception
	{
		this.deleteApiKey();
		JForumExecutionContext.finish();
	}
}


/**
 * This functionality is only used by this testcase. So
 * this DAO is here and not among the other DAOs. 
 *
 */
class ApiInsertDeleteDAO extends AutoKeys {

	public void insert(final String apiKey, final Timestamp timestamp)
	{
		PreparedStatement pstmt = null;
		ResultSet resultSet = null;

		try {
			pstmt = JForumExecutionContext.getConnection().prepareStatement(
					SystemGlobals.getSql("ApiModel.insert"));
			pstmt.setString(1, apiKey);
			pstmt.setTimestamp(2, timestamp);
			pstmt.executeUpdate();
		}
		catch (SQLException e) {
			throw new DatabaseException(e);
		}
		finally {
			DbUtils.close(resultSet, pstmt);
		}
	}

}
