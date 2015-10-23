package com.jiexx.aiyou.controller;

import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileOutputStream;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;

import com.jiexx.aiyou.model.Const;
import com.jiexx.aiyou.resp.Response;
import com.jiexx.aiyou.service.DataService;

@Controller
@RequestMapping("/")
public class FileUploader extends DataService {

    @RequestMapping(value="/upload", method=RequestMethod.GET)
    public @ResponseBody String provideUploadInfo() {
        return "You can upload a file by posting to this same URL.";
    }

    @RequestMapping(value="/upload", method=RequestMethod.POST)
    public @ResponseBody String handleFileUpload(
    		@RequestParam("id") long id, @RequestParam("n") String name,
            @RequestParam("a") MultipartFile file, @RequestParam("desc") String desc){
    	Response resp = new Response();

        if (!file.isEmpty()) {
            try {
                byte[] bytes = file.getBytes();
                BufferedOutputStream stream =  new BufferedOutputStream(new FileOutputStream(new File(name)));
                stream.write(bytes);
                stream.close();
                if(DATA.queryImage(id).split("|").length < 5) {
                	if(DATA.uploadImage(id, name) != null) {
                		resp.success();
                	}
                }
                return resp.toJson();
            } catch (Exception e) {
            	return resp.toJson();
            }
        } else {
        	return resp.toJson();
        }
    }

}