<%@ page language="java" contentType="text/html; charset=ISO-8859-1"
	pageEncoding="ISO-8859-1"%>
<%@ page import="java.util.List"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=ISO-8859-1">
<meta charset="utf-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="">
<meta name="author" content="">
<title>PayPal REST API Samples</title>
<link rel="icon" href="images/favicon.ico">

<link rel="stylesheet"
	href="https://maxcdn.bootstrapcdn.com/bootstrap/3.2.0/css/bootstrap.min.css">
<link
	href="//maxcdn.bootstrapcdn.com/font-awesome/4.2.0/css/font-awesome.min.css"
	rel="stylesheet">
<style>
body {
	font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
}

pre {
	overflow-y: auto;
	overflow-wrap: normal;
}

pre.error, div.error, p.error {
	border-color: red;
	color: red;
	overflow-y: visible;
	overflow-wrap: break-word;
}

.panel-default>.panel-heading.error {
	background-color: red;
	color: white;
}

.panel-title a, .home {
	font-family: Menlo, Monaco, Consolas, "Courier New", monospace;
}

h1.error, h2.error, h3.error, h4.error, h5.error {
	color: red;
}

.panel-default>.panel-heading {
	color: #FFF;
	background-color: #428bca;
	border-color: #428bca;
}

.row {
	margin-right: 0px;
	margin-left: 0px;
}

.header {
	background: #fff
		url("https://www.paypalobjects.com/webstatic/developer/banners/Braintree_desktop_BG_2X.jpg")
		no-repeat top right;
	-webkit-background-size: cover;
	-moz-background-size: cover;
	-o-background-size: cover;
	background-size: cover;
	color: #EEE;
}

.header a:link, .header a:visited, .header a:hover, .header a:active {
	text-decoration: none;
}
/* Sticky footer styles
-------------------------------------------------- */
html {
	position: relative;
	min-height: 100%;
}

body {
	/* Margin bottom by footer height */
	margin-bottom: 60px;
}

.footer {
	position: absolute;
	bottom: 0;
	width: 100%;
	/* Set the fixed height of the footer here */
	min-height: 60px;
	padding-top: 15px;
}

.footer .footer-links, .footer .footer-links li {
	display: inline-block;
	padding: 5px 8px;
	font-size: 110%;
}

.footer a {
	text-decoration: none;
}

pre .string {
	color: #428bca;
}

pre .number {
	color: darkorange;
}

pre .boolean {
	color: blue;
}

pre .null {
	color: magenta;
}

pre .key {
	color: slategray;
	font-weight: bold;
}

pre .id {
	color: red;
}
</style>
<!-- HTML5 shim and Respond.js IE8 support of HTML5 elements and media queries -->
<!--[if lt IE 9]>
    <script src="https://oss.maxcdn.com/html5shiv/3.7.2/html5shiv.min.js"></script>
    <script src="https://oss.maxcdn.com/respond/1.4.2/respond.min.js"></script>
    <![endif]-->

<script
	src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>
<script
	src="https://maxcdn.bootstrapcdn.com/bootstrap/3.2.0/js/bootstrap.min.js"></script>
<script
	src="//cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.2.0/js/scrollspy.min.js"></script>
<script>
	$(document)
			.ready(
					function() {
						$("#accordion .panel-collapse:last").collapse('toggle');

						$(document.body)
								.append(
										'<footer class="footer"> <div class="container"> <div class="footer-div"> <ul class="footer-links"> <li> <a href="https://github.com/paypal/PayPal-Java-SDK" target="_blank"><i class="fa fa-github"></i> Github</a></li><li> <a href="https://developer.paypal.com/webapps/developer/docs/api/" target="_blank"><i class="fa fa-book"></i> REST API Reference</a> </li><li> <a href="https://github.com/paypal/PayPal-Java-SDK/issues" target="_blank"><i class="fa fa-exclamation-triangle"></i> Report Issues </a> </li></ul> </div></div></footer>');

						$(".prettyprint").each(function() {
							if ($(this).html().trim() != '') {
								try {
									$(this).html(syntaxHighlight(JSON.stringify(JSON.parse($(this).html().trim()), null,2)));
							    } catch (e) {
							        return false;
							    }
							} else {
								$(this).html('No Data');
							}
						});

					});

	/* http://stackoverflow.com/questions/4810841/how-can-i-pretty-print-json-using-javascript */
	function syntaxHighlight(json) {
		json = json.replace(/&/g, '&').replace(/</g, '&lt;').replace(/>/g,
				'&gt;');
		return json
				.replace(
						/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
						function(match) {
							var cls = 'number';
							if (/^"/.test(match)) {
								if (/:$/.test(match)) {
									cls = 'key';
									if (match == '"id":') {
										console.log("Matched ID" + match);
										cls = 'key id';
									}
								} else {
									cls = 'string';
								}
							} else if (/true|false/.test(match)) {
								cls = 'boolean';
							} else if (/null/.test(match)) {
								cls = 'null';
							}
							return '<span class="' + cls + '">' + match
									+ '</span>';
						});
	}
