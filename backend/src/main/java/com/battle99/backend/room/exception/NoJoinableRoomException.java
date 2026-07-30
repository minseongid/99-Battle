package com.battle99.backend.room.exception;

public class NoJoinableRoomException extends RuntimeException {
    public NoJoinableRoomException() {
        super("참가 가능한 방이 없어요.");
    }
}
