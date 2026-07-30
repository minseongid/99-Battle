package com.battle99.backend.room.dto;

public record QuickMessageRequest(
        String playerId,
        String nickname,
        String message
) {
}
