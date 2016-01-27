package net.jforum.repository;

import java.util.List;

import net.jforum.dao.DataAccessDriver;
import net.jforum.dao.SpamDAO;
import net.jforum.view.forum.common.Stats;

public class SpamRepository {

	private static List<String> cache;

	static {
		load();
	}

	public static void load() {
		try {
		    final SpamDAO spamDao = DataAccessDriver.getInstance().newSpamDAO();
            cache =  spamDao.selectAll();
		} catch (Exception e) {
			throw new RuntimeException("Error loading spam patterns: ", e);
		}
	}

	public static int size() {
		return (cache != null ? cache.size() : 0);
	}

	public static String findSpam (final String text) {
		if (text != null) {
			for (final String pattern : cache) {
				//LOGGER.info("checking text.size="+text.length()+" for "+pattern);
				if (text.matches("(?si).*" + pattern + ".*")) {
					// gather some stats about how pervasive spamming actually is
					Stats.record("Spam", pattern);
					return pattern;
				}
			}
		}

		return null;
	}
}

