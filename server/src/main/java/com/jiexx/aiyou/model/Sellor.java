package com.jiexx.aiyou.model;

import com.mysql.jdbc.Blob;
import com.mysql.jdbc.Clob;

public class Sellor {
    public long id;
    public String name;
    public String img;
    public String intro;
    public String call;
    public Blob uavatar;
    public Clob ucomment;

}
