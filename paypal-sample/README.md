REST API Samples
===================


This sample project contains a set of simple command line samples that you can explore to understand what the REST APIs can do for you.
The sample comes pre-configured with a test account but in case you need to try them against your account, you must
   
   * Obtain your client id and client secret from the developer portal

Test Account
------------

   * Test Client ID and Client Secret can be found in the file sdk_config.properties file under src/main/resources/ folder.
   * The endpoint URL for token generation and API calls are fetched from sdk_config.properties file under src/main/resources/ folder.
   * AccessToken are generated once using GenerateAccessToken.java and used for the samples.
   
Build and run the samples
--------------------------
	* Simply run `mvn install` to build war file.
	* Run `mvn jetty:run` to run the war file using maven jetty.
	* Access `http://localhost:<jetty-port>/rest-api-sample/` in your browser to play with the test pages, `<jetty-port>` is configurable in pom.xml.

Samples
========

Save a credit card
----------------------

Save a credit card shows you how to create a CreditCard by POSTing to the URI /v1/vault/credit-card.

Payment with a credit card
--------------------------

Payment with a credit card shows you how to create a Payment by POSTing a Payment object to the URI '/v1/payments/payment'. This sample typically shows you how to create a Payment using CreditCard as a payment method.

Payment with a PayPal Account
-----------------------------

Payment with a PayPal Account shows you how to create a Payment by POSTing a Payment object to the URI '/v1/payments/payment'. The sample includes a redirection flow to complete the payment.

Payment with saved credit card
------------------------------

Payment with saved credit card shows you how to create a Payment by POSTing a Payment object to the URI '/v1/payments/payment'. This sample typically shows you how to create a Payment using saved CardID.

Get credit card Details
-----------------------

Get credit card Details shows you how to retrieve a saved CreditCard from the service using a valid CardId.

Get Payment History
-------------------

Get Payment History shows you how to retrieve a PaymentHistory using count parameter. There are various parameters that can be used to retrieve a PaymentHistory like count, startId, startIndex, payeeId. This samples shows you how to use the count parameter.

Get Payment Details
-------------------

Get Payment Details shows you how to retrieve a Payment from the service. The sample uses a valid Payment ID as an input and fetches the Payment resource associated with the ID.

Get Sale Details
----------------

Get Sale Details shows you how to retrieve a Sale using a Sale ID.

Refund a Payment
----------------

Refund a Payment shows you how to Refund on a Sale resource. The sample uses a Sale ID and a valid Refund object to call the Refund API on the Sale object.
