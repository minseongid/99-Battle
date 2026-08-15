package com.battle99.backend.game;

import com.battle99.backend.game.dto.GameMessage;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ScheduledFuture;

public class GameSession {

    private final String roomId;
    private final List<GameSegment> segments;
    private final Map<String, PlayerGameState> players = new LinkedHashMap<>();
    private final Map<String, Boolean> rematchVotes = new LinkedHashMap<>();

    private int segmentIndex = 0;
    private int questionIndex = 0;
    private GamePhase phase = GamePhase.EVENT_INTRO;
    private long questionStartAtMs = 0;
    private ScheduledFuture<?> pendingTask;
    private volatile GameMessage lastMessage;

    public GameSession(String roomId, List<GameSegment> segments) {
        this.roomId = roomId;
        this.segments = segments;
    }

    public String getRoomId() {
        return roomId;
    }

    public List<GameSegment> getSegments() {
        return segments;
    }

    public Map<String, PlayerGameState> getPlayers() {
        return players;
    }

    public Map<String, Boolean> getRematchVotes() {
        return rematchVotes;
    }

    public int getSegmentIndex() {
        return segmentIndex;
    }

    public void setSegmentIndex(int segmentIndex) {
        this.segmentIndex = segmentIndex;
    }

    public int getQuestionIndex() {
        return questionIndex;
    }

    public void setQuestionIndex(int questionIndex) {
        this.questionIndex = questionIndex;
    }

    public GamePhase getPhase() {
        return phase;
    }

    public void setPhase(GamePhase phase) {
        this.phase = phase;
    }

    public long getQuestionStartAtMs() {
        return questionStartAtMs;
    }

    public void setQuestionStartAtMs(long questionStartAtMs) {
        this.questionStartAtMs = questionStartAtMs;
    }

    public GameSegment currentSegment() {
        return segments.get(segmentIndex);
    }

    public GeneratedQuestion currentQuestion() {
        return currentSegment().questions().get(questionIndex);
    }

    public void cancelPendingTask() {
        if (pendingTask != null) {
            pendingTask.cancel(false);
            pendingTask = null;
        }
    }

    public void setPendingTask(ScheduledFuture<?> pendingTask) {
        this.pendingTask = pendingTask;
    }

    public GameMessage getLastMessage() {
        return lastMessage;
    }

    public void setLastMessage(GameMessage lastMessage) {
        this.lastMessage = lastMessage;
    }

    public boolean allNonForfeitedSubmitted() {
        return players.values().stream()
                .filter(p -> !p.isForfeited())
                .allMatch(p -> p.getCurrentSubmission() != null);
    }

    public boolean allActive(java.util.Set<String> activePlayerIds) {
        return activePlayerIds.stream().allMatch(id -> {
            Boolean vote = rematchVotes.get(id);
            return Boolean.TRUE.equals(vote);
        });
    }
}
