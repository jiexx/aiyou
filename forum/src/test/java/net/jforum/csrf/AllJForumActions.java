package net.jforum.csrf;

import java.io.File;
import java.io.FileInputStream;
import java.io.FilenameFilter;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.util.Collection;
import java.util.HashSet;
import java.util.Properties;
import java.util.Set;

/**
 * Lists out unique action method names in JForum.
 * 
 * @author Jeanne Boyarsky, Andowson Chang
 * @version $Id: $
 */
public class AllJForumActions {	
	private static final String ROOT_DIR = AllJForumActions.class.getResource("/").getPath();	
	private static final String JFORUM_DIRECTORY = ROOT_DIR.substring(0, ROOT_DIR.length() - "/target/test-classes/".length());	
	private Set<String> packagesWithActions;

	public static void main(String[] args) throws Exception {
		AllJForumActions test = new AllJForumActions();
		test.findAllPackagesWithActions();
		Set<String> methodNames = test.getAllUniqueActionMethodNames();
		System.out.println("# unique method names: " + methodNames.size());
		//System.out.println(methodNames);
		for (String methodName: methodNames) {
			System.out.println(methodName);
		}		
	}

	/**
	 * Could have just hard coded the action directories. Wrote a method because
	 * wanted to turn this into a unit test later and then automation is useful.
	 * 
	 * @throws Exception
	 */
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

}