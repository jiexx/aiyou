package net.jforum.csrf;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FilenameFilter;
import java.io.IOException;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Properties;
import java.util.Scanner;
import java.util.Set;

import org.apache.log4j.Logger;
import org.junit.Before;
import org.junit.Test;

/**
 * Checks consistency of csrf.properties. In particular: keys have valid values,
 * no duplicate keys and no missing keys (per action method names). 
 * 
 * @author Jeanne Boyarsky, Andowson Chang
 * @version $Id: $
 */
public class CsrfTest {
	private static final Logger LOGGER = Logger.getLogger(CsrfTest.class);
	private static final String ROOT_DIR = CsrfTest.class.getResource("/").getPath();
	private static final String JFORUM_DIRECTORY = ROOT_DIR.substring(0, ROOT_DIR.length() - "/target/test-classes/".length());	
	private static final String CSRF_PROPERTIES = JFORUM_DIRECTORY + "/src/main/config/csrf.properties";
	private Collection<String> packagesWithActions;

	/**
	 * Could have just hard coded the action directories. Wrote a method because
	 * wanted to turn this into a unit test later and then automation is useful.
	 * 
	 * @throws Exception
	 */
	@Before
	public void findAllPackagesWithActions() throws Exception {
		packagesWithActions = new HashSet<String>();
		String configDirectory = JFORUM_DIRECTORY + "/src/main/config";
		Properties props = new Properties();
		props.load(new FileInputStream(new File(configDirectory,
				"modulesMapping.properties")));
		for (Object value : props.values()) {
			String fullyQualifiedClassName = (String) value;
			// remove everything after the last dot (class name)
			String packageName = fullyQualifiedClassName.replaceFirst(
					"\\.\\w+$", "");
			packagesWithActions.add(packageName);
		}
	}

	@Test
	public void listUniqueMethodNamesInAllActions() throws Exception {
		Set<String> methodNames = getAllUniqueActionMethodNames();
		Set<String> csrfAcknowledgedMethodNames = getActionMethodNamesFromCsrfFile();
		methodNames.removeAll(csrfAcknowledgedMethodNames);
		assertEquals(
				"The method you've just added requires you to go into the csrf.properties file and read/follow "
						+ "the instructions in the comment header.  Method: "
						+ methodNames, 0, methodNames.size());
	}

	@Test
	public void listMethodNamesinCsrfPropertiesNotMappingToActions()
			throws Exception {
		Set<String> methodNames = getAllUniqueActionMethodNames();
		Set<String> csrfAcknowledgedMethodNames = getActionMethodNamesFromCsrfFile();
		csrfAcknowledgedMethodNames.removeAll(methodNames);
		assertEquals(
				"csrf.properties refers to the following method(s) that don't exist.  Time to clean up CSRF file?"
						+ "  Method(s): " + csrfAcknowledgedMethodNames, 0,
				csrfAcknowledgedMethodNames.size());
	}

	@Test
	public void csrfPropertyValuesValid() throws Exception {
		Properties props = getCsrfProperties();
		for (Object obj : props.keySet()) {
			String key = obj.toString().trim();
			String value = props.getProperty(key);
			assertTrue(value
					+ " is not recognized in csrf.properties for key: " + key
					+ ".  Please check for typos.", value.equals("AddToken")
					|| value.equals("NoCsrfWorriesHere"));
		}
	}

	@Test
	public void checkNoDuplicatesinCsrfFile() throws Exception {
		Properties props = getCsrfProperties();
		List<String> fullListOfKeys = getListOfKeysIncludingDuplicates();
		for (Object key : props.keySet()) {
			fullListOfKeys.remove(key);
		}
		for (String name: fullListOfKeys) {
			LOGGER.info(name);
		}
		assertTrue(
				"You've accidentally added a duplicate key in csrf.properties.  Please delete the extra lines of: "
						+ fullListOfKeys, fullListOfKeys.isEmpty());
	}

	private List<String> getListOfKeysIncludingDuplicates() {
		List<String> fullListOfKeys = new ArrayList<String>();
		Scanner scanner = null;
		try {
			//scanner = new Scanner(CsrfTest.class.getResourceAsStream(CSRF_PROPERTIES));
			scanner = new Scanner(new FileInputStream(CSRF_PROPERTIES));
			while (scanner.hasNextLine()) {
				String line = scanner.nextLine();
				if (!line.trim().equals("") && !line.startsWith("#")) {
					fullListOfKeys.add(line.split("=")[0]);
				}
			}
		} catch (FileNotFoundException e) {
			e.printStackTrace();
		} finally {
			if (scanner != null) {
				scanner.close();
			}
		}
		return fullListOfKeys;
	}

	/**
	 * Uses reflection rather than the names in modulesMapping because some of
	 * the AJAX ones aren't in there. Most notably the admin delete forum
	 * action. The most destructive operation a CSRF could target wouldn't have
	 * been caught with the alternate approach. Plus, these methods could be
	 * invoked even without being in the modulesMapping via URL crafting.
	 * 
	 * @throws Exception
	 */
	private Set<String> getAllUniqueActionMethodNames() throws Exception {
		Set<String> methodNames = new HashSet<String>();
		String sourceDirectory = JFORUM_DIRECTORY + "/src/main/java/";
		for (String packageName : packagesWithActions) {
			String packageDirectory = sourceDirectory
					+ packageName.replaceAll("\\.", "/");
			File[] directoryContents = new File(packageDirectory)
					.listFiles(new FilenameFilter() {
						public boolean accept(File dir, String name) {
							return name.endsWith(".java");
						}
					});
			for (File file : directoryContents) {
				methodNames.addAll(getPublicMethodNamesIn(packageName,
						file.getName()));
			}
		}
		return methodNames;
	}

	private Collection<String> getPublicMethodNamesIn(String packageName,
			String className) throws Exception {
		Set<String> result = new HashSet<String>();
		String fullyQualifiedClassName = packageName + "."
				+ className.replaceFirst(".java", "");
		Class<?> clazz = Class.forName(fullyQualifiedClassName);
		Method[] methods = clazz.getDeclaredMethods();
		for (Method method : methods) {
			// if isn't public, has return value or has parameters, it is a
			// helper method
			if (Modifier.isPublic(method.getModifiers())
					&& method.getReturnType().equals(Void.TYPE)
					&& method.getParameterTypes().length == 0) {
				result.add(method.getName());
			}
		}
		return result;
	}

	private Set<String> getActionMethodNamesFromCsrfFile() throws Exception {
		Set<String> result = new HashSet<String>();
		Properties props = getCsrfProperties();
		for (Object key : props.keySet()) {
			result.add(key.toString());
		}
		return result;
	}

	private Properties getCsrfProperties() throws IOException,
			FileNotFoundException {
		Properties props = new Properties();
		//props.load(CsrfTest.class.getResourceAsStream(CSRF_PROPERTIES));
		props.load(new FileInputStream(CSRF_PROPERTIES));
		return props;
	}
}