SELECT * FROM amazon.movie;

create table amazon.movie(id varchar(64), title varchar(256), download text, downtxt text, image varchar(256), publishtime varchar(128), type varchar(64), area varchar(64), director varchar(256), actor varchar(256), comment text, link varchar(256), redirect varchar(256));


LOAD DATA INFILE 'D:\\project\\aiyou\\movie\\db.csv' INTO TABLE amazon.movie character set utf8 FIELDS TERMINATED BY ',' LINES TERMINATED BY '\n' ;

alter table  amazon.movie add column clazz varchar(8);
set sql_safe_updates = 0;
delete from amazon.movie where id='id'
update amazon.movie set title=substring_index(substring_index(substring_index(title,'迅雷下载',1),'[',1),'(',1)

SELECT count(*) FROM  amazon.movie  where  clazz='ka'