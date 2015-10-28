package com.jiexx.aiyou.dao;

import java.util.List;

import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.SelectKey;
import org.apache.ibatis.annotations.Update;
import org.apache.ibatis.mapping.StatementType;

import com.jiexx.aiyou.model.Comment;
import com.jiexx.aiyou.model.Driver;
import com.jiexx.aiyou.model.Goods;
import com.jiexx.aiyou.model.Image;
import com.jiexx.aiyou.model.Sellor;
import com.jiexx.aiyou.model.TopicComment;
import com.jiexx.aiyou.model.User;
import com.jiexx.aiyou.model.UserComment;
import com.mysql.jdbc.Blob;
import com.mysql.jdbc.Clob;

public interface Data {
	@Update("UPDATE user(lat, lng) VALUES(#{latitude}, #{longitude}) WHERE id=#{userid};")
	public int updateLocation(@Param("userid") long userid, @Param("latitude") float latitude, @Param("longitude") float longitude);
	
	@Select("SELECT 8 FROM sellor WHERE id=#{userid};")
	public Integer existSellor(@Param("userid") long userid);
	
	@Select("SELECT u.clazz, s.id,  2,  s.avatar, u.lat AS x, u.lng AS y, s.name FROM sellor AS s  JOIN "
			+ "(SELECT * FROM user WHERE lat > #{latstart} AND lat < #{latend} AND lng > #{lonstart} AND lng < #{lonend} ) AS u "
			+ "ON u.id = s.id LIMIT 100;")
	public List<User> querySellorByLoc(@Param("latstart") float latstart, @Param("latend") float latend, @Param("lonstart") float lonstart, @Param("lonend") float lonend);
	
	@Select("SELECT 1 FROM driver WHERE id=#{userid};")
	public Integer existDriver(@Param("userid") long userid);
	
	@Select("SELECT u.clazz, u.id, s.gender, s.avatar, u.lat AS x, u.lng AS y, s.name FROM driver AS s  JOIN "
			+ "(SELECT * FROM user WHERE lat > #{latstart} AND lat < #{latend} AND lng > #{lonstart} AND lng < #{lonend} ) AS u "
			+ "ON u.id = s.id LIMIT 100;")
	public List<User> queryDriverByLoc(@Param("latstart") float latstart, @Param("latend") float latend, @Param("lonstart") float lonstart, @Param("lonend") float lonend);
	
	@Select("SELECT 1 FROM user WHERE id=#{userid};")
	public Integer existUser(@Param("userid") long userid);
		
	@Insert("INSERT user(id, clazz, lat, lng, code) VALUES(#{userid}, #{clz}, #{latitude}, #{longitude}, #{code});")
	public int createUser(@Param("userid") long userid,  @Param("clz") String clz, @Param("latitude") float latitude, @Param("longitude") float longitude, @Param("code") String code);
	
	@Update("UPDATE user SET lat = #{latitude}, lng = #{longitude} WHERE id = #{userid};")
	public int updateLocByUser(@Param("userid") long userid,  @Param("latitude") float latitude, @Param("longitude") float longitude);
	
	@Update("UPDATE user SET code = #{code} WHERE id = #{userid};")
	public int updateUser(@Param("userid") long userid,  @Param("code") String code);

	@Update("UPDATE user SET class = concat(substr(class,1,3),abs(substr(class,4,1)-1),substr(5,length(class)) ) WHERE id = #{userid};")
	public int toggleClass(@Param("userid") long userid);
	
	
	

	@Select(" SELECT s.id AS id, s.name AS name, s.intro AS intro, s.call AS call, d.avatar AS uavatar, c.content AS ucomment FROM"
			+ "(SELECT id, name, img, intro, call FROM sellor WHERE id=#{userid} ) AS s  LEFT JOIN "
			+ "(SELECT avatar FROM driver AS d RIGHT ON ( SELECT uid, content FROM comment WHERE toid=#{userid} LIMIT 1 ) AS c WHERE c.uid = d.id );")
	public Sellor querySellorById(@Param("userid") long userid);
	
