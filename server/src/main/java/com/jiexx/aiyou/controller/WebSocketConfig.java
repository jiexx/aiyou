package com.jiexx.aiyou.controller;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptorAdapter;
import org.springframework.web.socket.config.annotation.AbstractWebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.server.standard.TomcatRequestUpgradeStrategy;
import org.springframework.web.socket.server.support.DefaultHandshakeHandler;

import com.jiexx.aiyou.service.GameService;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig extends AbstractWebSocketMessageBrokerConfigurer {
	public final static String broker = "/hook";
	public final static String prefix = "/go";
	public final static String endpoint = "/game";

	@Override
	public void configureMessageBroker(MessageBrokerRegistry config) {
		config.enableSimpleBroker(broker);
		config.setApplicationDestinationPrefixes(prefix);
	}

	// @Override
	public void registerStompEndpoints(StompEndpointRegistry registry) {
		registry.addEndpoint(endpoint)
				.setHandshakeHandler(new DefaultHandshakeHandler(new TomcatRequestUpgradeStrategy()))
				.setAllowedOrigins("*").withSockJS();
	}

	@Bean
	public PresenceChannelInterceptor presenceChannelInterceptor() {
		return new PresenceChannelInterceptor();
	}

	@Override
	public void configureClientInboundChannel(ChannelRegistration registration) {
		registration.setInterceptors(presenceChannelInterceptor());
	}

	@Override
	public void configureClientOutboundChannel(ChannelRegistration registration) {
		registration.taskExecutor().corePoolSize(8);
		registration.setInterceptors(presenceChannelInterceptor());
	}

	public class PresenceChannelInterceptor extends ChannelInterceptorAdapter {

		@Override
		public void postSend(Message<?> message, MessageChannel channel, boolean sent) {

			StompHeaderAccessor sha = StompHeaderAccessor.wrap(message);

			// ignore non-STOMP messages like heartbeat messages
			if (sha.getCommand() == null) {
				return;
			}

			String sessionId = sha.getSessionId();

			switch (sha.getCommand()) {
			case CONNECT:
				System.out.println("STOMP Connect [sessionId: " + sessionId + "]");
				break;
			case CONNECTED:
				System.out.println("STOMP Connected [sessionId: " + sessionId + "]");
				break;
			case DISCONNECT:
				System.out.println("STOMP Disconnect [sessionId: " + sessionId + "]");
				GameService.instance.exitSession(sessionId);
				break;
			default:
				break;

			}
		}
	}

}
