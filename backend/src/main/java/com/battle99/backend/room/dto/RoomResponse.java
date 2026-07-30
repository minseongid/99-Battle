package com.battle99.backend.room.dto;

import com.battle99.backend.room.RoomStatus;

import java.util.List;

public record RoomResponse(
        String roomId,
        String roomName,
        int maxPlayers,
        int mathEventCount,
        RoomStatus status,
        List<PlayerDto> players
) {
}
