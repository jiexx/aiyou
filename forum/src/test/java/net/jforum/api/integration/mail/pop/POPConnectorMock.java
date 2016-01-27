/*
 * Created on 30/08/2006 22:09:25
 */
package net.jforum.api.integration.mail.pop;

import javax.mail.Message;

/**
 * @author Rafael Steil
 * @version $Id$
 */
public class POPConnectorMock extends POPConnector
{
	private transient Message[] messages;
	
	public void setMessages(final Message[] messages)
	{
		this.messages = messages.clone();
	}
	
	public Message[] listMessages()
	{
		//  return a copy of the array
		return this.messages.clone();
	}
	
	public void openConnection() {
		// empty
	}
	
	public void closeConnection() {
		// empty
	}
} 
