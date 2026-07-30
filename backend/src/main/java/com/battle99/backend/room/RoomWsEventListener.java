package com.battle99.backend.room;

import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

@Component
public class RoomWsEventListener {

    private final RoomService roomService;

    public RoomWsEventListener(RoomService roomService) {
        this.roomService = roomService;
    }

    @EventListener
    public void handleDisconnect(SessionDisconnectEvent event) {
        roomService.handleSessionDisconnect(event.getSessionId());
    }
}
