package com.battle99.backend.room.exception;

public class RoomNotFoundException extends RuntimeException {
    public RoomNotFoundException(String roomId) {
        super("방을 찾을 수 없습니다: " + roomId);
    }
}
