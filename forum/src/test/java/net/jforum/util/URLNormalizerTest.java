/*
 * Created on 11/07/2005 00:25:19
 */
package net.jforum.util;

import junit.framework.TestCase;

import org.junit.Test;

/**
 * Remove special chars, spaces and etc from a string
 * @author Rafael Steil
 * @version $Id$
 */
public class URLNormalizerTest extends TestCase
{
	@Test
	public void testReplaceSpaceByUnderline()
	{
		String s = "this is a test";
		String normalized = URLNormalizer.normalize(s);
		
		assertEquals("this_is_a_test", normalized);
	}
	
	@Test
	public void testFriendlyLimit()
	{
		String s = "this is long string used for testing the limit";
		String normalized = URLNormalizer.normalize(s);
		
		assertEquals("this_is_long_string_used_for_testing", normalized);
	}
	
	@Test
	public void testUnfriendlyLimit()
	{
		String s = "this is long string used for testing the limit";
		String normalized = URLNormalizer.normalize(s, URLNormalizer.LIMIT, false);
		
		assertEquals("this_is_long_string_used_for_te", normalized);
	}
	
	@Test
	public void testFriendlyLimitWithParentesis()
	{
		String s = "this is long string used for testing(the limit)";
		String normalized = URLNormalizer.normalize(s);
		
		assertEquals("this_is_long_string_used_for_testing", normalized);
	}
	
	@Test
	public void testRemovePlusParentesis()
	{
		String s = "a test + some + 2 thing(s)";
		String normalized = URLNormalizer.normalize(s);
		
		assertEquals("a_test_some_2_things", normalized);
	}
	
	@Test
	public void testRemovePorcentageDollarStarEtc()
	{
		String s = "!@#$%^&*";
		String normalized = URLNormalizer.normalize(s);
		
		assertEquals("", normalized);
	}
}
