package com.battle99.backend.game.dto;

public record PlayerRankingDto(
        String playerId,
        String nickname,
        int colorIndex,
        int totalScore,
        int rank,
        boolean forfeited
) {
}
