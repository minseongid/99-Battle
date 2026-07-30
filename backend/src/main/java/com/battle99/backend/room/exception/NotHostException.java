package com.battle99.backend.room.exception;

public class NotHostException extends RuntimeException {
    public NotHostException() {
        super("방장만 할 수 있어요.");
    }
}
