package com.battle99.backend.game.dto;

public record RematchRequest(
        String playerId,
        boolean wantRematch
) {
}
