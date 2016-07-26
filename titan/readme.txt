http://s3.thinkaurelius.com/docs/titan/1.0.0/hbase.html#_hbase_setup 
https://github.com/tinkerpop/rexster/wiki/Basic-REST-API

https://github.com/tinkerpop/rexster/wiki/Gremlin-Extension


http://s3.thinkaurelius.com/docs/titan/0.5.0/server.html

https://github.com/tinkerpop/gremlin/wiki

win7: NOT work ONLY ubuntu
hbase-site.xml--------------------------------------->
<configuration>
  <property>
    <name>hbase.rootdir</name>
    <value>file:///root/hbase</value>
  </property>
  <property>
    <name>hbase.zookeeper.property.dataDir</name>
    <value>/root/zookeeper</value>
  </property>
  <property>
    <name>hbase.cluster.distributed</name>
    <value>true</value>
  </property>
</configuration>
http://www.cnblogs.com/zq-inlook/p/4386216.html
http://stackoverflow.com/questions/19620642/failed-to-locate-the-winutils-binary-in-the-hadoop-binary-path


http://s3.thinkaurelius.com/docs/titan/1.0.0/server.html

cp conf/titan-hbase-es.properties conf/gremlin-server/
vi & add
gremlin.graph=com.thinkaurelius.titan.core.TitanFactory  fix>>no serializer for requested Accept header

http://blog.trackerbird.com/content/setting-up-titan-1-0-apache-hbase/
 conf/gremlin-server/gremlin-server.yaml>> host: 0.0.0.0

hbase-env.xml >>export JAVA_HOME=/opt/jdk1.8++  
titan.sh start elasticsearch ... timeout fix>> export JAVA_HOME=/opt/jdk1.8++  

http://stackoverflow.com/questions/37650202/issues-while-connecting-gremlin-to-gremlin-server
remote need websocket
http://sql2gremlin.com/
http://10.101.1.165:8182/?gremlin=graph.addVertex(label,%22category%22,%22name%22,%22Merchandising%22,%22description%22,%22Cool%20products%20to%20promote%20Gremlin%22)
http://10.101.1.165:8182/?gremlin=g.V().has(%22product%22,%22name%22,%22Red%20Gremlin%20Jacket%22)
