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
 * Created on Feb 17, 2003 / 10:47:29 PM
 * The JForum Project
 * http://www.jforum.net
 */
package net.jforum.entities;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeSet;
import java.util.concurrent.ConcurrentHashMap;

import net.jforum.SessionFacade;
import net.jforum.exceptions.ForumOrderChangedException;
import net.jforum.repository.SecurityRepository;
import net.jforum.security.PermissionControl;
import net.jforum.security.SecurityConstants;
import net.jforum.util.ForumOrderComparator;

import org.apache.log4j.Level;
import org.apache.log4j.Logger;

/**
 * Represents a category in the System.
 * Each category holds a reference to all its forums, which 
 * can be retrieved by calling either @link #getForums(), 
 * @link #getForum(int) and related methods. 
 * 
 * <br />
 * 
 * This class also controls the access to its forums, so a call
 * to @link #getForums() will only return the forums accessible
 * to the user who make the call tho the method. 
 * 
 * @author Rafael Steil
 * @version $Id$
 */
public class Category implements Serializable, Comparable<Category>
{
	private static final Logger LOGGER = Logger.getLogger(Category.class);
	private static final long serialVersionUID = -4894230707020588049L;
	private int id;
	private int order;
	private boolean moderated;
	private String name;
	private Map<Integer, Forum> forumsIdMap = new ConcurrentHashMap<Integer, Forum>();
	private Set<Forum> forums = new TreeSet<Forum>(new ForumOrderComparator());
		
	public Category() {}
	
	public Category(int id) {
		this.id = id;
	}
	
	public Category(String name, int id) {
		this.name = name;
		this.id = id;
	}
	
	public Category(Category category) {
		this.name = category.getName();
		this.id = category.getId();
		this.order = category.getOrder();
		this.moderated = category.isModerated();
		
		for (Iterator<Forum> iter = category.getForums().iterator(); iter.hasNext(); ) {
			Forum forum = new Forum(iter.next());
			this.forumsIdMap.put(Integer.valueOf(forum.getId()), forum);
			this.forums.add(forum);
		}
	}
	
	public void setModerated(boolean status)
	{
		this.moderated = status;
	}
	
	public boolean isModerated() 
	{
		return this.moderated;
	}
	
	/**
	 * @return int
	 */
	public int getId() {
		return this.id;
	}

	/**
	 * @return String
	 */
	public String getName() {
		return this.name;
	}

	/**
	 * @return int
	 */
	public int getOrder() {
		return this.order;
	}

	/**
	 * Sets the id.
	 * @param id The id to set
	 */
	public void setId(int id) {
		this.id = id;
	}

	/**
	 * Sets the name.
	 * @param name The name to set
	 */
	public void setName(String name) {
		this.name = name;
	}

	/**
	 * Sets the order.
	 * @param order The order to set
	 */
	public void setOrder(int order) {
		this.order = order;
	}
	
	/**
	 * Adds a forum to this category
	 * 
	 * @param forum Forum
	 */
	public void addForum(Forum forum) {
		this.forumsIdMap.put(Integer.valueOf(forum.getId()), forum);
		this.forums.add(forum);
	}
	
	/**
	 * Reloads a forum.
	 * The forum should already be in the cache and <b>SHOULD NOT</b>
	 * have its order changed. If the forum's order was changed, 
	 * then you <b>MUST CALL</b> @link #changeForumOrder(Forum) <b>BEFORE</b>
	 * calling this method.
	 * 
	 * @param forum The forum to reload its information
	 * @see #changeForumOrder(Forum)
	 */
	public void reloadForum(Forum forum) {
		Forum currentForum = this.getForum(forum.getId());
		
		if (forum.getOrder() != currentForum.getOrder()) {
			throw new ForumOrderChangedException("Forum #" + forum.getId() + " cannot be reloaded, since its "
					+ "display order was changed. You must call Category#changeForumOrder(Forum)"
					+ "first");
		}
		
		Set<Forum> tmpSet = new TreeSet<Forum>(new ForumOrderComparator());
		tmpSet.addAll(this.forums);
		tmpSet.remove(currentForum);
		tmpSet.add(forum);
		this.forumsIdMap.put(Integer.valueOf(forum.getId()), forum);
		
		this.forums = tmpSet;
	}
	
