package com.battle99.backend.game;

import com.battle99.backend.game.dto.GameMessage;
import com.battle99.backend.game.dto.PlayerRankingDto;
import com.battle99.backend.game.dto.PlayerResultDto;
import com.battle99.backend.room.Player;
import com.battle99.backend.room.Room;
import com.battle99.backend.room.RoomService;
import com.battle99.backend.room.RoomStatus;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;

@Service
public class GameEngineService {

    // TEMP TESTING FLAG — revert to false before resuming real gameplay-screen work.
    // Shrinks every stage/event down to 1 short question so a full match takes
    // ~10-15s instead of minutes, for fast repeated testing of the result screen,
    // rematch flow, etc. Does not change scoring or any other rule.
    private static final boolean FAST_TEST_MODE = true;

    private static final long COUNTDOWN_MS = 2000;
    private static final long EVENT_INTRO_MS = 1000;
    private static final long RESULT_DISPLAY_MS = 500;
    private static final int STAGE_QUESTIONS = FAST_TEST_MODE ? 1 : 5;
    private static final int EVENT_QUESTIONS = FAST_TEST_MODE ? 1 : 5;
    private static final int EVENT_TIME_LIMIT_SECONDS = FAST_TEST_MODE ? 1 : 5;
    private static final int WRONG_ANSWER_PENALTY = -30;

    private static final Map<MathCategory, String> CATEGORY_LABEL = Map.of(
            MathCategory.TRIGONOMETRY, "삼각함수",
            MathCategory.SEQUENCE, "수열",
            MathCategory.PROBABILITY, "확률",
            MathCategory.POWERS, "거듭제곱",
            MathCategory.ROOTS, "제곱근",
            MathCategory.FRACTION, "분수",
            MathCategory.EQUATION, "방정식",
            MathCategory.DIVISOR, "약수",
            MathCategory.MULTIPLE, "배수"
    );

    private static final Map<MathCategory, String> CATEGORY_DESCRIPTION = Map.of(
            MathCategory.TRIGONOMETRY, "기본 삼각함수 값을 맞혀보세요.",
            MathCategory.SEQUENCE, "규칙을 찾아 빈칸을 채워보세요.",
            MathCategory.PROBABILITY, "확률을 계산해보세요.",
            MathCategory.POWERS, "거듭제곱 값을 계산해보세요.",
            MathCategory.ROOTS, "루트 값을 계산해보세요.",
            MathCategory.FRACTION, "분수 계산을 해결해보세요.",
            MathCategory.EQUATION, "x의 값을 구해보세요.",
            MathCategory.DIVISOR, "약수를 계산해보세요.",
            MathCategory.MULTIPLE, "배수를 계산해보세요."
    );

    private final Map<String, GameSession> sessions = new ConcurrentHashMap<>();
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(2);
    private final RoomService roomService;
    private final SimpMessagingTemplate messagingTemplate;

    public GameEngineService(RoomService roomService, SimpMessagingTemplate messagingTemplate) {
        this.roomService = roomService;
        this.messagingTemplate = messagingTemplate;
    }

    public void scheduleGameStart(Room room) {
        String roomId = room.getRoomId();
        scheduler.schedule(() -> beginGame(roomId), COUNTDOWN_MS, TimeUnit.MILLISECONDS);
    }

    private void beginGame(String roomId) {
        Room room = roomService.getRoomEntity(roomId);
        if (room == null) return;
        synchronized (room) {
            if (room.getStatus() != RoomStatus.COUNTDOWN) return;
            room.setStatus(RoomStatus.IN_PROGRESS);
        }
        roomService.broadcastRoomUpdate(room);
        GameSession session = buildSession(room);
        sessions.put(roomId, session);
        advance(session);
    }

