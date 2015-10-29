package com.paypal.api.sample;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;

import com.google.gson.JsonIOException;
import com.google.gson.JsonSyntaxException;
import com.paypal.api.payments.util.GenerateAccessToken;
import com.paypal.base.rest.JSONFormatter;
import com.paypal.base.rest.PayPalRESTException;
import com.paypal.base.rest.PayPalResource;

public class BaseSample<T> {

	protected T instance;
	protected String accessToken = null;

	/**
	 * Initialize and instantiate an Invoice object
	 * @throws PayPalRESTException
	 * @throws JsonSyntaxException
	 * @throws JsonIOException
	 * @throws FileNotFoundException
	 */
	public BaseSample(T type) throws PayPalRESTException, JsonSyntaxException,
			JsonIOException, FileNotFoundException {

		instance = type;
		
		// initialize Invoice with credentials. User credentials must be stored
		// in the file
		PayPalResource.initConfig(new File(".",
						"src/main/resources/sdk_config.properties"));

		// get an access token
		accessToken = GenerateAccessToken.getAccessToken();
	}
	
	protected <T> T load(String jsonFile) {
	    try {
		    BufferedReader br = new BufferedReader(new FileReader("src/main/resources/" + jsonFile));
	        StringBuilder sb = new StringBuilder();
	        String line = br.readLine();

	        while (line != null) {
	            sb.append(line);
	            sb.append(System.getProperty("line.separator"));
	            line = br.readLine();
	        }
	        br.close();
	        return (T)JSONFormatter.fromJSON(sb.toString(), instance.getClass());
	        
	    } catch (IOException e) {
	    	e.printStackTrace();
	    	return (T)instance;
	    }
	}
}
