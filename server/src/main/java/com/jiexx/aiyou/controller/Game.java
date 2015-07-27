package com.jiexx.aiyou.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import com.jiexx.aiyou.message.Message;
import com.jiexx.aiyou.service.GameService;

@Controller
public class Game {

	
    @MessageMapping("/server")
    //@SendTo("/recv/userid")
    public void start(Message message) {
        System.out.println(message.uid);
        
        
        //sendor.convertAndSend("/recv/start", "test");
    }
}
