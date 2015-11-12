package com.jiexx.aiyou;

import org.androidannotations.annotations.rest.Get;
import org.androidannotations.annotations.rest.Rest;
import org.springframework.http.converter.json.GsonHttpMessageConverter;


@Rest(rootUrl = Configuration.rootUrl, converters = { GsonHttpMessageConverter.class })
public interface UpgradeQuery  {

	 @Get("/query?type={type}&version={version}")
	 Upgrade getUpgradeInfo(String type, String version);
}
