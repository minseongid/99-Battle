package com.battle99.backend.room;

import java.util.LinkedHashMap;
import java.util.Map;

public class Room {

    private final String roomId;
    private String roomName;
    private int maxPlayers;
    private int mathEventCount;
    private final Map<String, Player> players = new LinkedHashMap<>();
    private RoomStatus status = RoomStatus.WAITING;
    private String hostPlayerId;

    public Room(String roomId, String roomName, int maxPlayers, int mathEventCount, String hostPlayerId) {
        this.roomId = roomId;
        this.roomName = roomName;
        this.maxPlayers = maxPlayers;
        this.mathEventCount = mathEventCount;
        this.hostPlayerId = hostPlayerId;
    }

    public String getRoomId() {
        return roomId;
    }

    public String getRoomName() {
        return roomName;
    }

    public int getMaxPlayers() {
        return maxPlayers;
    }

    public void setMaxPlayers(int maxPlayers) {
        this.maxPlayers = maxPlayers;
    }

    public int getMathEventCount() {
        return mathEventCount;
    }

    public void setMathEventCount(int mathEventCount) {
        this.mathEventCount = mathEventCount;
    }

    public Map<String, Player> getPlayers() {
        return players;
    }

    public RoomStatus getStatus() {
        return status;
    }

    public void setStatus(RoomStatus status) {
        this.status = status;
    }

    public String getHostPlayerId() {
        return hostPlayerId;
    }

    public void setHostPlayerId(String hostPlayerId) {
        this.hostPlayerId = hostPlayerId;
    }

    public boolean isFull() {
        return players.size() >= maxPlayers;
    }

    public boolean isAllNonHostReady() {
        if (players.size() < 2) {
            return false;
        }
        return players.values().stream()
                .filter(p -> !p.getPlayerId().equals(hostPlayerId))
                .allMatch(Player::isReady);
    }

    public boolean isSolo() {
        return players.size() == 1;
    }

    public boolean canStart() {
        return isSolo() || isAllNonHostReady();
    }
}
