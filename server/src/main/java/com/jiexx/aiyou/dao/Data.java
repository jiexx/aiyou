package com.jiexx.aiyou.dao;

import java.util.List;

import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import com.jiexx.aiyou.model.User;

public interface Data {
	@Update("UPDATE user(lat, lon) VALUES(#{latitude}, #{longitude}) WHERE id=#{userid};")
	public int updateLocation(@Param("userid") long userid, @Param("latitude") float latitude, @Param("longitude") float longitude);
	
	@Select("SELECT 1 FROM sellor WHERE id=#{userid};")
	public Integer querySellor(@Param("userid") long userid);
	
	@Select("SELECT u.class, u.id, 2, s.avatar, u.lat, u.lon, s.name FROM sellor AS s  LEFT JOIN "
			+ "(SELECT * FROM user WHERE lat > #{latstart} AND lat < #{latend} AND lon > #{lonstart} AND lon < #{lonend} ) AS u "
			+ "ON u.id = s.id;")
	public List<User> querySellorByLoc(@Param("latstart") float latstart, @Param("latend") float latend, @Param("lonstart") float lonstart, @Param("lonend") float lonend);
	
	@Select("SELECT 1 FROM driver WHERE id=#{userid};")
	public Integer queryDriver(@Param("userid") long userid);
	
	@Select("SELECT u.class, u.id, s.gender, s.avatar, u.lat, u.lon, s.name FROM driver AS s  LEFT JOIN "
			+ "(SELECT * FROM user WHERE lat > #{latstart} AND lat < #{latend} AND lon > #{lonstart} AND lon < #{lonend} ) AS u "
			+ "ON u.id = s.id;")
	public List<User> queryDriverByLoc(@Param("latstart") float latstart, @Param("latend") float latend, @Param("lonstart") float lonstart, @Param("lonend") float lonend);
	
	@Select("SELECT 1 FROM user WHERE id=#{userid};")
	public Integer queryUser(@Param("userid") long userid);
		
	@Insert("INSERT user(id, class, lat, lon, code) VALUES(#{userid}, #{clz}, #{latitude}, #{longitude}, #{code});")
	public int createUser(@Param("userid") long userid,  @Param("clz") String clz, @Param("latitude") float latitude, @Param("longitude") float longitude, @Param("code") String code);
	
	@Update("UPDATE user SET lat = #{latitude}, lon = #{longitude}, code = #{code} WHERE id = #{userid};")
	public int updateUser(@Param("userid") long userid,  @Param("latitude") float latitude, @Param("longitude") float longitude, @Param("code") String code);
	
	@Update("UPDATE user SET class = concat(substr(class,1,3),abs(substr(class,4,1)-1),substr(5,length(class)) ) WHERE id = #{userid};")
	public int toggleClass(@Param("userid") long userid);

}
