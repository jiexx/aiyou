/*
 * Created on 29/04/2006 10:48:18
 */
package net.jforum.entities;

import java.util.ArrayList;
import java.util.Collections;
import java.util.GregorianCalendar;
import java.util.List;

import junit.framework.TestCase;

import org.junit.Test;

/**
 * @author Rafael Steil
 * @version $Id$
 */
public class TopicTypeComparatorTest extends TestCase
{
	@Test
	public void testPassRandomOrderExpectResultInCorrectOrder()
	{
		List<Topic> l = new ArrayList<Topic>();
		
		l.add(this.createTopic(Topic.TYPE_NORMAL, 1, "Regular day 1"));
		l.add(this.createTopic(Topic.TYPE_STICKY, 1, "Sticky day 1"));
		l.add(this.createTopic(Topic.TYPE_STICKY, 2, "Sticky day 2"));
		l.add(this.createTopic(Topic.TYPE_NORMAL, 3, "Regular day 3"));
		l.add(this.createTopic(Topic.TYPE_ANNOUNCE, 5, "Announce day 5"));
		l.add(this.createTopic(Topic.TYPE_ANNOUNCE, 4, "Announce day 4"));
		l.add(this.createTopic(Topic.TYPE_NORMAL, 6, "Regular day 6"));
		l.add(this.createTopic(Topic.TYPE_STICKY, 7, "Sticky day 7"));
		
		Collections.sort(l, new TopicTypeComparator());
		
		assertEquals("Announce day 5", this.extractTitle(l, 0));
		assertEquals("Announce day 4", this.extractTitle(l, 1));
		assertEquals("Sticky day 7", this.extractTitle(l, 2));
		assertEquals("Sticky day 2", this.extractTitle(l, 3));
		assertEquals("Sticky day 1", this.extractTitle(l, 4));
		assertEquals("Regular day 6", this.extractTitle(l, 5));
		assertEquals("Regular day 3", this.extractTitle(l, 6));
		assertEquals("Regular day 1", this.extractTitle(l, 7));
	}
	
	@Test
	public void testCreateTwoTopicsThenAddAReply()
	{
		List<Topic> l = new ArrayList<Topic>();
		
		l.add(this.createTopic(Topic.TYPE_NORMAL, 1, "Topic 1"));
		l.add(this.createTopic(Topic.TYPE_NORMAL, 2, "Topic 2"));
		
		Collections.sort(l, new TopicTypeComparator());
		
		assertEquals("Topic 2", this.extractTitle(l, 0));
		assertEquals("Topic 1", this.extractTitle(l, 1));
		
		// Simulate a reply
		((Topic)l.get(1)).setLastPostDate(new GregorianCalendar(2006, 4, 3).getTime());
		
		Collections.sort(l, new TopicTypeComparator());
		
		assertEquals("Topic 1", this.extractTitle(l, 0));
		assertEquals("Topic 2", this.extractTitle(l, 1));
	}
	
	private String extractTitle(List<Topic> l, int index)
	{
		return ((Topic)l.get(index)).getTitle();
	}
	
	private Topic createTopic(int type, int day, String title)
	{
		Topic topic = new Topic();
		
		topic.setTitle(title);
		topic.setType(type);
		topic.setTime(new GregorianCalendar(2006, 4, day).getTime());
		topic.setLastPostDate(topic.getTime());
		
		return topic;
	}
}
