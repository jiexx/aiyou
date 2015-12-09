package com.jiexx.aiyou.controller;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurerAdapter;


@Configuration
public class WebResourcesConfig extends WebMvcConfigurerAdapter {
	private static final String[] CLASSPATH_RESOURCE_LOCATIONS = {
			"classpath:/META-INF/resources/", "classpath:/resources/",
			"classpath:/static/", "classpath:/public/", "classpath:/conf/", "classpath:/version/", "file:"+System.getProperty("user.dir") + "/images/" };
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
    	if (!registry.hasMappingForPattern("/webjars/**")) {
    		registry.addResourceHandler("/webjars/**").addResourceLocations(
    				"classpath:/META-INF/resources/webjars/");
    	}
    	if (!registry.hasMappingForPattern("/**")) {
    		registry.addResourceHandler("/**").addResourceLocations(
    				CLASSPATH_RESOURCE_LOCATIONS);
    	}
    	//System.out.println("file:"+System.getProperty("user.dir") + "/images/");
    	/*if (!registry.hasMappingForPattern("/images/**")) {
    		registry.addResourceHandler("/images/**").addResourceLocations("file:"+System.getProperty("user.dir") + "\\images\\");
    	}*/
    }
}