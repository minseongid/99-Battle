package com.battle99.backend.room.dto;

public record JoinRoomRequest(
        String playerId,
        String nickname
) {
}
