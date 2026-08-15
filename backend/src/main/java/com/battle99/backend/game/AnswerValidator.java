package com.battle99.backend.game;

public final class AnswerValidator {

    private static final double EPSILON = 1e-6;

    private AnswerValidator() {
    }

    public static boolean isCorrect(AnswerType type, String canonicalAnswer, String submitted) {
        if (submitted == null || submitted.isBlank()) {
            return false;
        }
        return switch (type) {
            case NUMBER -> isNumberCorrect(canonicalAnswer, submitted);
            case FRACTION -> isFractionCorrect(canonicalAnswer, submitted);
            case TRIG -> isTrigCorrect(canonicalAnswer, submitted);
        };
    }

    private static boolean isNumberCorrect(String canonicalAnswer, String submitted) {
        try {
            return Long.parseLong(canonicalAnswer.trim()) == Long.parseLong(submitted.trim());
        } catch (NumberFormatException e) {
            return false;
        }
    }

    private static boolean isFractionCorrect(String canonicalAnswer, String submitted) {
        Fraction correct = Fraction.parseRaw(canonicalAnswer);
        Fraction given = Fraction.parseRaw(submitted);
        if (correct == null || given == null) {
            return false;
        }
        if (!given.isInLowestTerms()) {
            return false;
        }
        return correct.numerator() == given.numerator() && correct.denominator() == given.denominator();
    }

    private static boolean isTrigCorrect(String canonicalAnswer, String submitted) {
        Double correct = parseTrigValue(canonicalAnswer);
        Double given = parseTrigValue(submitted);
        if (correct == null || given == null) {
            return false;
        }
        return Math.abs(correct - given) < EPSILON;
    }

    /**
     * Parses strings like "-√3/2", "1/2", "√3", "0" produced by the Trigonometry keypad
     * (digits, '/', '√', optional leading '-') into a double, so that mathematically
     * equivalent forms (e.g. √2/2 and 1/√2) compare equal per the design doc's rule.
     */
    static Double parseTrigValue(String raw) {
        if (raw == null) return null;
        String s = raw.trim();
        if (s.isEmpty()) return null;
        boolean negative = s.startsWith("-");
        if (negative) {
            s = s.substring(1);
        }
        if (s.isEmpty()) return null;
        int slash = s.indexOf('/');
        try {
            double value;
            if (slash < 0) {
                value = parseTerm(s);
            } else {
                double num = parseTerm(s.substring(0, slash));
                double den = parseTerm(s.substring(slash + 1));
                if (den == 0) return null;
                value = num / den;
            }
            return negative ? -value : value;
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private static double parseTerm(String term) {
        if (term.isEmpty()) throw new NumberFormatException("empty term");
        if (term.startsWith("√")) {
            return Math.sqrt(Double.parseDouble(term.substring(1)));
        }
        return Double.parseDouble(term);
    }
}
