package com.battle99.backend.game;

/** Always-reduced fraction with a positive denominator; denominator is 1 for whole numbers. */
public record Fraction(int numerator, int denominator) {

    public static Fraction of(int numerator, int denominator) {
        if (denominator == 0) {
            throw new IllegalArgumentException("denominator cannot be 0");
        }
        if (numerator == 0) {
            return new Fraction(0, 1);
        }
        int sign = denominator < 0 ? -1 : 1;
        int n = numerator * sign;
        int d = denominator * sign;
        int g = gcd(Math.abs(n), d);
        return new Fraction(n / g, d / g);
    }

    public Fraction plus(Fraction other) {
        return of(this.numerator * other.denominator + other.numerator * this.denominator,
                this.denominator * other.denominator);
    }

    public Fraction minus(Fraction other) {
        return of(this.numerator * other.denominator - other.numerator * this.denominator,
                this.denominator * other.denominator);
    }

    public Fraction times(Fraction other) {
        return of(this.numerator * other.numerator, this.denominator * other.denominator);
    }

    public Fraction dividedBy(Fraction other) {
        return of(this.numerator * other.denominator, this.denominator * other.numerator);
    }

    public boolean isLessThan(Fraction other) {
        return (long) this.numerator * other.denominator < (long) other.numerator * this.denominator;
    }

    public String toCanonicalString() {
        return denominator == 1 ? String.valueOf(numerator) : numerator + "/" + denominator;
    }

    /** Parses a raw "n" or "n/d" string as typed (NOT reduced) for answer validation. Returns null if malformed. */
    public static Fraction parseRaw(String raw) {
        if (raw == null) return null;
        String s = raw.trim();
        if (s.isEmpty()) return null;
        try {
            int slash = s.indexOf('/');
            if (slash < 0) {
                return new Fraction(Integer.parseInt(s), 1);
            }
            int n = Integer.parseInt(s.substring(0, slash));
            int d = Integer.parseInt(s.substring(slash + 1));
            if (d <= 0) return null;
            return new Fraction(n, d);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    public boolean isInLowestTerms() {
        if (numerator == 0) return denominator == 1;
        return gcd(Math.abs(numerator), denominator) == 1;
    }

    private static int gcd(int a, int b) {
        while (b != 0) {
            int t = b;
            b = a % b;
            a = t;
        }
        return a == 0 ? 1 : a;
    }
}
