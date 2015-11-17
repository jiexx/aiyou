package com.jiexx.aiyou;

import org.androidannotations.annotations.rest.Accept;
import org.androidannotations.annotations.rest.Get;
import org.androidannotations.annotations.rest.Rest;
import org.androidannotations.api.rest.MediaType;
import org.androidannotations.api.rest.RestClientHeaders;
import org.springframework.http.converter.ByteArrayHttpMessageConverter;


@Rest(rootUrl = Configuration.rootUrl, converters = { ByteArrayHttpMessageConverter.class })
public interface UpgradeDown /*extends RestClientHeaders*/ {

    @Get("/{version}.code")
    @Accept(MediaType.APPLICATION_OCTET_STREAM)
    byte[] getCodeBytes(String version);
    
    @Get("/{version}.resource")
    @Accept(MediaType.APPLICATION_OCTET_STREAM)
    byte[] getResourceBytes(String version);
    
    @Get("/{version}.map")
    @Accept(MediaType.APPLICATION_OCTET_STREAM)
    byte[] getMapBytes(String version);
    
    @Get("/{version}.upgrade")
    @Accept(MediaType.APPLICATION_OCTET_STREAM)
    byte[] getUpgradeBytes(String version);
}