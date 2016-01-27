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
 * Created on 18/07/2007 14:03:15
 * 
 * The JForum Project
 * http://www.jforum.net
 */
package net.jforum.search;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import junit.framework.TestCase;
import net.jforum.TestCaseUtils;
import net.jforum.entities.Post;

import org.apache.log4j.Logger;
import org.apache.log4j.xml.DOMConfigurator;
import org.apache.lucene.analysis.standard.StandardAnalyzer;
import org.apache.lucene.search.Query;
import org.apache.lucene.search.ScoreDoc;
import org.junit.Before;
import org.junit.Test;

/**
 * @author Rafael Steil
 * @version $Id$
 */
public class LuceneSearchTestCase extends TestCase
{
    private static boolean logInitialized;

    private LuceneSearch search;
    private LuceneSettings settings;
    private LuceneIndexer indexer;

    @Test
    public void testFivePostsInTwoForumsSearchOneForumAndTwoValidTermsAndOneInvalidTermExpectThreeResults()
    {
        List<Post> l = this.createThreePosts();
        l.get(0).setForumId(1);
        l.get(1).setForumId(2);
        l.get(2).setForumId(1);

        this.indexer.create(l.get(0));
        this.indexer.create(l.get(1));
        this.indexer.create(l.get(2));

        // Post 4
        Post post = this.newPost();
        post.setText("It introduces you to searching, sorting, filtering and highlighting [...]");
        post.setForumId(2);
        this.indexer.create(post);

        // Post 5
        post = this.newPost();
        post.setText("How to integrate lucene into your applications");
        post.setForumId(1);
        l.add(post);
        this.indexer.create(post);

        // Search
        SearchArgs args = new SearchArgs();
        args.setForumId(1);
        args.setMatchType("ANY");
        args.setKeywords("open lucene xpto authoritative");

        List<?> results = this.search.search(args, -1).getRecords();

        assertEquals(3, results.size());
    }

    @Test
    public void testORExpressionUsingThreePostsSearchTwoTermsExpectThreeResults()
    {
        List<Post> l = this.createThreePosts();

        this.indexer.create(l.get(0));
        this.indexer.create(l.get(1));
        this.indexer.create(l.get(2));

        // Search
        SearchArgs args = new SearchArgs();
        args.setMatchType("ANY");
        args.setKeywords("open lucene");

        List<?> results = this.search.search(args, -1).getRecords();

        assertEquals(3, results.size());
    }

    private List<Post> createThreePosts()
    {
        List<Post> l = new ArrayList<Post>();

        // 1
        Post post = this.newPost();
        post.setText("lucene is a gem in the open source world");
        l.add(post);

        // 2
        post = this.newPost();
        post.setText("lucene in action is the authoritative guide to lucene");
        l.add(post);

        // 3
        post = this.newPost();
        post.setText("Powers search in surprising places [...] open to everyone");
        l.add(post);

        return l;
    }

    @Test
    public void testANDExpressionUsingTwoPostsWithOneCommonWordSearchTwoTermsExpectOneResult()
    {
        // 1
        Post post = this.newPost();
        post.setText("a regular text with some magic word");
        this.indexer.create(post);

        // 2
        post = this.newPost();
        post.setText("say shazan to see the magic happen");
        this.indexer.create(post);

        // Search
        SearchArgs args = new SearchArgs();
        args.setMatchType("all");
        args.setKeywords("magic regular");

        List<Post> results = this.search.search(args, -1).getRecords();

        assertEquals(1, results.size());
    }

    @Test
    public void testThreePostsSearchContentsExpectOneResult()
    {
        // 1
        Post post = this.newPost();
        post.setSubject("java");
        this.indexer.create(post);

        // 2
        post = this.newPost();
        post.setSubject("something else");
        this.indexer.create(post);

        // 3
        post = this.newPost();
        post.setSubject("debug");
        this.indexer.create(post);

        // Search
        SearchArgs args = new SearchArgs();
        args.setKeywords("java");

        List<?> results = this.search.search(args, -1).getRecords();

        assertEquals(1, results.size());
    }

    @Test
    public void testTwoDifferentForumsSearchOneExpectOneResult()
    {
        Post post1 = this.newPost();
        post1.setForumId(1);
        this.indexer.create(post1);

        Post post2 = this.newPost();
        post2.setForumId(2);
        this.indexer.create(post2);

        SearchArgs args = new SearchArgs();
        args.setForumId(1);

        List<?> results = this.search.search(args, -1).getRecords();

        assertEquals(1, results.size());
    }

    private Post newPost() 
    {
        Post post = new Post();

        post.setText("");
        post.setTime(new Date());
        post.setSubject("");
        post.setPostUsername("");

        return post;
    }

    @Override
    @Before
    protected void setUp() throws Exception
    {
        Logger logger = Logger.getLogger( this.getClass() );
        logger.debug( "hello, I am already initialized" );
        if (!logInitialized) {
            DOMConfigurator.configure(TestCaseUtils.getRootDir()+"/test-classes/log4j.xml");
            logInitialized = true;
        }
        TestCaseUtils.loadEnvironment();

        this.settings = new LuceneSettings(new StandardAnalyzer(LuceneSettings.VERSION));

        this.settings.useRAMDirectory();

        this.indexer = new LuceneIndexer(this.settings);

        this.search = new LuceneSearch(this.settings, new FakeResultCollector(this.settings));

        this.indexer.watchNewDocuDocumentAdded(this.search);
    }

    private static class FakeResultCollector extends LuceneContentCollector
    {
        public FakeResultCollector(LuceneSettings settings)
        {
            super(settings);
        }

        @Override
        public List<Post> collect(SearchArgs args, ScoreDoc[] hits, Query query)
        {
            List<Post> l = new ArrayList<Post>();
            for (int i = 0; i < hits.length; i++) {
                // We really don't care about the results, only how many they are
                l.add(new Post()); 
            }

            return l;
        }
    }
}
