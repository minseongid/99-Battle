package com.battle99.backend.room.dto;

public record PublicRoomSummary(
        String roomId,
        String roomName,
        int currentPlayers,
        int maxPlayers,
        int mathEventCount
) {
}
