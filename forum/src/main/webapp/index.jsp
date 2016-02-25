<%@page import="net.jforum.util.preferences.*" %>
<%@page import="java.io.File" %>
<%
	String cfg = SystemGlobals.getValue(ConfigKeys.INSTALLATION_CONFIG);
	String redirect = "home/list.page";
	String path = request.getContextPath();
	
	if (cfg == null || !(new File(cfg).exists()) || !SystemGlobals.getBoolValue(ConfigKeys.INSTALLED)) {	
		redirect = "install.jsp";    
	}
	if(path != null && path.equals("/roger")) {
		redirect = "forums/list.page";
	}
	response.setStatus(301);
	response.setHeader("Location", redirect);
	response.setHeader("Connection", "close"); 
%>