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
import java.io.Serializable;
import java.util.Collections;
import java.util.Date;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import net.jforum.Command;
import net.jforum.ControllerUtils;
import net.jforum.JForumExecutionContext;
import net.jforum.SessionFacade;
import net.jforum.context.RequestContext;
import net.jforum.context.ResponseContext;
import net.jforum.dao.AttachmentDAO;
import net.jforum.dao.DataAccessDriver;
import net.jforum.dao.ForumDAO;
import net.jforum.dao.KarmaDAO;
import net.jforum.dao.PollDAO;
import net.jforum.dao.PostDAO;
import net.jforum.dao.TopicDAO;
import net.jforum.dao.UserDAO;
import net.jforum.dao.UserSessionDAO;
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
import net.jforum.util.Hash;
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

import org.apache.commons.codec.binary.Base64;
import org.apache.commons.lang3.StringUtils;
import org.apache.lucene.document.Document;
import org.owasp.csrfguard.CsrfGuard;

import com.google.gson.Gson;

import freemarker.template.SimpleHash;
import freemarker.template.Template;

/**
 * @author roger
 * @version $Id$
 */
public class HomeAction extends Command {
	public class Product implements Serializable {
		/**
		 * 
		 */
		private static final long serialVersionUID = 2204339307960771545L;
		public String id;
		public String name;
		public String desc;
		public List<Attachment> img;
		public List<Post> comments;
		
		public Product() {
			this.id = null;
			this.name = null;
			this.desc = null;
			this.img = null;
			this.comments = new LinkedList<Post>();
		}

		public Product(String id, String name, String desc, List<Attachment> img) {
			this.id = id;
			this.name = name;
			this.desc = desc;
			this.img = img;
			this.comments = new LinkedList<Post>();
		}

		public Product(Product p) {
			this.id = p.id;
			this.name = p.name;
			this.desc = p.desc;
			this.img = p.img;
			this.comments = p.comments;
		}
		
		public void addComment(Post p) {
			this.comments.add(p);
		}

		public String getId() {
			return this.id;
		}

		public void setId(String id) {
			this.id = id;
		}
		
		public String getName() {
			return this.name;
		}

		public void setName(String name) {
			this.name = name;
		}

		public String getDesc() {
			return this.desc;
		}

		public void setDesc(String desc) {
			this.desc = desc;
		}

		public List<Attachment> getImg() {
			return this.img;
		}

		public void setImg(List<Attachment> img) {
			this.img = img;
		}
		
		public List<Post> getComments() {
			return this.comments;
		}

		public void setComments(List<Post> comments) {
			this.comments = comments;
		}

	}
	public class Comment {
		public String name;
		public String time;
		public Comment(String name, Date time){
			this.name = name;
			this.time = time.toLocaleString();
		}
		public String toJson() {
			Gson gson = new Gson();
			return gson.toJson(this);
		}
	}
	public HomeAction() {
	}
	
	protected Post reply(Topic topic, int forumId) {
		Post post = new Post();
		post.setTime(new Date());
		post.setTopicId(topic.getId());
		post.setSubject(topic.getTitle());
		post.setBbCodeEnabled(true);
		post.setSmiliesEnabled(true);
		post.setSignatureEnabled(false);
		post.setModerate(false);
		
		//post.setUserIp(request.getRemoteAddr());
		//post.setUserId(SessionFacade.getUserSession().getUserId());
		post.setHtmlEnabled(false);
		post.setText(request.getParameter("content"));
		if (post.getText() == null || post.getText().trim().equals("")) {
			return null;
		}
		post.setForumId(forumId);
		post.setKarma(new KarmaStatus());
		
		PostDAO postDao = DataAccessDriver.getInstance().newPostDAO();
		int postId = postDao.addNew(post);
		
		User user = DataAccessDriver.getInstance().newUserDAO().selectById(SessionFacade.getUserSession().getUserId());
		topic.setLastPostId(postId);
		topic.setLastPostBy(user);
		topic.setLastPostDate(post.getTime());
		topic.setLastPostTime(post.getTime());
		
		TopicDAO topicDao = DataAccessDriver.getInstance().newTopicDAO();
		topicDao.update(topic);
		post.hasAttachments(false);
		
		postDao.index(post);
		
		// Update forum stats, cache and etc
		DataAccessDriver.getInstance().newUserDAO().incrementPosts(post.getUserId());

		ForumDAO forumDao = DataAccessDriver.getInstance().newForumDAO();
		TopicsCommon.updateBoardStatus(topic, postId, false, topicDao, forumDao);
		ForumRepository.updateForumStats(topic, user, post);
		ForumRepository.reloadForum(post.getForumId());

		int anonymousUser = SystemGlobals.getIntValue(ConfigKeys.ANONYMOUS_USER_ID);

		if (user.getId() != anonymousUser) {
			SessionFacade.getTopicsReadTime().put(Integer.valueOf(topic.getId()),
				Long.valueOf(post.getTime().getTime()));
		}

		if (SystemGlobals.getBoolValue(ConfigKeys.POSTS_CACHE_ENABLED)) {
			PostRepository.append(post.getTopicId(), PostCommon.preparePostForDisplay(post));
		}
		return post;
	}
	