	@Select("SELECT id, name, car, avatar, intro, balance, visible FROM driver WHERE id=#{userid};")
	public Driver queryDriverById(@Param("userid") long userid);
	
	@Update("INSERT sellor(id,name,intro,car,balance,avatar,img)VALUES(#{id},#{name},#{intro},'TBD',#{balance},#{avatar},#{img});")
	public int insertSellor(@Param("id") long userid,  @Param("name") String name, @Param("intro") String intro, @Param("balance") int balance, @Param("avatar") byte[] avatar, @Param("img") String img);
	
	@Update("INSERT driver(id,name,gender,intro,car,visible,balance,avatar,img)VALUES(#{id},#{name},#{gender},#{intro},#{car},#{visible},#{balance},#{avatar},#{img});")
	public int insertDriver(@Param("id") long userid,  @Param("name") String name, @Param("gender") int gender, @Param("intro") String intro, @Param("car") String car, @Param("visible") int visible, @Param("balance") int balance, @Param("avatar") String avatar, @Param("img") String img);

	
	@Insert("INSERT comment(toid, uid, content, dnd) VALUES(#{toid}, #{uid}, #{content}, #{dnd});")
	public int comment(@Param("toid") long toid,  @Param("uid") long uid, @Param("content") String content, @Param("dnd") int dnd);
	
	@Select("SELECT id, toid, uid, dnd, time FROM comment WHERE id=#{cid} ;")
	public Comment queryComment(@Param("cid") long cid);
	
	@Select("SELECT a.id AS id, a.content AS content, a.toid AS toid, a.uid AS uid, a.dnd AS dnd, a.time AS time, b.name AS user, b.avatar AS avatar FROM "
			+ "(SELECT id, content, toid, uid, dnd, time FROM comment  WHERE toid=#{toid} AND toid<>uid ) AS a  LEFT JOIN "
			+ "(SELECT id, name, avatar FROM driver) AS b  ON a.uid=b.id;")
	public List<UserComment> queryCommentList(@Param("toid") long toid);
	
	@Select("SELECT content, dnd, time, name, avatar FROM (SELECT id, rid FROM reply WHERE id=#{topicid} ) AS a LEFT JOIN "
			+ "comment AS b ON a.rid=b.id LEFT JOIN "
			+ "(SELECT id, name, avatar FROM driver) AS c ON b.uid=c.id;")
	public List<TopicComment> queryTopicList(@Param("topicid") long topicid);
	
	@Insert("INSERT comment(toid, uid, content, dnd) VALUES(#{topic.toid}, #{topic.uid}, #{topic.content}, #{topic.dnd});")
	@SelectKey(before=false,keyProperty="topic.id",resultType=Long.class,statementType=StatementType.STATEMENT,statement="SELECT LAST_INSERT_ID() AS id")
	public int replyComment(@Param("topic") Comment topic);

	@Insert("INSERT reply(id, rid) VALUES(#{id}, #{rid});")
	public int reply(@Param("id") long id,  @Param("rid") long rid);
	
	
	@Select("SELECT a.id AS ownerid, a.name AS ownername, avatar, b.id AS productid, b.name AS productname, price, thumb, img, html FROM (SELECT id, name, avatar FROM sellor WHERE car='manager' ) AS a LEFT JOIN "
			+ "(SELECT id, name, ownerid, price, thumb, img, html  FROM store) AS b ON a.id=b.ownerid;")
	public List<Goods> queryTopGoods();
	
	@Select("SELECT * FROM images  WHERE uid = #{uid}; ")
	public List<Image> queryImage(@Param("uid") long uid );
	
	@Update("INSERT images ( uid, img, intro ) VALUES( #{img.uid}, #{img.img} , #{img.intro} );")
	@SelectKey(before=false,keyProperty="img.id",resultType=Long.class,statementType=StatementType.STATEMENT,statement="SELECT LAST_INSERT_ID() AS id")
	public Integer uploadImage(@Param("img") Image img );
	
	@Delete("DELETE FROM images WHERE id = #{id} ;")
	public Integer delImage(@Param("id") long id );

}
