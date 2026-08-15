package com.battle99.backend.game.dto;

public record AnswerSubmitRequest(
        String playerId,
        String answer
) {
}
