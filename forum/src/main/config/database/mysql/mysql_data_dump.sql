# Set default user/group ids
SET @GENERAL_GROUP_ID = 1;
SET @ADMIN_GROUP_ID = 2;
SET @ANONYMOUS_ID = 1;
SET @ADMIN_ID = 2;
SET character_set_client='utf8';
SET character_set_connection='utf8';
SET character_set_results='utf8';
SET character_set_database='utf8';
SET character_set_server='utf8';
#
# Groups
#
INSERT INTO jforum_groups ( group_id, group_name, group_description ) VALUES (@GENERAL_GROUP_ID, 'General', 'General Users');
INSERT INTO jforum_groups ( group_id, group_name, group_description ) VALUES (@ADMIN_GROUP_ID, 'Administration', 'Admin Users');

# 
# Users
#
INSERT INTO jforum_users ( user_id, username, user_password, user_regdate ) VALUES (@ANONYMOUS_ID, 'Anonymous', 'nopass', NOW());
INSERT INTO jforum_users ( user_id, username, user_password, user_regdate, user_posts ) VALUES (@ADMIN_ID, 'Admin', '21232f297a57a5a743894a0e4a801fc3', NOW(), 1);

#
# User Groups
#
INSERT INTO jforum_user_groups (group_id, user_id) VALUES (@GENERAL_GROUP_ID, @ANONYMOUS_ID);
INSERT INTO jforum_user_groups (group_id, user_id) VALUES (@ADMIN_GROUP_ID, @ADMIN_ID);
	
