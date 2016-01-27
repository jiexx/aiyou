/*
 * Copyright (c) 2003, Rafael Steil
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
 * Created on 04/12/2004 16:00:46
 * The JForum Project
 * http://www.jforum.net
 */
package net.jforum.http;

import java.util.Enumeration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import javax.servlet.ServletContext;
import javax.servlet.http.HttpSession;
import javax.servlet.http.HttpSessionContext;

/**
 * @author Rafael Steil
 * @version $Id$
 */
@SuppressWarnings("deprecation")
public class FakeHttpSession implements HttpSession {
	private transient final Map<String, Object> attributes = new ConcurrentHashMap<String, Object>();

	/**
	 * @see javax.servlet.http.HttpSession#getCreationTime()
	 */
	public long getCreationTime() {
		return 0;
	}

	/**
	 * @see javax.servlet.http.HttpSession#getId()
	 */
	public String getId() {
		return "jforum-testcase";
	}

	/**
	 * @see javax.servlet.http.HttpSession#getLastAccessedTime()
	 */
	public long getLastAccessedTime() {
		return 0;
	}

	/**
	 * @see javax.servlet.http.HttpSession#getServletContext()
	 */
	public ServletContext getServletContext() {
		return null;
	}

	/**
	 * @see javax.servlet.http.HttpSession#setMaxInactiveInterval(int)
	 */
	public void setMaxInactiveInterval(final int interval) {
		// empty
	}

	/**
	 * @see javax.servlet.http.HttpSession#getMaxInactiveInterval()
	 */
	public int getMaxInactiveInterval() {
		return 0;
	}

	@Deprecated
	public HttpSessionContext getSessionContext() {
		return null;
	}

	/**
	 * @see javax.servlet.http.HttpSession#getAttribute(java.lang.String)
	 */
	public Object getAttribute(final String name) {
		return this.attributes.get(name);
	}

	@Deprecated
	public Object getValue(final String name) {
		return null;
	}

	/**
	 * @see javax.servlet.http.HttpSession#getAttributeNames()
	 */
	public Enumeration<String> getAttributeNames() {
		return null;
	}

	public String[] getValueNames() {
		return new String[0];
	}

	/**
	 * @see javax.servlet.http.HttpSession#setAttribute(java.lang.String,
	 *      java.lang.Object)
	 */
	public void setAttribute(final String name, final Object value) {
		this.attributes.put(name, value);
	}

	@Deprecated
	public void putValue(final String name, final Object value) {
		// empty
	}

	/**
	 * @see javax.servlet.http.HttpSession#removeAttribute(java.lang.String)
	 */
	public void removeAttribute(final String name) {
		this.attributes.remove(name);
	}

	@Deprecated
	public void removeValue(final String name) {
		// empty
	}

	/**
	 * @see javax.servlet.http.HttpSession#invalidate()
	 */
	public void invalidate() {
		// empty
	}

	/**
	 * @see javax.servlet.http.HttpSession#isNew()
	 */
	public boolean isNew() {
		return false;
	}
}