</script>
</head>
<body>
	<%
		List<String> responses = (List<String>) request
				.getAttribute("responses");
		List<String> requests = (List<String>) request
				.getAttribute("requests");
		List<String> messages = (List<String>) request
				.getAttribute("messages");
		List<String> errors = (List<String>) request.getAttribute("errors");
	%>
	<div class="row header">
		<div class="col-md-5 pull-left">
			<br /> <a href="index.html"><h1 class="home">&#10094;&#10094;
					Back to Samples</h1></a><br />
		</div>
		<br />
		<div class="col-md-4 pull-right">
			<img
				src="https://www.paypalobjects.com/webstatic/developer/logo2_paypal_developer_2x.png"
				class="logo" width="300" />
		</div>
	</div>
	
	<div class="panel-group" id="accordion" role="tablist"
		aria-multiselectable="true">
	<%
		for (int i = 0; i < responses.size(); i++) {
			String resp = responses.get(i);
			String req = requests.get(i);
			String message = messages.get(i);
			String error = errors.get(i);
			String errorClass = (error != null) ? "error" : null;
	%>
		<div class="panel panel-default">
			<div class="panel-heading <%= errorClass %>" role="tab" id="heading-<%= i + 1 %>">
				<h4 class="panel-title">
					<a data-toggle="collapse" data-parent="#accordion"
						href="#step-<%= i + 1 %>" aria-expanded="false"
						aria-controls="step-<%= i + 1 %>"><%= i + 1 %>. <%= message %> <% if (error != null) {  %>(Failed)<% } %></a>
				</h4>
			</div>
			<div id="step-<%= i + 1 %>" class="panel-collapse collapse"
				role="tabpanel" aria-labelledby="heading-<%= i + 1 %>">
				<div class="panel-body">
					<%
		if (request.getAttribute("redirectURL") != null) {
	%>
					<div>
						<a href=<%=(String) request.getAttribute("redirectURL")%>>Redirect
							to PayPal to approve the payment</a>
					</div>
					<%
		}
	%>
					<div class="row hidden-xs hidden-sm hidden-md">
						<div class="col-md-6">
							<h4>Request Object</h4>
							<pre class="prettyprint "><%= req %></pre>
						</div>
						<div class="col-md-6">
							<h4 class="<%= errorClass %>">Response Object</h4>
							<% if (error != null) {  %>
								<p class="error"><i class="fa fa-exclamation-triangle"></i> <%= error %></p>
							<% } %>
							<pre class="prettyprint "><%= resp %></pre>
						</div>
					</div>
					<div class="hidden-lg">
						<ul class="nav nav-tabs" role="tablist">
							<li role="presentation"><a href="#step-<%= i + 1 %>-request"
								role="tab" data-toggle="tab">Request</a></li>
							<li role="presentation" class="active"><a
								href="#step-<%= i + 1 %>-response" role="tab" data-toggle="tab">Response</a></li>
						</ul>
						<div class="tab-content">
							<div role="tabpanel" class="tab-pane"
								id="step-<%= i + 1 %>-request">
								<h4>Request Object</h4>
								<pre class="prettyprint "><%= req %></pre>
							</div>
							<div role="tabpanel" class="tab-pane active"
								id="step-<%= i + 1 %>-response">
								<h4>Response Object</h4>
								<pre class="prettyprint "><%= resp %></pre>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
		<% } %>
	</div>
</body>
</html>