#
# Smilies
#
INSERT INTO jforum_smilies (code, url, disk_name) VALUES (':)', '<img src=\"#CONTEXT#/images/smilies/3b63d1616c5dfcf29f8a7a031aaa7cad.gif\" alt=\"smilie\" />', '3b63d1616c5dfcf29f8a7a031aaa7cad.gif');
INSERT INTO jforum_smilies (code, url, disk_name) VALUES (':-)', '<img src=\"#CONTEXT#/images/smilies/3b63d1616c5dfcf29f8a7a031aaa7cad.gif\" alt=\"smilie\" />', '3b63d1616c5dfcf29f8a7a031aaa7cad.gif');
INSERT INTO jforum_smilies (code, url, disk_name) VALUES (':D', '<img src=\"#CONTEXT#/images/smilies/283a16da79f3aa23fe1025c96295f04f.gif\" alt=\"smilie\" />', '283a16da79f3aa23fe1025c96295f04f.gif');
INSERT INTO jforum_smilies (code, url, disk_name) VALUES (':-D', '<img src=\"#CONTEXT#/images/smilies/283a16da79f3aa23fe1025c96295f04f.gif\" alt=\"smilie\" />', '283a16da79f3aa23fe1025c96295f04f.gif');
INSERT INTO jforum_smilies (code, url, disk_name) VALUES (':(', '<img src=\"#CONTEXT#/images/smilies/9d71f0541cff0a302a0309c5079e8dee.gif\" alt=\"smilie\" />', '9d71f0541cff0a302a0309c5079e8dee.gif');
INSERT INTO jforum_smilies (code, url, disk_name) VALUES (':mrgreen:', '<img src=\"#CONTEXT#/images/smilies/ed515dbff23a0ee3241dcc0a601c9ed6.gif\" alt=\"smilie\" />', 'ed515dbff23a0ee3241dcc0a601c9ed6.gif');
INSERT INTO jforum_smilies (code, url, disk_name) VALUES (':-o', '<img src=\"#CONTEXT#/images/smilies/47941865eb7bbc2a777305b46cc059a2.gif\" alt=\"smilie\" />', '47941865eb7bbc2a777305b46cc059a2.gif');
INSERT INTO jforum_smilies (code, url, disk_name) VALUES (':shock:', '<img src=\"#CONTEXT#/images/smilies/385970365b8ed7503b4294502a458efa.gif\" alt=\"smilie\" />', '385970365b8ed7503b4294502a458efa.gif');
INSERT INTO jforum_smilies (code, url, disk_name) VALUES (':?:', '<img src=\"#CONTEXT#/images/smilies/0a4d7238daa496a758252d0a2b1a1384.gif\" alt=\"smilie\" />', '0a4d7238daa496a758252d0a2b1a1384.gif');
INSERT INTO jforum_smilies (code, url, disk_name) VALUES ('8)', '<img src=\"#CONTEXT#/images/smilies/b2eb59423fbf5fa39342041237025880.gif\" alt=\"smilie\" />', 'b2eb59423fbf5fa39342041237025880.gif');
INSERT INTO jforum_smilies (code, url, disk_name) VALUES (':lol:', '<img src=\"#CONTEXT#/images/smilies/97ada74b88049a6d50a6ed40898a03d7.gif\" alt=\"smilie\" />', '97ada74b88049a6d50a6ed40898a03d7.gif');
INSERT INTO jforum_smilies (code, url, disk_name) VALUES (':x', '<img src=\"#CONTEXT#/images/smilies/1069449046bcd664c21db15b1dfedaee.gif\" alt=\"smilie\" />', '1069449046bcd664c21db15b1dfedaee.gif');
INSERT INTO jforum_smilies (code, url, disk_name) VALUES (':P', '<img src=\"#CONTEXT#/images/smilies/69934afc394145350659cd7add244ca9.gif\" alt=\"smilie\" />', '69934afc394145350659cd7add244ca9.gif');
INSERT INTO jforum_smilies (code, url, disk_name) VALUES (':-P', '<img src=\"#CONTEXT#/images/smilies/69934afc394145350659cd7add244ca9.gif\" alt=\"smilie\" />', '69934afc394145350659cd7add244ca9.gif');
INSERT INTO jforum_smilies (code, url, disk_name) VALUES (':oops:', '<img src=\"#CONTEXT#/images/smilies/499fd50bc713bfcdf2ab5a23c00c2d62.gif\" alt=\"smilie\" />', '499fd50bc713bfcdf2ab5a23c00c2d62.gif');
INSERT INTO jforum_smilies (code, url, disk_name) VALUES (':cry:', '<img src=\"#CONTEXT#/images/smilies/c30b4198e0907b23b8246bdd52aa1c3c.gif\" alt=\"smilie\" />', 'c30b4198e0907b23b8246bdd52aa1c3c.gif');
INSERT INTO jforum_smilies (code, url, disk_name) VALUES (':evil:', '<img src=\"#CONTEXT#/images/smilies/2e207fad049d4d292f60607f80f05768.gif\" alt=\"smilie\" />', '2e207fad049d4d292f60607f80f05768.gif');
INSERT INTO jforum_smilies (code, url, disk_name) VALUES (':twisted:', '<img src=\"#CONTEXT#/images/smilies/908627bbe5e9f6a080977db8c365caff.gif\" alt=\"smilie\" />', '908627bbe5e9f6a080977db8c365caff.gif');
INSERT INTO jforum_smilies (code, url, disk_name) VALUES (':roll:', '<img src=\"#CONTEXT#/images/smilies/2786c5c8e1a8be796fb2f726cca5a0fe.gif\" alt=\"smilie\" />', '2786c5c8e1a8be796fb2f726cca5a0fe.gif');
INSERT INTO jforum_smilies (code, url, disk_name) VALUES (':wink:', '<img src=\"#CONTEXT#/images/smilies/8a80c6485cd926be453217d59a84a888.gif\" alt=\"smilie\" />', '8a80c6485cd926be453217d59a84a888.gif');
INSERT INTO jforum_smilies (code, url, disk_name) VALUES (';)', '<img src=\"#CONTEXT#/images/smilies/8a80c6485cd926be453217d59a84a888.gif\" alt=\"smilie\" />', '8a80c6485cd926be453217d59a84a888.gif');
INSERT INTO jforum_smilies (code, url, disk_name) VALUES (';-)', '<img src=\"#CONTEXT#/images/smilies/8a80c6485cd926be453217d59a84a888.gif\" alt=\"smilie\" />', '8a80c6485cd926be453217d59a84a888.gif');
INSERT INTO jforum_smilies (code, url, disk_name) VALUES (':!:', '<img src=\"#CONTEXT#/images/smilies/9293feeb0183c67ea1ea8c52f0dbaf8c.gif\" alt=\"smilie\" />', '9293feeb0183c67ea1ea8c52f0dbaf8c.gif');
INSERT INTO jforum_smilies (code, url, disk_name) VALUES (':?', '<img src=\"#CONTEXT#/images/smilies/136dd33cba83140c7ce38db096d05aed.gif\" alt=\"smilie\" />', '136dd33cba83140c7ce38db096d05aed.gif');
INSERT INTO jforum_smilies (code, url, disk_name) VALUES (':idea:', '<img src=\"#CONTEXT#/images/smilies/8f7fb9dd46fb8ef86f81154a4feaada9.gif\" alt=\"smilie\" />', '8f7fb9dd46fb8ef86f81154a4feaada9.gif');
INSERT INTO jforum_smilies (code, url, disk_name) VALUES (':arrow:', '<img src=\"#CONTEXT#/images/smilies/d6741711aa045b812616853b5507fd2a.gif\" alt=\"smilie\" />', 'd6741711aa045b812616853b5507fd2a.gif');
INSERT INTO jforum_smilies (code, url, disk_name) VALUES (':hunf:', '<img src=\"#CONTEXT#/images/smilies/0320a00cb4bb5629ab9fc2bc1fcc4e9e.gif\" alt=\"smilie\" />', '0320a00cb4bb5629ab9fc2bc1fcc4e9e.gif');
INSERT INTO jforum_smilies (code, url, disk_name) VALUES (':-(', '<img src=\"#CONTEXT#/images/smilies/9d71f0541cff0a302a0309c5079e8dee.gif\" alt=\"smilie\" />', '9d71f0541cff0a302a0309c5079e8dee.gif');
INSERT INTO jforum_smilies (code, url, disk_name) VALUES (':XD:', '<img src=\"#CONTEXT#/images/smilies/49869fe8223507d7223db3451e5321aa.gif\" alt=\"smilie\" />', '49869fe8223507d7223db3451e5321aa.gif');
INSERT INTO jforum_smilies (code, url, disk_name) VALUES (':thumbup:', '<img src=\"#CONTEXT#/images/smilies/e8a506dc4ad763aca51bec4ca7dc8560.gif\" alt=\"smilie\" />', 'e8a506dc4ad763aca51bec4ca7dc8560.gif');
INSERT INTO jforum_smilies (code, url, disk_name) VALUES (':thumbdown:', '<img src=\"#CONTEXT#/images/smilies/e78feac27fa924c4d0ad6cf5819f3554.gif\" alt=\"smilie\" />', 'e78feac27fa924c4d0ad6cf5819f3554.gif');
INSERT INTO jforum_smilies (code, url, disk_name) VALUES (':|', '<img src=\"#CONTEXT#/images/smilies/1cfd6e2a9a2c0cf8e74b49b35e2e46c7.gif\" alt=\"smilie\" />', '1cfd6e2a9a2c0cf8e74b49b35e2e46c7.gif');

