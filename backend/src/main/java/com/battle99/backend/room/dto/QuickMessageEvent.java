package com.battle99.backend.room.dto;

public record QuickMessageEvent(
        String playerId,
        String nickname,
        String message
) {
}