    private GameSession buildSession(Room room) {
        Random random = new Random();
        int eventCount = room.getMathEventCount();
        int totalStages = eventCount + 1;
        List<GameSegment> segments = new ArrayList<>();
        Set<String> usedMultiplicationKeys = new HashSet<>();
        MathCategory prevEventCategory = null;

        for (int stageNum = 1; stageNum <= totalStages; stageNum++) {
            int timeLimit = stageTimeLimitSeconds(stageNum);
            int firstMin = stageNum <= 2 ? 2 : 10;
            int firstMax = stageNum <= 2 ? 9 : 19;
            List<GeneratedQuestion> questions = MultiplicationQuestionFactory.generateUnique(
                    firstMin, firstMax, 1, 9, STAGE_QUESTIONS, random, usedMultiplicationKeys);
            segments.add(new GameSegment(SegmentType.STAGE, stageNum, null, "Stage " + stageNum, null, timeLimit, questions));

            if (stageNum < totalStages) {
                MathCategory category = pickEventCategory(random, prevEventCategory);
                prevEventCategory = category;
                List<GeneratedQuestion> eventQuestions = new ArrayList<>();
                for (int i = 0; i < EVENT_QUESTIONS; i++) {
                    eventQuestions.add(MathEventQuestionFactory.generate(category, random));
                }
                segments.add(new GameSegment(SegmentType.EVENT, 0, category, CATEGORY_LABEL.get(category),
                        CATEGORY_DESCRIPTION.get(category), EVENT_TIME_LIMIT_SECONDS, eventQuestions));
            }
        }

        GameSession session = new GameSession(room.getRoomId(), segments);
        int colorIndex = 0;
        for (Player p : room.getPlayers().values()) {
            session.getPlayers().put(p.getPlayerId(), new PlayerGameState(p.getPlayerId(), p.getNickname(), colorIndex++));
        }
        return session;
    }

    private int stageTimeLimitSeconds(int stageNum) {
        if (FAST_TEST_MODE) return 1;
        if (stageNum == 1) return 5;
        if (stageNum == 2) return 3;
        if (stageNum == 3) return 5;
        return 3;
    }

    private MathCategory pickEventCategory(Random random, MathCategory previous) {
        MathCategory[] values = MathCategory.values();
        MathCategory category;
        do {
            category = values[random.nextInt(values.length)];
        } while (category == previous && values.length > 1);
        return category;
    }

    private void advance(GameSession session) {
        synchronized (session) {
            List<GameSegment> segments = session.getSegments();
            GameSegment segmentBeforeCheck = segments.get(session.getSegmentIndex());
            if (session.getQuestionIndex() >= segmentBeforeCheck.questions().size()) {
                session.setSegmentIndex(session.getSegmentIndex() + 1);
                session.setQuestionIndex(0);
                if (session.getSegmentIndex() >= segments.size()) {
                    endGame(session);
                    return;
                }
                GameSegment newSegment = segments.get(session.getSegmentIndex());
                if (newSegment.type() == SegmentType.EVENT) {
                    broadcastEventIntro(session, newSegment);
                    scheduler.schedule(() -> advance(session), EVENT_INTRO_MS, TimeUnit.MILLISECONDS);
                    return;
                }
            }
            startQuestion(session);
        }
    }

    private void broadcastEventIntro(GameSession session, GameSegment segment) {
        session.setPhase(GamePhase.EVENT_INTRO);
        GameMessage msg = new GameMessage(GamePhase.EVENT_INTRO, session.getSegmentIndex(), session.getSegments().size(),
                segment.type(), segment.eventCategory(), segment.label(), segment.description(),
                null, null, null, null, null, null, null, null, null);
        session.setLastMessage(msg);
        broadcast(session.getRoomId(), msg);
    }

