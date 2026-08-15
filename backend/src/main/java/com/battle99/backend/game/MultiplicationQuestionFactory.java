package com.battle99.backend.game;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.Set;

public final class MultiplicationQuestionFactory {

    private MultiplicationQuestionFactory() {
    }

    public static List<GeneratedQuestion> generateUnique(
            int firstMin, int firstMax, int secondMin, int secondMax,
            int count, Random random, Set<String> usedKeys
    ) {
        List<GeneratedQuestion> result = new ArrayList<>(count);
        int guardAttempts = 0;
        while (result.size() < count && guardAttempts < count * 200 + 200) {
            guardAttempts++;
            int a = firstMin + random.nextInt(firstMax - firstMin + 1);
            int b = secondMin + random.nextInt(secondMax - secondMin + 1);
            String key = a + "x" + b;
            if (!usedKeys.add(key)) {
                continue;
            }
            result.add(new GeneratedQuestion(a + " × " + b, AnswerType.NUMBER, String.valueOf(a * b)));
        }
        return result;
    }
}
