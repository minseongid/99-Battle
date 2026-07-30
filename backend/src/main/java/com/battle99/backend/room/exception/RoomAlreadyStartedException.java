package com.battle99.backend.room.exception;

public class RoomAlreadyStartedException extends RuntimeException {
    public RoomAlreadyStartedException() {
        super("이미 시작된 게임입니다.");
    }
}
