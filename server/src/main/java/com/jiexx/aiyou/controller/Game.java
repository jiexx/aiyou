package com.jiexx.aiyou.controller;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;

import com.jiexx.aiyou.message.Message;
import com.jiexx.aiyou.service.GameService;

@Controller
public class Game {

	
    @MessageMapping("/server")
    //@SendTo("/recv/userid")
    public void start(Message message) {
        System.out.println(message.uid);
        
        GameService.instance.receive(message);
        //sendor.convertAndSend("/recv/start", "test");
    }
}