    private void startQuestion(GameSession session) {
        GameSegment segment = session.currentSegment();
        for (PlayerGameState p : session.getPlayers().values()) {
            p.resetSubmission();
        }
        session.setPhase(GamePhase.QUESTION);
        long now = System.currentTimeMillis();
        session.setQuestionStartAtMs(now);

        GeneratedQuestion q = segment.questions().get(session.getQuestionIndex());
        GameMessage msg = new GameMessage(GamePhase.QUESTION, session.getSegmentIndex(), session.getSegments().size(),
                segment.type(), segment.eventCategory(), segment.label(), segment.description(),
                session.getQuestionIndex(), segment.questions().size(), q.questionText(), q.answerType(),
                segment.timeLimitSeconds(), now, null, null, null);
        session.setLastMessage(msg);
        broadcast(session.getRoomId(), msg);

        int segIdx = session.getSegmentIndex();
        int qIdx = session.getQuestionIndex();
        ScheduledFuture<?> task = scheduler.schedule(() -> onTimeout(session, segIdx, qIdx),
                segment.timeLimitSeconds(), TimeUnit.SECONDS);
        session.setPendingTask(task);
    }

    private void onTimeout(GameSession session, int segIdx, int qIdx) {
        synchronized (session) {
            if (session.getSegmentIndex() == segIdx && session.getQuestionIndex() == qIdx
                    && session.getPhase() == GamePhase.QUESTION) {
                resolveQuestion(session);
            }
        }
    }

    public void submitAnswer(String roomId, String playerId, String answer) {
        GameSession session = sessions.get(roomId);
        if (session == null) return;
        synchronized (session) {
            if (session.getPhase() != GamePhase.QUESTION) return;
            PlayerGameState player = session.getPlayers().get(playerId);
            if (player == null || player.isForfeited() || player.getCurrentSubmission() != null) return;
            if (answer == null || answer.isBlank()) return;
            player.submit(answer, System.currentTimeMillis());
            if (session.allNonForfeitedSubmitted()) {
                session.cancelPendingTask();
                resolveQuestion(session);
            }
        }
    }

    private void resolveQuestion(GameSession session) {
        GameSegment segment = session.currentSegment();
        GeneratedQuestion question = session.currentQuestion();
        long timeLimitMs = segment.timeLimitSeconds() * 1000L;
        long questionStart = session.getQuestionStartAtMs();

        Map<String, Integer> deltas = new HashMap<>();
        Map<String, Boolean> corrects = new HashMap<>();

        for (PlayerGameState p : session.getPlayers().values()) {
            if (p.isForfeited()) continue;
            String submission = p.getCurrentSubmission();
            if (submission == null) {
                p.addResponseTime(timeLimitMs);
                deltas.put(p.getPlayerId(), 0);
                corrects.put(p.getPlayerId(), false);
            } else {
                long responseTime = Math.max(0, p.getCurrentSubmitAtMs() - questionStart);
                p.addResponseTime(responseTime);
                boolean correct = AnswerValidator.isCorrect(question.answerType(), question.canonicalAnswer(), submission);
                int delta;
                if (correct) {
                    long remaining = Math.max(0, timeLimitMs - responseTime);
                    delta = 100 + (int) Math.floor(remaining / (double) timeLimitMs * 50);
                } else {
                    delta = WRONG_ANSWER_PENALTY;
                }
                p.applyScoreDelta(delta);
                deltas.put(p.getPlayerId(), delta);
                corrects.put(p.getPlayerId(), correct);
            }
        }

        List<PlayerGameState> ranked = rankedPlayers(session);
        List<PlayerResultDto> results = new ArrayList<>();
        for (int i = 0; i < ranked.size(); i++) {
            PlayerGameState p = ranked.get(i);
            boolean timedOut = !p.isForfeited() && p.getCurrentSubmission() == null;
            results.add(new PlayerResultDto(
                    p.getPlayerId(), p.getNickname(), p.getColorIndex(),
                    p.getCurrentSubmission(),
                    corrects.getOrDefault(p.getPlayerId(), false),
                    timedOut,
                    p.isForfeited(),
                    deltas.getOrDefault(p.getPlayerId(), 0),
                    p.getScore(),
                    i + 1
            ));
        }

        session.setPhase(GamePhase.RESULT);
        GameMessage msg = new GameMessage(GamePhase.RESULT, session.getSegmentIndex(), session.getSegments().size(),
                segment.type(), segment.eventCategory(), segment.label(), segment.description(),
                session.getQuestionIndex(), segment.questions().size(), question.questionText(), question.answerType(),
                segment.timeLimitSeconds(), questionStart, question.canonicalAnswer(), results, null);
        session.setLastMessage(msg);
        broadcast(session.getRoomId(), msg);

        session.setQuestionIndex(session.getQuestionIndex() + 1);
        scheduler.schedule(() -> advance(session), RESULT_DISPLAY_MS, TimeUnit.MILLISECONDS);
    }

