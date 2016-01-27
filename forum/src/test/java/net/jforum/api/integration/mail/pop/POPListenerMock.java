/*
 * Created on 30/08/2006 22:08:44
 */
package net.jforum.api.integration.mail.pop;

/**
 * @author Rafael Steil
 * @version $Id$
 */
public class POPListenerMock extends POPListener
{
	public POPListenerMock() 
	{
		super();
		super.connector = new POPConnectorMock();
	}
}
