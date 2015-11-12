package com.jiexx.aiyou;

import org.androidannotations.annotations.rest.Accept;
import org.androidannotations.annotations.rest.Get;
import org.androidannotations.annotations.rest.Rest;
import org.androidannotations.api.rest.MediaType;
import org.androidannotations.api.rest.RestClientHeaders;
import org.springframework.http.converter.ByteArrayHttpMessageConverter;


@Rest(rootUrl = Configuration.rootUrl, converters = { ByteArrayHttpMessageConverter.class })
public interface UpgradeDown /*extends RestClientHeaders*/ {

    @Get("/{version}.update")
    @Accept(MediaType.APPLICATION_OCTET_STREAM)
    byte[] getUpdateBytes(String version);
    
    @Get("/{version}.upgrade")
    @Accept(MediaType.APPLICATION_OCTET_STREAM)
    byte[] getUpgradeBytes(String version);
}