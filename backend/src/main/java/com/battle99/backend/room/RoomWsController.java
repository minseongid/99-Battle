package com.battle99.backend.room;

import com.battle99.backend.room.dto.LeaveRequest;
import com.battle99.backend.room.dto.PresenceRequest;
import com.battle99.backend.room.dto.QuickMessageEvent;
import com.battle99.backend.room.dto.QuickMessageRequest;
import com.battle99.backend.room.dto.ReadyRequest;
import com.battle99.backend.room.dto.StartGameRequest;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.Set;

@Controller
public class RoomWsController {

    // Must stay in sync with QUICK_MESSAGES in frontend/src/pages/RoomPage.tsx —
    // a message that isn't an exact match here is silently dropped (see below).
    private static final Set<String> ALLOWED_QUICK_MESSAGES = Set.of(
            "반가워요~ 👋",
            "준비해줘! ⚡",
            "잘 부탁해요! 😊",
            "화이팅! 🔥",
            "굿굿! 👍",
            "아깝다! 😅",
            "고고! 🚀"
    );

    private final RoomService roomService;
    private final SimpMessagingTemplate messagingTemplate;

    public RoomWsController(RoomService roomService, SimpMessagingTemplate messagingTemplate) {
        this.roomService = roomService;
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/room/{roomId}/ready")
    public void setReady(@DestinationVariable String roomId, ReadyRequest request) {
        roomService.setReady(roomId, request.playerId(), request.ready());
    }

    @MessageMapping("/room/{roomId}/leave")
    public void leave(@DestinationVariable String roomId, LeaveRequest request) {
        roomService.leaveRoom(roomId, request.playerId());
    }

    @MessageMapping("/room/{roomId}/start")
    public void startGame(@DestinationVariable String roomId, StartGameRequest request) {
        roomService.startGame(roomId, request.playerId());
    }

    @MessageMapping("/room/{roomId}/presence")
    public void presence(
            @DestinationVariable String roomId,
            PresenceRequest request,
            @Header("simpSessionId") String sessionId
    ) {
        roomService.touchPresence(roomId, request.playerId(), sessionId);
    }

    @MessageMapping("/room/{roomId}/message")
    public void sendQuickMessage(@DestinationVariable String roomId, QuickMessageRequest request) {
        if (!ALLOWED_QUICK_MESSAGES.contains(request.message())) {
            return;
        }
        messagingTemplate.convertAndSend(
                "/topic/room/" + roomId + "/messages",
                new QuickMessageEvent(request.playerId(), request.nickname(), request.message())
        );
    }
}
