package com.battle99.backend.room.dto;

public record UpdateSettingsRequest(
        String playerId,
        int maxPlayers,
        int mathEventCount
) {
}
