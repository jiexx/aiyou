1.eclipse market nodeclipse 1.0.1 install
2.casperjs 1.1.0 beta5
3.nodejs v4.4.0
4.phantomjs 2.1.1

http://www.w3school.com.cn/xpath/xpath_syntax.asp
http://docs.casperjs.org/en/latest/modules/casper.html#getelementsattribute

casperjs browser.js 0 "http://www.amazon.com/Tea/b/ref=dp_bc_3?ie=UTF8&node=16318401" "redirect"

npm install body-parser
npm install multer


drop database crawler;
create database crawler char set utf8;
create table crawler.product(id varchar(512), name varchar(512), pic text, descr text, producer varchar(512), score varchar(64), review text, link varchar(512));

drop table amazon.bank;
create table amazon.bank(id varchar(64), curr varchar(512) , link varchar(512), hit int, hitPage int, hitLink int);

create table amazon.hc360(id varchar(64), title varchar(256), price varchar(128), amount varchar(128), descr text, producer varchar(128), addr varchar(128), days varchar(128), link varchar(256), redirect varchar(256));