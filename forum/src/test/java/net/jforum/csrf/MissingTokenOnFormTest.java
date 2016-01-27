package net.jforum.csrf;

import static org.junit.Assert.assertEquals;

import java.io.File;
import java.util.ArrayList;
import java.util.Collection;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.apache.commons.io.FileUtils;
import org.apache.commons.lang3.StringUtils;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.Parameterized;
import org.junit.runners.Parameterized.Parameters;

/**
 * Tests each form has an OWASP token.
 * 
 * @author Jeanne Boyarsky, Andowson Chang
 * @version $Id: $
 */
@RunWith(Parameterized.class)
public class MissingTokenOnFormTest {
	private static final String ROOT_DIR = MissingTokenOnFormTest.class.getResource("/").getPath();	
	private static final String JFORUM_DIRECTORY = ROOT_DIR.substring(0, ROOT_DIR.length() - "/target/test-classes/".length());	
	
    private File file;
    private String fileName;
    private String content;

    public MissingTokenOnFormTest(File file) {
        this.file = file;
    }

    @Before
    public void setUp() throws Exception {
        fileName = file.getAbsolutePath().replaceFirst(JFORUM_DIRECTORY, "");
        content = FileUtils.readFileToString(file);
    }

    @After
    public void tearDown() {
        file = null;
        fileName = null;
        content = null;
    }

    // ----------------------------------------------------------------
    @Parameters
    public static Collection<Object[]> fileNamesToCheck() throws Exception {
        String htmlDirectory = JFORUM_DIRECTORY + "/src/main/resources/templates";
        return findHtmlFiles(htmlDirectory, new File(htmlDirectory));
    }

    private static Collection<Object[]> findHtmlFiles(String commonDirectory, File source) throws Exception {
        Collection<Object[]> result = new ArrayList<Object[]>();
        File[] dir = source.listFiles();
        for (File file : dir) {
            // if a directory other than version control, recurse
            if (file.isDirectory() && !file.getName().startsWith(".") && !file.getName().equals("macros")) {
                result.addAll(findHtmlFiles(commonDirectory, file));
            }
            if (file.getName().endsWith(".htm") || file.getName().endsWith(".ftl")) {
                result.add(new Object[] { file });
            }
        }
        return result;
    }

    // ----------------------------------------------------------------
    @Test
    public void pagesMissingToken() throws Exception {
        int numForms = countNumberForms(content, "<form[^>]+method=['\"]post['\"]");
        int numTokens = StringUtils.countMatches(content, "name=\"OWASP_CSRFTOKEN\"");
        assertEquals("forms must have a OWASP token set as a hidden field.  Missing " + (numForms - numTokens)
                + " in: " + fileName, numForms, numTokens);
    }

    @Test
    public void multipartRequestNeedsTokenInUrl() throws Exception {
        int numForms = countNumberForms(content, "<form[^>]+multipart/form-data");
        int numTokens = countNumberForms(content, "<form[^>]+multipart/form-data[^>]+OWASP_CSRFTOKEN=")
                + countNumberForms(content, "<form[^>]+OWASP_CSRFTOKEN=[^>]+multipart/form-data");
        assertEquals(
                "multipart forms must have a OWASP token set as a parameter in the URL due to how JForum is implemented. "
                        + (numForms - numTokens) + " in: " + fileName, numForms, numTokens);
    }

    @Test
    public void noMethod() throws Exception {
        int numForms = countNumberForms(content, "<form(?![^>]*method)[^>]*>");
        int numBlankActions = countNumberForms(content, "<form[^>]*action=['\"]['\"][^>]*>");
        int numMissingActions = countNumberForms(content, "<form(?![^>]*action)[^>]*>");
        assertEquals(
                "Forms should be get or post unless have no action (and is therefore just used for javascript on page): "
                        + fileName, numBlankActions + numMissingActions, numForms);
    }

    private int countNumberForms(String content, String patternString) {
        Pattern pattern = Pattern.compile(patternString, Pattern.CASE_INSENSITIVE);
        Matcher matcher = pattern.matcher(content);
        int count = 0;
        while (matcher.find()) {
            count++;
        }
        return count;
    }
}
