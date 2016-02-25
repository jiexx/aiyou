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
 * Created on May 3, 2003 / 5:05:18 PM
 * The JForum Project
 * http://www.jforum.net
 */
package net.jforum.view.forum;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.util.Collections;
import java.util.Date;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import net.jforum.Command;
import net.jforum.JForumExecutionContext;
import net.jforum.SessionFacade;
import net.jforum.context.RequestContext;
import net.jforum.dao.AttachmentDAO;
import net.jforum.dao.DataAccessDriver;
import net.jforum.dao.ForumDAO;
import net.jforum.dao.KarmaDAO;
import net.jforum.dao.PollDAO;
import net.jforum.dao.PostDAO;
import net.jforum.dao.TopicDAO;
import net.jforum.dao.UserDAO;
import net.jforum.entities.Attachment;
import net.jforum.entities.Forum;
import net.jforum.entities.KarmaStatus;
import net.jforum.entities.ModerationLog;
import net.jforum.entities.Poll;
import net.jforum.entities.PollChanges;
import net.jforum.entities.Post;
import net.jforum.entities.QuotaLimit;
import net.jforum.entities.Topic;
import net.jforum.entities.User;
import net.jforum.entities.UserSession;
import net.jforum.exceptions.AttachmentException;
import net.jforum.exceptions.ForumException;
import net.jforum.repository.ForumRepository;
import net.jforum.repository.PostRepository;
import net.jforum.repository.RankingRepository;
import net.jforum.repository.SecurityRepository;
import net.jforum.repository.SmiliesRepository;
import net.jforum.repository.SpamRepository;
import net.jforum.repository.TopicRepository;
import net.jforum.search.SearchFacade;
import net.jforum.search.SearchFields;
import net.jforum.security.PermissionControl;
import net.jforum.security.SecurityConstants;
import net.jforum.util.I18n;
import net.jforum.util.SafeHtml;
import net.jforum.util.preferences.ConfigKeys;
import net.jforum.util.preferences.SystemGlobals;
import net.jforum.util.preferences.TemplateKeys;
import net.jforum.view.forum.common.AttachmentCommon;
import net.jforum.view.forum.common.ForumCommon;
import net.jforum.view.forum.common.PollCommon;
import net.jforum.view.forum.common.PostCommon;
import net.jforum.view.forum.common.Stats;
import net.jforum.view.forum.common.TopicsCommon;
import net.jforum.view.forum.common.ViewCommon;

import org.apache.commons.lang3.StringUtils;
import org.apache.lucene.document.Document;

import freemarker.template.SimpleHash;

/**
 * @author roger
 * @version $Id$
 */
public class HomeAction extends PostAction 
{
	public class Product {
		String id;
		String desc;
		List<String> imageSrcs;
		public Product(String id, String desc, List<String> imageSrcs) {
			this.id = id;
			this.desc = desc;
			this.imageSrcs = imageSrcs;
		}
	}
	public HomeAction() {
	}

	public void list()
	{
		this.setTemplateName(TemplateKeys.HOME_LIST);
		
		ForumDAO fm = DataAccessDriver.getInstance().newForumDAO();
		TopicDAO tp = DataAccessDriver.getInstance().newTopicDAO();
		PostDAO po = DataAccessDriver.getInstance().newPostDAO();
		List<Product> pp = new LinkedList<Product>();
		for( Forum f : fm.selectAll() ) {
			if( f.getName().equals("lansan") ) {
				for( Topic t : tp.selectAllByForum(f.getId()) ) {
					if( t.getTitle().equals("products") ) {
						for( Post p : po.selectAllByTopic(t.getId())) {
							/*po.index(p);*/
							List<String> imageSrcs = new LinkedList<String>();
							if (p.hasAttachments()) {
								List<Attachment> as = DataAccessDriver.getInstance().newAttachmentDAO().selectAttachments(p.getId());
								for(Attachment a : as ) {
									imageSrcs.add(a.thumbPath());
								}
								if( imageSrcs.size() > 0 ) {
									pp.add(p.getId(), new Product(p.getText().substring(0, 20), p.getText(), imageSrcs));
								}
							}
						}
					}
				}
			}
		}
		this.context.put("allProducts", pp);
	}
}
