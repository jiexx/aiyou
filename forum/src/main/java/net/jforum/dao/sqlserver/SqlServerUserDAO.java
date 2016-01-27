/*
 * Copyright (c) JForum Team
 * All rights reserved.

 * Redistribution and use in source and binary forms, 
 * with or without modification, are permitted provided 
 * that the following conditions are met:

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
 * Created on 24/05/2004 22:36:07
 * The JForum Project
 * http://www.jforum.net
 */
package net.jforum.dao.sqlserver;

import java.util.List;

import net.jforum.dao.generic.GenericUserDAO;
import net.jforum.entities.User;

/**
 * @author Andre de Andrade da Silva (<a href="mailto:andre.de.andrade@gmail.com">andre.de.andrade@gmail.com</a>)
 * @author Dirk Rasmussen (<a href="mailto:d.rasmussen@bevis.de">d.rasmussen@bevis.de</a>)
 * @version $Id$
 */
public class SqlServerUserDAO extends GenericUserDAO
{
	/**
	 * @see net.jforum.dao.UserDAO#selectAll(int, int)
	 */
	public List<User> selectAll(final int startFrom, final int count)
	{
		return super.selectAll(startFrom, (count > 0 ? startFrom + count : 0));
	}

	/**
	 * @see net.jforum.dao.UserDAO#selectAllByGroup(int, int, int)
	 */
	public List<User> selectAllByGroup(final int groupId, final int startFrom, final int count)
	{
		return super.selectAllByGroup(groupId, startFrom, startFrom + count);
	}

	/**
	 * @see net.jforum.dao.UserDAO#selectAllWithKarma(int, int)
	 */
	public List<User> selectAllWithKarma(final int startFrom, final int count)
	{
		return super.loadKarma(this.selectAll(startFrom, count));
	}
}
