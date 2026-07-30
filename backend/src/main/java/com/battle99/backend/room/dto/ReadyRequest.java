package com.battle99.backend.room.dto;

public record ReadyRequest(
        String playerId,
        boolean ready
) {
}
