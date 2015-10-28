package com.jiexx.aiyou.controller;

import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.util.List;

import javax.xml.bind.DatatypeConverter;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.jiexx.aiyou.Application;
import com.jiexx.aiyou.model.Driver;
import com.jiexx.aiyou.model.Image;
import com.jiexx.aiyou.resp.ImageList;
import com.jiexx.aiyou.resp.Response;
import com.jiexx.aiyou.service.DataService;

@Controller
@RequestMapping("/image")
public class Setting extends DataService {

	@RequestMapping(value = "upload", method = RequestMethod.GET)
	public @ResponseBody String provideUploadInfo() {
		return "You can upload a file by posting to this same URL.";
	}

	public static class FileUpload {
		public long id;
		public String n;
		public String a;  //img data
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
	public String httpHeader(int index, String type) {
		return "http://"+Application.host+":"+Application.port+"/"+index+"."+type;
	}
	
	public String header(int index, String type) {
		return "src/main/resources/public/"+index+"."+type;
	}

	@RequestMapping(value = "upload", method = RequestMethod.POST)
	public @ResponseBody String handleFileUpload(@RequestBody FileUpload fu) {
		Response resp = new Response();
		
		if (fu.a != null) {
			List<Image> imgs = DATA.queryImage(fu.id);
			
			Image img = new Image();
			img.id = fu.id;
			img.img = httpHeader(imgs.size(), fu.t);
			img.intro = fu.desc;
			if(imgs.size() < 3) {
				if(GenerateImage(fu.a, header(imgs.size(), fu.t) )) {
					if (DATA.uploadImage(img) != null) {
						resp.code = ""+img.id;
						resp.success();
					}
				}
			}
		}
		return resp.toJson();
	}
	
	@RequestMapping(value = "del", method = RequestMethod.GET)
	public @ResponseBody String remove(@RequestParam(value = "id") long id) {
		Response resp = new Response();
		if(DATA.delImage(id) != 0) {
			resp.success();
		}
		return resp.toJson();
	}
	
	@RequestMapping(value = "qry", method = RequestMethod.GET)
	public @ResponseBody String query(@RequestParam(value = "uid") long uid) {
		Driver d = DATA.queryDriverById(uid);
		if(d != null) {
			ImageList resp = new ImageList( DATA.queryImage(uid), d.car, d.balance );
			resp.success();
			return resp.toJson();
		};
		return (new Response()).toJson();
	}

}