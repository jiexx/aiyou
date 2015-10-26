package com.jiexx.aiyou.controller;

import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileOutputStream;

import javax.xml.bind.DatatypeConverter;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import com.jiexx.aiyou.resp.Response;
import com.jiexx.aiyou.service.DataService;

@Controller
@RequestMapping("/")
public class FileUploader extends DataService {

	@RequestMapping(value = "upload", method = RequestMethod.GET)
	public @ResponseBody String provideUploadInfo() {
		return "You can upload a file by posting to this same URL.";
	}

	public static class FileUpload {
		public long id;
		public String n;
		public String a;
		public String desc;
		public String t;
	}

	public static boolean GenerateImage(String imgStr, String imgFilePath) {
		if (imgStr == null)
			return false;
		try {
			byte[] bytes = DatatypeConverter.parseBase64Binary(imgStr.substring(imgStr.indexOf(',')));
			BufferedOutputStream out = new BufferedOutputStream(new FileOutputStream(imgFilePath));
			out.write(bytes);
			out.flush();
			out.close();
			return true;
		} catch (Exception e) {
			return false;
		}
	}

	@RequestMapping(value = "upload", method = RequestMethod.POST)
	public @ResponseBody String handleFileUpload(@RequestBody FileUpload fu) {
		Response resp = new Response();

		if (fu.a != null) {
			if(GenerateImage(fu.a, fu.n+"."+fu.t)) {
				String imgs = DATA.queryImage(fu.id);
				if (imgs != null && imgs.split("|").length < 5) {
					if (DATA.uploadImage(fu.id, fu.n) != null) {
						resp.success();
					}
				}
			}
		}
		return resp.toJson();
	}

}