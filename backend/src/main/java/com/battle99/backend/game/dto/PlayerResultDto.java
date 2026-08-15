package com.battle99.backend.game.dto;

public record PlayerResultDto(
        String playerId,
        String nickname,
        int colorIndex,
        String submittedAnswer,
        boolean correct,
        boolean timedOut,
        boolean forfeited,
        int pointsDelta,
        int totalScore,
        int rank
) {
}
