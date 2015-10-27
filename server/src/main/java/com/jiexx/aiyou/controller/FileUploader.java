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

import com.jiexx.aiyou.Application;
import com.jiexx.aiyou.model.Driver;
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

	public boolean GenerateImage(String imgStr, String imgFilePath) {
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
	public String httpHeader() {
		return "http://"+Application.host+":"+Application.port+"/";
	}

	@RequestMapping(value = "upload", method = RequestMethod.POST)
	public @ResponseBody String handleFileUpload(@RequestBody FileUpload fu) {
		Response resp = new Response();
		
		int no = 0;
		if (fu.a != null) {
			Driver imgs = DATA.queryDriverById(fu.id);
			if(imgs != null) {
				if(imgs.img != null) {
					no = imgs.img.split("|").length;
					if(no < 5) {
						if(GenerateImage(fu.a, String.valueOf(no)+"."+fu.t)) {
							if (DATA.uploadImage(fu.id, httpHeader()+String.valueOf(no)+"."+fu.t) != null) {
								resp.success();
							}
						}
					}
				}else {
					if(GenerateImage(fu.a, "0."+fu.t)) {
						if (DATA.uploadImage(fu.id, httpHeader()+String.valueOf(no)+"."+fu.t) != null) {
							resp.success();
						}
					}
				}
			}
		}
		return resp.toJson();
	}

}