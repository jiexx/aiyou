/*
 * Created on 28/08/2005 22:23:41
 */
package net.jforum.util.preferences;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.junit.Before;
import org.junit.Test;

import junit.framework.TestCase;

/**
 * @author Rafael Steil
 * @version $Id$
 */
public class VariableExpanderTest extends TestCase
{
	private VariableExpander extapnder;
	
	private final String test = "${config.dir}/database/${database.driver.name}/${database.driver.name}.properties";
		
	private static class MyStore implements VariableStore
	{
		final private Map<String, String> data = new ConcurrentHashMap<String, String>();
		
		public MyStore()
		{
			this.fill();
		}
		
		private void fill()
		{
			this.data.put("config.dir", "/config");
			this.data.put("database.driver.name", "mysql");
		}
		
		public String getVariableValue(final String variableName)
		{
			return (String)this.data.get(variableName);
		}
	}
	
	/**
	 * @see junit.framework.TestCase#setUp()
	 */
	@Before
	protected void setUp() throws Exception
	{
		this.extapnder = new VariableExpander(new MyStore(), "${", "}");
	}
	
	@Test
	public void testExpand()
	{
		final String result = this.extapnder.expandVariables(this.test);
		assertEquals("/config/database/mysql/mysql.properties", result);
	}
}
