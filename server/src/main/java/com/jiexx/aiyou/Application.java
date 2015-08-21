package com.jiexx.aiyou;

import java.util.concurrent.TimeUnit;

import javax.servlet.Filter;
import javax.sql.DataSource;

import org.apache.commons.dbcp.BasicDataSource;
import org.apache.ibatis.session.SqlSessionFactory;
import org.mybatis.spring.SqlSessionFactoryBean;
import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.embedded.EmbeddedServletContainerFactory;
import org.springframework.boot.context.embedded.ErrorPage;
import org.springframework.boot.context.embedded.tomcat.TomcatEmbeddedServletContainerFactory;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.ImportResource;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.datasource.DataSourceTransactionManager;

import com.jiexx.aiyou.controller.Interceptor;

@SpringBootApplication
//@ImportResource({ "file:src/main/resources/conf/spring.xml", "file:src/main/resources/conf/spring-mybatis.xml" })
@MapperScan("com.jiexx.aiyou.dao")
public class Application {
	public static void main(String[] args) {

		ApplicationContext ctx = SpringApplication.run(Application.class, args);
		
		System.out.println("--------------" + ctx.getClassLoader().getResource("web.xml"));
	}

	@Bean
	public DataSource getDataSource() {
		BasicDataSource dataSource = new BasicDataSource();
		dataSource.setDriverClassName("com.mysql.jdbc.Driver");
		dataSource.setUrl("jdbc:mysql://localhost:3306/aiyou");
		dataSource.setUsername("root");
		dataSource.setPassword("1234");
		return dataSource;
	}

	@Bean
	public DataSourceTransactionManager transactionManager() {
		return new DataSourceTransactionManager(getDataSource());
	}

	@Bean
	public SqlSessionFactory sqlSessionFactory() throws Exception {
		SqlSessionFactoryBean sessionFactory = new SqlSessionFactoryBean();
		sessionFactory.setDataSource(getDataSource());
		return sessionFactory.getObject();
	}
	
	@Bean
	public EmbeddedServletContainerFactory servletContainer() {
	    TomcatEmbeddedServletContainerFactory factory = new TomcatEmbeddedServletContainerFactory();
	    factory.setPort(9090);
	    factory.setSessionTimeout(10, TimeUnit.MINUTES);
	    //factory.addErrorPages(new ErrorPage(HttpStatus.NOT_FOUND, "/notfound.html"));
	    return factory;
	}
	
//	@Bean
//	public Filter logFilter() {
//		Interceptor filter = new AbstractRequestLoggingFilter ();
//	    filter.setIncludeQueryString(true);
//	    filter.setIncludePayload(true);
//	    filter.setMaxPayloadLength(5120);
//	    return filter;
//	}

}