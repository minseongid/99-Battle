package com.battle99.backend.room;

import com.battle99.backend.room.dto.CreateRoomRequest;
import com.battle99.backend.room.dto.JoinRoomRequest;
import com.battle99.backend.room.dto.NicknameAvailabilityResponse;
import com.battle99.backend.room.dto.PublicRoomSummary;
import com.battle99.backend.room.dto.RoomResponse;
import com.battle99.backend.room.dto.UpdateSettingsRequest;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/rooms")
public class RoomController {

    private static final Set<Integer> VALID_MATH_EVENT_COUNTS = Set.of(2, 4, 6, 8);
    private static final int ROOM_NAME_MAX_LENGTH = 20;

    private final RoomService roomService;

    public RoomController(RoomService roomService) {
        this.roomService = roomService;
    }

    @PostMapping
    public RoomResponse createRoom(@RequestBody CreateRoomRequest request) {
        requireNonBlank(request.hostPlayerId(), "hostPlayerId");
        requireNonBlank(request.hostNickname(), "hostNickname");
        if (request.roomName() != null && request.roomName().length() > ROOM_NAME_MAX_LENGTH) {
            throw new IllegalArgumentException("방 이름은 최대 " + ROOM_NAME_MAX_LENGTH + "자입니다.");
        }
        if (request.maxPlayers() < 2 || request.maxPlayers() > 6) {
            throw new IllegalArgumentException("최대 인원은 2~6명이어야 합니다.");
        }
        if (!VALID_MATH_EVENT_COUNTS.contains(request.mathEventCount())) {
            throw new IllegalArgumentException("Math Event 개수는 2, 4, 6, 8 중 하나여야 합니다.");
        }
        return roomService.createRoom(request);
    }

    @PostMapping("/quick-match")
    public RoomResponse quickMatch(@RequestBody JoinRoomRequest request) {
        requireNonBlank(request.playerId(), "playerId");
        requireNonBlank(request.nickname(), "nickname");
        return roomService.quickMatch(request);
    }

    @GetMapping("/nickname-availability")
    public NicknameAvailabilityResponse checkNickname(@RequestParam String nickname) {
        requireNonBlank(nickname, "nickname");
        return new NicknameAvailabilityResponse(!roomService.isNicknameTaken(nickname));
    }

    @GetMapping("/public")
    public List<PublicRoomSummary> listPublicRooms() {
        return roomService.listPublicRooms();
    }

    @GetMapping("/{roomId}")
    public RoomResponse getRoom(@PathVariable String roomId) {
        return roomService.getRoom(roomId);
    }

    @PostMapping("/{roomId}/join")
    public RoomResponse joinRoom(@PathVariable String roomId, @RequestBody JoinRoomRequest request) {
        requireNonBlank(request.playerId(), "playerId");
        requireNonBlank(request.nickname(), "nickname");
        return roomService.joinRoom(roomId, request);
    }

    @PatchMapping("/{roomId}/settings")
    public RoomResponse updateSettings(@PathVariable String roomId, @RequestBody UpdateSettingsRequest request) {
        requireNonBlank(request.playerId(), "playerId");
        if (request.maxPlayers() < 2 || request.maxPlayers() > 6) {
            throw new IllegalArgumentException("최대 인원은 2~6명이어야 합니다.");
        }
        if (!VALID_MATH_EVENT_COUNTS.contains(request.mathEventCount())) {
            throw new IllegalArgumentException("Math Event 개수는 2, 4, 6, 8 중 하나여야 합니다.");
        }
        return roomService.updateSettings(roomId, request.playerId(), request.maxPlayers(), request.mathEventCount());
    }

    @DeleteMapping("/{roomId}/players/{playerId}")
    public void leaveRoom(@PathVariable String roomId, @PathVariable String playerId) {
        roomService.leaveRoom(roomId, playerId);
    }

    private void requireNonBlank(String value, String fieldName) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(fieldName + "은(는) 필수입니다.");
        }
    }
}
