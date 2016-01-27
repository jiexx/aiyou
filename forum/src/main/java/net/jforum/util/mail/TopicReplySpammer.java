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
 * Created on 04/03/2004 - 20:32:13
 * The JForum Project
 * http://www.jforum.net
 */
package net.jforum.util.mail;

import java.text.MessageFormat;
import java.util.List;

import net.jforum.JForumExecutionContext;
import net.jforum.api.integration.mail.pop.MessageId;
import net.jforum.entities.Post;
import net.jforum.entities.Topic;
import net.jforum.entities.User;
import net.jforum.util.preferences.ConfigKeys;
import net.jforum.util.preferences.SystemGlobals;
import net.jforum.view.forum.common.PostCommon;
import net.jforum.view.forum.common.ViewCommon;
import freemarker.template.SimpleHash;

/**
 * Notify users of replies to existing topics
 * @author Rafael Steil
 * @version $Id$
 */
public class TopicReplySpammer extends Spammer 
{
	/**
	 * Creates a new instance with a message's contents send
	 * @param topic the topic we are replying to 
	 * @param origPost the post instance, with the message's contents. If null,
	 * only a notification will be sent
	 * @param users list of users who'll be notified
	 */
	public TopicReplySpammer(final Topic topic, final Post origPost, final List<User> users)
	{
		super();
		Post post = new Post(origPost);
		// Make the topic url
		final StringBuilder page = new StringBuilder();
		final int postsPerPage = SystemGlobals.getIntValue(ConfigKeys.POSTS_PER_PAGE);

		if (topic.getTotalReplies() >= postsPerPage) {
			page.append(((topic.getTotalReplies() / postsPerPage)) * postsPerPage).append('/');
		}

		final String forumLink = ViewCommon.getForumLink();

		final String path = this.messageLink(topic, page, forumLink);
		final String unwatch = this.unwatchLink(topic, forumLink);

		final SimpleHash params = JForumExecutionContext.newSimpleHash();
		params.put("topic", topic);
		params.put("path", path);
		params.put("forumLink", forumLink);
		params.put("unwatch", unwatch);

		this.setMessageId(MessageId.buildMessageId(post.getId(), topic.getId(), topic.getForumId()));

		post = PostCommon.preparePostForDisplay(post);
		params.put("message", post.getText());

		this.setUsers(users);

		if (topic.getFirstPostId() != post.getId()) {
			this.setInReplyTo(MessageId.buildInReplyTo(topic));
		}

		this.setTemplateParams(params);
		final String subject = SystemGlobals.getValue(ConfigKeys.MAIL_NEW_ANSWER_SUBJECT);

		this.prepareMessage(
			MessageFormat.format(subject, new Object[] { topic.getTitle() }),
			SystemGlobals.getValue(ConfigKeys.MAIL_NEW_ANSWER_MESSAGE_FILE));
	}

	/**
	 * Creates the "unwatch" link for the current topic
	 * @param topic the topic
	 * @param forumLink the forum's link
	 * @return the unwath link
	 */
	private String unwatchLink(final Topic topic, final String forumLink)
	{
		return new StringBuilder(128)
			.append(forumLink)
			.append("posts/unwatch/")
			.append(topic.getId())
			.append(SystemGlobals.getValue(ConfigKeys.SERVLET_EXTENSION))
			.toString();
	}

	/**
	 * Creates the link to read the message online
	 * @param topic the topic
	 * @param page the current topic's page
	 * @param forumLink the forum's link
	 * @return the link to the message
	 */
	private String messageLink(final Topic topic, final StringBuilder page, final String forumLink)
	{
		return new StringBuilder(128)
			.append(forumLink)
			.append("posts/list/")
			.append(page.toString())
			.append(topic.getId()) 
			.append(SystemGlobals.getValue(ConfigKeys.SERVLET_EXTENSION))
			.append("#p")
			.append(topic.getLastPostId())
			.toString();
	}
}
