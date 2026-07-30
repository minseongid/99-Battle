package com.battle99.backend.room;

import java.time.Instant;

public class Player {

    private final String playerId;
    private final String nickname;
    private boolean ready;
    private volatile Instant lastSeenAt;

    public Player(String playerId, String nickname) {
        this.playerId = playerId;
        this.nickname = nickname;
        this.ready = false;
        this.lastSeenAt = Instant.now();
    }

    public String getPlayerId() {
        return playerId;
    }

    public String getNickname() {
        return nickname;
    }

    public boolean isReady() {
        return ready;
    }

    public void setReady(boolean ready) {
        this.ready = ready;
    }

    public Instant getLastSeenAt() {
        return lastSeenAt;
    }

    public void touch() {
        this.lastSeenAt = Instant.now();
    }
}
