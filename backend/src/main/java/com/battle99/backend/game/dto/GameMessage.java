package com.battle99.backend.game.dto;

import com.battle99.backend.game.AnswerType;
import com.battle99.backend.game.GamePhase;
import com.battle99.backend.game.MathCategory;
import com.battle99.backend.game.SegmentType;

import java.util.List;

public record GameMessage(
        GamePhase phase,

        // segment context (present for QUESTION / RESULT / EVENT_INTRO)
        Integer segmentIndex,
        Integer totalSegments,
        SegmentType segmentType,
        MathCategory eventCategory,
        String segmentLabel,
        String segmentDescription,

        // question context (present for QUESTION / RESULT)
        Integer questionIndex,
        Integer questionsInSegment,
        String questionText,
        AnswerType answerType,
        Integer timeLimitSeconds,
        Long questionStartAtEpochMs,

        // result context (present for RESULT)
        String correctAnswerDisplay,
        List<PlayerResultDto> results,

        // game end context (present for GAME_END)
        List<PlayerRankingDto> finalRanking
) {
}
