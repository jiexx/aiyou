package net.jforum.csrf;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletRequestWrapper;

/**
 * Pass method instead of requestUri to match unportected logic from csrf.properties
 * @author Jeanne Boyarsky
 * @version $Id: $
 */
public class CsrfHttpServletRequestWrapper extends HttpServletRequestWrapper {
    
    private final String actionMethodName;

    public CsrfHttpServletRequestWrapper(final HttpServletRequest request, final String actionMethodName) {
        super(request);
        this.actionMethodName = actionMethodName;
    }
    @Override
    public String getRequestURI() {
        return actionMethodName;
    }
}

