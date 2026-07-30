package com.battle99.backend.room.exception;

public class RoomFullException extends RuntimeException {
    public RoomFullException() {
        super("방 인원이 가득 찼습니다.");
    }
}
