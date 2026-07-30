package com.battle99.backend.room.dto;

public record CreateRoomRequest(
        String hostPlayerId,
        String hostNickname,
        String roomName,
        int maxPlayers,
        int mathEventCount
) {
}