    private void endGame(GameSession session) {
        session.setPhase(GamePhase.GAME_END);
        List<PlayerGameState> ranked = rankedPlayers(session);
        List<PlayerRankingDto> finalRanking = new ArrayList<>();
        for (int i = 0; i < ranked.size(); i++) {
            PlayerGameState p = ranked.get(i);
            finalRanking.add(new PlayerRankingDto(p.getPlayerId(), p.getNickname(), p.getColorIndex(),
                    p.getScore(), i + 1, p.isForfeited()));
        }
        GameMessage msg = new GameMessage(GamePhase.GAME_END, null, null, null, null, null, null,
                null, null, null, null, null, null, null, null, finalRanking);
        session.setLastMessage(msg);
        broadcast(session.getRoomId(), msg);
        session.getRematchVotes().clear();
    }

    public void rematch(String roomId, String playerId, boolean wantRematch) {
        GameSession session = sessions.get(roomId);
        if (session == null) return;
        Room room = roomService.getRoomEntity(roomId);
        if (room == null) return;

        boolean shouldRestart;
        synchronized (session) {
            if (session.getPhase() != GamePhase.GAME_END) return;
            if (!session.getPlayers().containsKey(playerId)) return;
            session.getRematchVotes().put(playerId, wantRematch);
            Set<String> activeIds = new HashSet<>(room.getPlayers().keySet());
            shouldRestart = !activeIds.isEmpty() && session.allActive(activeIds);
        }

        if (shouldRestart) {
            // Rematch sends everyone back to the room to ready up again — it does not
            // auto-start a new game. The host still has to click Start once everyone
            // (else) is ready again, same as any other game start.
            synchronized (room) {
                if (room.getStatus() != RoomStatus.IN_PROGRESS) return;
                room.setStatus(RoomStatus.WAITING);
                for (Player p : room.getPlayers().values()) {
                    if (!p.getPlayerId().equals(room.getHostPlayerId())) {
                        p.setReady(false);
                    }
                }
            }
            sessions.remove(roomId);
            roomService.broadcastRoomUpdate(room);
        }
    }

    public void forfeit(String roomId, String playerId) {
        GameSession session = sessions.get(roomId);
        if (session == null) return;
        synchronized (session) {
            PlayerGameState player = session.getPlayers().get(playerId);
            if (player == null || player.isForfeited()) return;
            player.setForfeited(true);

            if (session.getPhase() == GamePhase.QUESTION && session.allNonForfeitedSubmitted()) {
                session.cancelPendingTask();
                resolveQuestion(session);
            }

            boolean allForfeited = session.getPlayers().values().stream().allMatch(PlayerGameState::isForfeited);
            if (allForfeited) {
                session.cancelPendingTask();
                sessions.remove(roomId);
            }
        }
    }

    public GameMessage getSnapshot(String roomId) {
        GameSession session = sessions.get(roomId);
        return session == null ? null : session.getLastMessage();
    }

    private List<PlayerGameState> rankedPlayers(GameSession session) {
        List<PlayerGameState> list = new ArrayList<>(session.getPlayers().values());
        list.sort((a, b) -> {
            if (a.isForfeited() != b.isForfeited()) return a.isForfeited() ? 1 : -1;
            if (a.getScore() != b.getScore()) return b.getScore() - a.getScore();
            return Long.compare(a.getCumulativeResponseTimeMs(), b.getCumulativeResponseTimeMs());
        });
        return list;
    }

    private void broadcast(String roomId, GameMessage message) {
        messagingTemplate.convertAndSend("/topic/room/" + roomId + "/game", message);
    }
}
