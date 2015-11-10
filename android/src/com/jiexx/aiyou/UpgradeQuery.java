package com.jiexx.aiyou;

import org.androidannotations.annotations.rest.Get;
import org.androidannotations.annotations.rest.Rest;
import org.springframework.http.converter.json.GsonHttpMessageConverter;


@Rest(rootUrl = "http://127.0.0.1", converters = { GsonHttpMessageConverter.class })
public interface UpgradeQuery  {

	 @Get("/query?type={type}&version={version}")
	 UpgradeInfo getUpgradeInfo(String type, String version);
}
