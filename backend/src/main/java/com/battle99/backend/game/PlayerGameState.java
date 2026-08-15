package com.battle99.backend.game;

public class PlayerGameState {

    private final String playerId;
    private final String nickname;
    private final int colorIndex;
    private int score = 0;
    private long cumulativeResponseTimeMs = 0;
    private boolean forfeited = false;

    private String currentSubmission;
    private Long currentSubmitAtMs;

    public PlayerGameState(String playerId, String nickname, int colorIndex) {
        this.playerId = playerId;
        this.nickname = nickname;
        this.colorIndex = colorIndex;
    }

    public String getPlayerId() {
        return playerId;
    }

    public String getNickname() {
        return nickname;
    }

    public int getColorIndex() {
        return colorIndex;
    }

    public int getScore() {
        return score;
    }

    public void applyScoreDelta(int delta) {
        this.score = Math.max(0, this.score + delta);
    }

    public long getCumulativeResponseTimeMs() {
        return cumulativeResponseTimeMs;
    }

    public void addResponseTime(long ms) {
        this.cumulativeResponseTimeMs += ms;
    }

    public boolean isForfeited() {
        return forfeited;
    }

    public void setForfeited(boolean forfeited) {
        this.forfeited = forfeited;
    }

    public String getCurrentSubmission() {
        return currentSubmission;
    }

    public Long getCurrentSubmitAtMs() {
        return currentSubmitAtMs;
    }

    public void submit(String answer, long atMs) {
        this.currentSubmission = answer;
        this.currentSubmitAtMs = atMs;
    }

    public void resetSubmission() {
        this.currentSubmission = null;
        this.currentSubmitAtMs = null;
    }
}
