SELECT * FROM amazon.movie;
SELECT * FROM amazon.xunleitai;


create table amazon.movie(id varchar(64), title varchar(256), download text, downtxt text, image varchar(256), publishtime varchar(128), type varchar(64), area varchar(64), director varchar(256), actor varchar(256), comment text, link varchar(256), redirect varchar(256));
drop table amazon.xunleitai;
create table amazon.xunleitai(id varchar(64), clazz varchar(8), quality varchar(16), title varchar(256), download text, downtxt text, image varchar(256), publishtime varchar(128), type varchar(64), area varchar(64), director varchar(256), actor varchar(256), comment text, link varchar(256), redirect varchar(256), sub text, subtitle varchar(256));


LOAD DATA LOCAL INFILE 'D:\\newwww\\kickass.csv' INTO TABLE amazon.xunleitai character set utf8 FIELDS TERMINATED BY ';' ENCLOSED BY '"' LINES TERMINATED BY '\n';

alter table  amazon.movie add column clazz varchar(8);
set sql_safe_updates = 0;
delete from amazon.movie where id='id'
update amazon.movie set title=substring_index(substring_index(substring_index(title,'迅雷下载',1),'[',1),'(',1)

SELECT count(*) FROM  amazon.xunleitai  where  clazz='ka'