	public void comment() {
		if(!SessionFacade.isLogged()) {
			this.setTemplateName(TemplateKeys.HOME_LOGIN);
			return;
		}else {
			String productNo = this.request.getParameter("product_no");
			if (productNo != null) {
				int topicId = this.request.getIntParameter("topic_id");

				Topic topic = TopicRepository.getTopic(new Topic(topicId));

				if (topic == null) {
					topic = DataAccessDriver.getInstance().newTopicDAO().selectRaw(topicId);

					if (topic.getId() == 0) {
						throw new ForumException("Could not find a topic with id #" + topicId);
					}
				}

				int forumId = topic.getForumId();

				if (topic.getStatus() == Topic.STATUS_LOCKED) {
					return;
				}
				
				Post p = reply(topic, forumId);
				
				JForumExecutionContext.setContentType("text/xml");
				this.setTemplateName(TemplateKeys.API_POST_COMMENT); 
				if(p != null) {
					Comment c = new Comment(p.getPostUsername(), p.getTime());
					this.context.put("comment", c.toJson());
				}else {
					this.context.put("comment", "");
				}
				
			}
		}
	}
	
	public void detail() {
		this.setTemplateName(TemplateKeys.HOME_DETAIL);
		
		int productNo = this.request.getIntParameter("product_no");
		
		TopicDAO tp = DataAccessDriver.getInstance().newTopicDAO();
		PostDAO po = DataAccessDriver.getInstance().newPostDAO();
		Product product = new Product();
		
		for(Post p : po.selectAllByTopic(productNo)) {
			product.addComment(p);
			if(p != null && p.hasAttachments()) {
				List<Attachment> as = DataAccessDriver.getInstance().newAttachmentDAO()
						.selectAttachments(p.getId());
				if (as.size() > 0) {
					product.setId(String.valueOf(p.getId()));
					product.setName(p.getSubject());
					product.setImg(as);
					product.setDesc(p.getText());
				}
			}
		}
		this.context.put("product", product);
	}

	public void list() {
		this.setTemplateName(TemplateKeys.HOME_LIST);

		ForumDAO fm = DataAccessDriver.getInstance().newForumDAO();
		TopicDAO tp = DataAccessDriver.getInstance().newTopicDAO();
		PostDAO po = DataAccessDriver.getInstance().newPostDAO();
		List<Product> pp = new LinkedList<Product>();
		for (Forum f : fm.selectAll()) {
			if (f.getName().equals("lansan")) {
				for (Topic t : tp.selectAllByForum(f.getId())) {
					Post p = po.selectById(t.getFirstPostId());
					if(p != null && p.hasAttachments()) {
						List<Attachment> as = DataAccessDriver.getInstance().newAttachmentDAO()
								.selectAttachments(p.getId());
						if (as.size() > 0) {
							pp.add(new Product(String.valueOf(t.getId()), p.getSubject(), p.getText(), as));
						}
					}
				}
			}
		}
		this.context.put("allProducts", pp);
		//CsrfGuard csrfGuard = CsrfGuard.getInstance();
        //context.put("OWASP_CSRFTOKEN", csrfGuard.getTokenValue(context.get));
	}

