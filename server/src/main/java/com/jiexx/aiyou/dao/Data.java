package com.jiexx.aiyou.dao;

import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Update;

public interface Data {
	@Update("UPDATE user(lat, lon) VALUES(#{latitude}, #{longitude}) WHERE id=#{userid};")
	public int updateLocation(@Param("userid") long userid, @Param("latitude") float latitude, @Param("longitude") float longitude);
}
