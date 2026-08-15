package com.battle99.backend.game;

import java.util.List;

public record GameSegment(
        SegmentType type,
        int stageNumber,
        MathCategory eventCategory,
        String label,
        String description,
        int timeLimitSeconds,
        List<GeneratedQuestion> questions
) {
}
