package com.battle99.backend.room.dto;

public record PlayerDto(
        String playerId,
        String nickname,
        boolean ready,
        boolean host
) {
}
