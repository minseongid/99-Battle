package com.battle99.backend.room.exception;

public class NotEligibleToStartException extends RuntimeException {
    public NotEligibleToStartException() {
        super("아직 게임을 시작할 수 없어요.");
    }
}