    private boolean parseBasicAuthentication()
	{
    	String a = request.getHeader("Authorization");
		if (a != null && a.startsWith("Basic ")) {
			String auth = request.getHeader("Authorization");
			String decoded;

			decoded = String.valueOf(new Base64().decode(auth.substring(6)));

			int p = decoded.indexOf(':');

			if (p != -1) {
				request.setAttribute("username", decoded.substring(0, p));
				request.setAttribute("password", decoded.substring(p + 1));
				return true;
			}
		}
		return false;
	}
	private void buildSucessfulLoginRedirect()
	{
		if (JForumExecutionContext.getRedirectTo() == null) {
			String forwaredHost = request.getHeader("X-Forwarded-Host");

			if (forwaredHost == null 
					|| SystemGlobals.getBoolValue(ConfigKeys.LOGIN_IGNORE_XFORWARDEDHOST)) {
				JForumExecutionContext.setRedirect(this.request.getContextPath()
					+ "/home/list"
					+ SystemGlobals.getValue(ConfigKeys.SERVLET_EXTENSION));
			}
			else {
				JForumExecutionContext.setRedirect(this.request.getScheme()
					+ "://"
					+ forwaredHost
					+ this.request.getContextPath()
					+ "/forums/list"
					+ SystemGlobals.getValue(ConfigKeys.SERVLET_EXTENSION)); 
			}
		}
	}
	private boolean isValidReturnPath() {
		if (request.getParameter("returnPath") != null) {
			return request.getParameter("returnPath").startsWith(SystemGlobals.getValue(ConfigKeys.FORUM_LINK));
		} else {
			return false;
		}
	}
	public void validateLogin()
	{
		String password;
		String username;

		if (parseBasicAuthentication()) {
			username = (String)this.request.getAttribute("username");
			password = (String)this.request.getAttribute("password");
		} 
		else {
			username = this.request.getParameter("username");
			password = this.request.getParameter("password");
		}

		boolean validInfo = false;

		if (password.length() > 0) {
			final UserDAO userDao = DataAccessDriver.getInstance().newUserDAO();
			User user = userDao.validateLogin(username, password);

			if (user != null) {
				// Note: here we only want to set the redirect location if it hasn't already been
				// set. This will give the LoginAuthenticator a chance to set the redirect location.
				this.buildSucessfulLoginRedirect();

				SessionFacade.makeLogged();

				String sessionId = SessionFacade.isUserInSession(user.getId());
				UserSession userSession = new UserSession(SessionFacade.getUserSession());

				// Remove the "guest" session
				SessionFacade.remove(userSession.getSessionId());

				userSession.dataToUser(user);

				UserSession currentUs = SessionFacade.getUserSession(sessionId);

				// Check if the user is returning to the system
				// before its last session has expired ( hypothesis )
                UserSession tmpUs;
				if (sessionId != null && currentUs != null) {
					// Write its old session data
					SessionFacade.storeSessionData(sessionId, JForumExecutionContext.getConnection());
					tmpUs = new UserSession(currentUs);
					SessionFacade.remove(sessionId);
				}
				else {
					UserSessionDAO userSessionDao = DataAccessDriver.getInstance().newUserSessionDAO();
					tmpUs = userSessionDao.selectById(userSession, JForumExecutionContext.getConnection());
				}

				I18n.load(user.getLang());

				// Autologin
				if (this.request.getParameter("autologin") != null
						&& SystemGlobals.getBoolValue(ConfigKeys.AUTO_LOGIN_ENABLED)) {
					userSession.setAutoLogin(true);

					// Generate the user-specific hash
					String systemHash = Hash.md5(SystemGlobals.getValue(ConfigKeys.USER_HASH_SEQUENCE) + user.getId());
					String userHash = Hash.md5(System.currentTimeMillis() + systemHash);

					// Persist the user hash
					userDao.saveUserAuthHash(user.getId(), userHash);

					systemHash = Hash.md5(userHash);

					ControllerUtils.addCookie(SystemGlobals.getValue(ConfigKeys.COOKIE_AUTO_LOGIN), "1");
					ControllerUtils.addCookie(SystemGlobals.getValue(ConfigKeys.COOKIE_USER_HASH), systemHash);
				}
				else {
					// Remove cookies for safety
					ControllerUtils.addCookie(SystemGlobals.getValue(ConfigKeys.COOKIE_USER_HASH), null);
					ControllerUtils.addCookie(SystemGlobals.getValue(ConfigKeys.COOKIE_AUTO_LOGIN), null);
				}

				if (tmpUs == null) {
					userSession.setLastVisit(new Date(System.currentTimeMillis()));
				}
				else {
					// Update last visit and session start time
					userSession.setLastVisit(new Date(tmpUs.getStartTime().getTime() + tmpUs.getSessionTime()));
				}

				SessionFacade.add(userSession);
				SessionFacade.setAttribute(ConfigKeys.TOPICS_READ_TIME, new ConcurrentHashMap<Integer, Long>());
				ControllerUtils.addCookie(SystemGlobals.getValue(ConfigKeys.COOKIE_NAME_DATA), 
					Integer.toString(user.getId()));

				SecurityRepository.load(user.getId(), true);
				validInfo = true;
			}
		}

		// Invalid login
		if (!validInfo) {
			this.context.put("invalidLogin", "1");
			this.setTemplateName(TemplateKeys.HOME_LOGIN);

			if (isValidReturnPath()) {
				this.context.put("returnPath", this.request.getParameter("returnPath"));
			}
		} 
		else if (isValidReturnPath()) {
			JForumExecutionContext.setRedirect(this.request.getParameter("returnPath"));
		}
	}

	/*public Template process(final RequestContext request, final ResponseContext response, final SimpleHash context)
	{
		JForumExecutionContext.setContentType("text/xml");
		return super.process(request, response, context);
	}*/
}
