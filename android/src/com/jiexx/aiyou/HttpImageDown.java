package com.jiexx.aiyou;

import org.androidannotations.annotations.rest.Accept;
import org.androidannotations.annotations.rest.Get;
import org.androidannotations.annotations.rest.Rest;
import org.androidannotations.api.rest.MediaType;
import org.androidannotations.api.rest.RestClientHeaders;
import org.springframework.http.converter.ByteArrayHttpMessageConverter;


@Rest(converters = { ByteArrayHttpMessageConverter.class })
public interface HttpImageDown /*extends RestClientHeaders*/ {

    @Get("{url}")
    @Accept(MediaType.APPLICATION_OCTET_STREAM)
    byte[] getImageBytes(String url);

}