#
# Demonstration Forum
#
INSERT INTO jforum_categories VALUES (1,'藏经阁',1,0);
INSERT INTO jforum_forums VALUES (1,1,'葵花宝典','',1,1,1,1);
INSERT INTO jforum_forums VALUES (2,1,'江湖传说','',2,1,2,0);
INSERT INTO jforum_topics VALUES (1,1,'简介',2,NOW(),0,0,0,0,0,1,1,0,0);
INSERT INTO jforum_topics VALUES (2,2,'这里是大家提问交流的地方',2,NOW(),1,0,0,0,0,2,2,0,0);
INSERT INTO jforum_posts VALUES (1,1,1,2,NOW(),'0:0:0:0:0:0:0:1',1,0,1,1,null,0,1,0,0);
INSERT INTO jforum_posts VALUES (2,2,2,2,NOW(),'0:0:0:0:0:0:0:1',1,0,1,1,NULL,0,1,0,0);
INSERT INTO jforum_posts_text VALUES (1,'[b][color=blue][size=18]向日葵社区关注健康，关注生命 :!: [/size][/color][/b]\n  \n社区由团沛软件开发和维护，通过智能爬虫从互联网中抓取健康相关的药物保健品知识、网友评论，归纳整理为一部关注健康的葵花宝典\n\n葵花宝典由爬虫生成，不允许编辑:!: \n 江湖传说可以提问发帖 :D  \n\n\n\n','简介');

