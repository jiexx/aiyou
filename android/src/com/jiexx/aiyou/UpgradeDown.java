package com.jiexx.aiyou;

import org.androidannotations.annotations.rest.Accept;
import org.androidannotations.annotations.rest.Get;
import org.androidannotations.annotations.rest.Rest;
import org.androidannotations.api.rest.MediaType;
import org.androidannotations.api.rest.RestClientHeaders;
import org.springframework.http.converter.ByteArrayHttpMessageConverter;


@Rest(rootUrl = "http://127.0.0.1", converters = { ByteArrayHttpMessageConverter.class })
public interface UpgradeDown extends RestClientHeaders {

    @Get("/files/{version}")
    @Accept(MediaType.APPLICATION_OCTET_STREAM)
    byte[] getBytes(String version);
}