package com.paypal.api.sample;

import java.io.FileNotFoundException;

import com.google.gson.FieldNamingPolicy;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonElement;
import com.google.gson.JsonIOException;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.google.gson.JsonSyntaxException;
import com.paypal.api.payments.PatchRequest;
import com.paypal.api.payments.Plan;
import com.paypal.base.rest.JSONFormatter;
import com.paypal.base.rest.PayPalRESTException;

public class SubscriptionSample extends BaseSample<Plan> {

	public SubscriptionSample() throws PayPalRESTException,
			JsonSyntaxException, JsonIOException, FileNotFoundException {
		super(new Plan());
		// TODO Auto-generated constructor stub
	}
	

	/**
	 * Create a plan.
	 * 
	 * https://developer.paypal.com/webapps/developer/docs/api/#create-a-plan
	 * 
	 * @return newly created Plan instance
	 * @throws PayPalRESTException
	 */
	public Plan create() throws PayPalRESTException {
		// populate Invoice object that we are going to play with
		String json = super.load("billingplan_create.json");
		super.instance = JSONFormatter.fromJSON(json, super.instance.getClass());
		super.instance = super.instance.create(accessToken);
		return super.instance;
	}
	
	/**
	 * Update a plan
	 * 
	 * https://developer.paypal.com/webapps/developer/docs/api/#update-a-plan
	 * 
	 * @return updated Plan instance
	 * @throws PayPalRESTException 
	 */
	public Plan update() throws PayPalRESTException {
		String json = super.load("billingplan_update.json");
		PatchRequest[] patch = JSONFormatter.fromJSON(json, PatchRequest[].class);
//		super.instance.update(super.accessToken, patch[0]);
		return super.instance;
	}
	
	private PatchRequest parsePatch(String json) {
		Gson GSON = new GsonBuilder().setPrettyPrinting()
				.setFieldNamingPolicy(FieldNamingPolicy.LOWER_CASE_WITH_UNDERSCORES).create();
		JsonElement elem = new JsonParser().parse(json);
		JsonObject obj = elem.getAsJsonObject();
		return null;
	}
	
	/**
	 * Retrieve a plan
	 * 
	 * https://developer.paypal.com/webapps/developer/docs/api/#retrieve-a-plan
	 * 
	 * @return the retrieved plan
	 * @throws PayPalRESTException
	 */
	public Plan retrieve() throws PayPalRESTException {
		return Plan.get(super.accessToken, super.instance.getId());
	}
	
	/**
	 * Main method that calls all methods above in a flow.
	 * 
	 * @param args
	 */
	public static void main(String[] args) {
		try {
			SubscriptionSample subscriptionSample = new SubscriptionSample();
			
			Plan plan = subscriptionSample.create();
			System.out.println("create response:\n" + Plan.getLastResponse());
			plan = subscriptionSample.update();
			System.out.println("plan updated");
			plan = subscriptionSample.retrieve();
			System.out.println("retrieve response:\n" + Plan.getLastResponse());
		} catch (JsonSyntaxException e) {
			e.printStackTrace();
		} catch (JsonIOException e) {
			e.printStackTrace();
		} catch (FileNotFoundException e) {
			e.printStackTrace();
		} catch (PayPalRESTException e) {
			e.printStackTrace();
		}
	}
}