#
# Roles
#
INSERT INTO jforum_roles (group_id, name) VALUES (@GENERAL_GROUP_ID, 'perm_vote');
INSERT INTO jforum_roles (group_id, name) VALUES (@GENERAL_GROUP_ID, 'perm_karma_enabled');
INSERT INTO jforum_roles (group_id, name) VALUES (@GENERAL_GROUP_ID, 'perm_anonymous_post');
INSERT INTO jforum_roles (group_id, name) VALUES (@GENERAL_GROUP_ID, 'perm_create_poll');
INSERT INTO jforum_roles (group_id, name) VALUES (@GENERAL_GROUP_ID, 'perm_bookmarks_enabled');
INSERT INTO jforum_roles (group_id, name) VALUES (@GENERAL_GROUP_ID, 'perm_attachments_download');
INSERT INTO jforum_roles (group_id, name) VALUES (@GENERAL_GROUP_ID, 'perm_create_sticky_announcement_topics');
INSERT INTO jforum_roles (group_id, name) VALUES (@GENERAL_GROUP_ID, 'perm_moderation_log');

# Admin
INSERT INTO jforum_roles (group_id, name) VALUES (@ADMIN_GROUP_ID, 'perm_administration');
INSERT INTO jforum_roles (group_id, name) VALUES (@ADMIN_GROUP_ID, 'perm_moderation');
INSERT INTO jforum_roles (group_id, name) VALUES (@ADMIN_GROUP_ID, 'perm_moderation_post_remove');
INSERT INTO jforum_roles (group_id, name) VALUES (@ADMIN_GROUP_ID, 'perm_moderation_post_edit');
INSERT INTO jforum_roles (group_id, name) VALUES (@ADMIN_GROUP_ID, 'perm_moderation_topic_move');
INSERT INTO jforum_roles (group_id, name) VALUES (@ADMIN_GROUP_ID, 'perm_moderation_topic_lockUnlock');
INSERT INTO jforum_roles (group_id, name) VALUES (@ADMIN_GROUP_ID, 'perm_moderation_approve_messages');
INSERT INTO jforum_roles (group_id, name) VALUES (@ADMIN_GROUP_ID, 'perm_create_sticky_announcement_topics');
INSERT INTO jforum_roles (group_id, name) VALUES (@ADMIN_GROUP_ID, 'perm_vote');
INSERT INTO jforum_roles (group_id, name) VALUES (@ADMIN_GROUP_ID, 'perm_create_poll');
INSERT INTO jforum_roles (group_id, name) VALUES (@ADMIN_GROUP_ID, 'perm_karma_enabled');
INSERT INTO jforum_roles (group_id, name) VALUES (@ADMIN_GROUP_ID, 'perm_bookmarks_enabled');
INSERT INTO jforum_roles (group_id, name) VALUES (@ADMIN_GROUP_ID, 'perm_attachments_download');
INSERT INTO jforum_roles (group_id, name) VALUES (@ADMIN_GROUP_ID, 'perm_moderation_log');
INSERT INTO jforum_roles (group_id, name) VALUES (@ADMIN_GROUP_ID, 'perm_full_moderation_log');

#
# View Forum
#
INSERT INTO jforum_roles (name, group_id) VALUES ('perm_forum', @GENERAL_GROUP_ID);
INSERT INTO jforum_role_values (role_id, role_value) VALUES (LAST_INSERT_ID(), '1');
	
INSERT INTO jforum_roles (name, group_id) VALUES ('perm_forum', @ADMIN_GROUP_ID);
INSERT INTO jforum_role_values (role_id, role_value) VALUES (LAST_INSERT_ID(), '1');

#
# Anonymous posts
#
INSERT INTO jforum_roles (name, group_id) VALUES ('perm_anonymous_post', @GENERAL_GROUP_ID);
INSERT INTO jforum_role_values (role_id, role_value ) VALUES (LAST_INSERT_ID(), '1');

INSERT INTO jforum_roles (name, group_id) VALUES ('perm_anonymous_post', @ADMIN_GROUP_ID);
INSERT INTO jforum_role_values (role_id, role_value ) VALUES (LAST_INSERT_ID(), '1');