	/**
	 * Changes a forum's display order. 
	 * This method changes the position of the
	 * forum in the current display order of the
	 * forum instance passed as argument, if applicable.
	 * 
	 * @param forum The forum to change
	 */
	public void changeForumOrder(Forum forum)
	{
		Forum current = this.getForum(forum.getId());
		Forum currentAtOrder = this.findByOrder(forum.getOrder());
		
		Set<Forum> tmpSet = new TreeSet<Forum>(new ForumOrderComparator());
		tmpSet.addAll(this.forums);
		
		// Remove the forum in the current order
		// where the changed forum will need to be
		if (currentAtOrder != null) {
			tmpSet.remove(currentAtOrder);
		}
		
		tmpSet.add(forum);
		this.forumsIdMap.put(Integer.valueOf(forum.getId()), forum);
		
		// Remove the forum in the position occupied
		// by the changed forum before its modification,
		// so then we can add the another forum into 
		// its position
		if (currentAtOrder != null) {
			tmpSet.remove(current);
			currentAtOrder.setOrder(current.getOrder());
			tmpSet.add(currentAtOrder);

			this.forumsIdMap.put(Integer.valueOf(currentAtOrder.getId()), currentAtOrder);
		}
		
		this.forums = tmpSet;
	}
	
	private Forum findByOrder(int order)
	{
		for (Iterator<Forum> iter = this.forums.iterator(); iter.hasNext(); ) {
			Forum forum = iter.next();
			if (forum.getOrder() == order) {
				return forum;
			}
		}
		
		return null;
	}
	
	/**
	 * Removes a forum from the list.
	 * @param forumId int
	 */
	public void removeForum(int forumId) {
		this.forums.remove(this.getForum(forumId));
		this.forumsIdMap.remove(Integer.valueOf(forumId));
	}

	/**
	 * Gets a forum.
	 * 
	 * @param userId The user's id who is trying to see the forum
	 * @param forumId The id of the forum to get
	 * @return The <code>Forum</code> instance if found, or <code>null</code>
	 * otherwise.
	 * @see #getForum(int)
	 */
	public Forum getForum(int userId, int forumId)
	{
		PermissionControl pc = SecurityRepository.get(userId);
		if (pc.canAccess(SecurityConstants.PERM_FORUM, Integer.toString(forumId))) {
			return this.forumsIdMap.get(Integer.valueOf(forumId));
		}
		if (LOGGER.isEnabledFor(Level.INFO)) {
			LOGGER.info("User with userId " + userId + " failed to access forum with forumId " + forumId);
		}
		return null;
	}

	/**
	 * Gets a forum.
	 * 
	 * @param forumId The forum's id 
	 * @return The requested forum, if found, or <code>null</code> if
	 * the forum does not exists or access to it is denied.
	 * @see #getForum(int, int)
	 */
	public Forum getForum(int forumId)
	{
		return this.getForum(SessionFacade.getUserSession().getUserId(), forumId);
	}

	/**
	 * Get all forums from this category.
	 * 
	 * @return All forums, regardless it is accessible 
	 * to the user or not.
	 */
	public Collection<Forum> getForums()
	{
		if (this.forums.size() == 0) {
			return this.forums;
		}

		return this.getForums(SessionFacade.getUserSession().getUserId());
	}

	/**
	 * Gets all forums from this category.
	 * 
	 * @return The forums available to the user who make the call
	 * @see #getForums()
     * @param userId int
	 */
	public Collection<Forum> getForums(int userId) 
	{
		PermissionControl pc = SecurityRepository.get(userId);
		List<Forum> forums = new ArrayList<Forum>();

		for (Iterator<Forum> iter = this.forums.iterator(); iter.hasNext(); ) {
			Forum forum = iter.next();
			if (pc.canAccess(SecurityConstants.PERM_FORUM, Integer.toString(forum.getId()))) {
				forums.add(forum);
			}
		}
		
		return forums;
	}

	/** 
	 * @see java.lang.Object#hashCode()
	 */
	public int hashCode() 
	{
		return this.id;
	}

	/** 
	 * @see java.lang.Object#equals(java.lang.Object)
	 */
	public boolean equals(Object o) 
	{
		return ((o instanceof Category) && (((Category)o).getId() == this.id));
	}
	
	/** 
	 * @see java.lang.Object#toString()
	 */
	public String toString() {
		return "[" + this.name + ", id=" + this.id + ", order=" + this.order + "]"; 
	}

	public int compareTo(Category o) {
		return this.getOrder() - ((Category)o).getOrder();
	}

}
