package com.jiexx.aiyou.controller;

import java.util.HashMap;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Controller;

import com.jiexx.aiyou.message.Command;
import com.jiexx.aiyou.message.Message;
import com.jiexx.aiyou.service.GameService;

@Controller
public class Game {

	
    @MessageMapping(WebSocketConfig.endpoint)
    //@SendTo("/recv/userid")
    public void start(StompHeaderAccessor sha, Message message) {
        if( message.cmd == Command.OPEN.val() || message.cmd == Command.JOIN.val() ) {
        	GameService.instance.regSessionWithId(sha.getSessionId(), message.uid);
        }
        GameService.instance.receive(message);
        //sendor.convertAndSend("/recv/start", "test");
    }
}