#
# View Category
#
INSERT INTO jforum_roles (name, group_id) VALUES ('perm_category', @GENERAL_GROUP_ID);
INSERT INTO jforum_role_values (role_id, role_value ) VALUES (LAST_INSERT_ID(), '1');

INSERT INTO jforum_roles (name, group_id) VALUES ('perm_category', @ADMIN_GROUP_ID);
INSERT INTO jforum_role_values (role_id, role_value ) VALUES (LAST_INSERT_ID(), '1');

#
# Create / Reply to topics
#
INSERT INTO jforum_roles (name, group_id) VALUES ('perm_read_only_forums', @GENERAL_GROUP_ID);
INSERT INTO jforum_role_values ( role_id, role_value ) VALUES (LAST_INSERT_ID(), '1');

INSERT INTO jforum_roles (name, group_id) VALUES ('perm_read_only_forums', @ADMIN_GROUP_ID);
INSERT INTO jforum_role_values ( role_id, role_value ) VALUES (LAST_INSERT_ID(), '1');

# 
# Enable HTML
#
INSERT INTO jforum_roles (name, group_id ) VALUES ('perm_html_disabled', @GENERAL_GROUP_ID);
INSERT INTO jforum_role_values ( role_id, role_value ) VALUES (LAST_INSERT_ID(), '1');

INSERT INTO jforum_roles (name, group_id ) VALUES ('perm_html_disabled', @ADMIN_GROUP_ID);
INSERT INTO jforum_role_values ( role_id, role_value ) VALUES (LAST_INSERT_ID(), '1');

#
# Attachments
#
INSERT INTO jforum_roles (name, group_id) VALUES ('perm_attachments_enabled', @GENERAL_GROUP_ID);
INSERT INTO jforum_role_values ( role_id, role_value ) VALUES (LAST_INSERT_ID(), '1');

INSERT INTO jforum_roles (name, group_id) VALUES ('perm_attachments_enabled', @ADMIN_GROUP_ID);
INSERT INTO jforum_role_values ( role_id, role_value ) VALUES (LAST_INSERT_ID(), '1');

#
# Reply only
#
INSERT INTO jforum_roles (name, group_id) VALUES ('perm_reply_only',  @GENERAL_GROUP_ID);
INSERT INTO jforum_role_values ( role_id, role_value ) VALUES (LAST_INSERT_ID(), '1');

INSERT INTO jforum_roles (name, group_id) VALUES ('perm_reply_only', @ADMIN_GROUP_ID);
INSERT INTO jforum_role_values ( role_id, role_value ) VALUES (LAST_INSERT_ID(), '1');

#
# Reply without moderation
#
INSERT INTO jforum_roles (name, group_id) VALUES ('perm_reply_without_moderation',  @GENERAL_GROUP_ID);
INSERT INTO jforum_role_values ( role_id, role_value ) VALUES (LAST_INSERT_ID(), '1');

INSERT INTO jforum_roles (name, group_id) VALUES ('perm_reply_without_moderation', @ADMIN_GROUP_ID);
INSERT INTO jforum_role_values ( role_id, role_value ) VALUES (LAST_INSERT_ID(), '1');

#
# Moderation of forums
#
INSERT INTO jforum_roles (name, group_id) VALUES ('perm_moderation_forums', @ADMIN_GROUP_ID);
INSERT INTO jforum_role_values ( role_id, role_value ) VALUES (LAST_INSERT_ID(), '1');


INSERT INTO jforum_role_values (role_id, role_value) VALUES (24, '2');
INSERT INTO jforum_role_values (role_id, role_value) VALUES (25, '2');
INSERT INTO jforum_role_values (role_id, role_value) VALUES (30, '2');
INSERT INTO jforum_role_values (role_id, role_value) VALUES (31, '2');
INSERT INTO jforum_role_values (role_id, role_value) VALUES (34, '2');
INSERT INTO jforum_role_values (role_id, role_value) VALUES (35, '2');
INSERT INTO jforum_role_values (role_id, role_value) VALUES (36, '2');
INSERT INTO jforum_role_values (role_id, role_value) VALUES (37, '2');