package com.battle99.backend.game;

import java.util.Map;
import java.util.Random;

/**
 * Generates Math Event questions per GAME_DESIGN.md section 5: Category -> (weighted) Template ->
 * Parameters -> Question/Answer. All values stay within mental-math range per the doc's Global
 * Generation Rules.
 */
public final class MathEventQuestionFactory {

    private MathEventQuestionFactory() {
    }

    private static final int[] ANGLES = {0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330, 360};
    private static final int[] ANGLES_NO_TAN_UNDEFINED = {0, 30, 45, 60, 120, 135, 150, 180, 210, 225, 240, 300, 315, 330, 360};

    private static final Map<Integer, String> SIN = Map.ofEntries(
            Map.entry(0, "0"), Map.entry(30, "1/2"), Map.entry(45, "√2/2"), Map.entry(60, "√3/2"),
            Map.entry(90, "1"), Map.entry(120, "√3/2"), Map.entry(135, "√2/2"), Map.entry(150, "1/2"),
            Map.entry(180, "0"), Map.entry(210, "-1/2"), Map.entry(225, "-√2/2"), Map.entry(240, "-√3/2"),
            Map.entry(270, "-1"), Map.entry(300, "-√3/2"), Map.entry(315, "-√2/2"), Map.entry(330, "-1/2"),
            Map.entry(360, "0")
    );

    private static final Map<Integer, String> COS = Map.ofEntries(
            Map.entry(0, "1"), Map.entry(30, "√3/2"), Map.entry(45, "√2/2"), Map.entry(60, "1/2"),
            Map.entry(90, "0"), Map.entry(120, "-1/2"), Map.entry(135, "-√2/2"), Map.entry(150, "-√3/2"),
            Map.entry(180, "-1"), Map.entry(210, "-√3/2"), Map.entry(225, "-√2/2"), Map.entry(240, "-1/2"),
            Map.entry(270, "0"), Map.entry(300, "1/2"), Map.entry(315, "√2/2"), Map.entry(330, "√3/2"),
            Map.entry(360, "1")
    );

    private static final Map<Integer, String> TAN = Map.ofEntries(
            Map.entry(0, "0"), Map.entry(30, "√3/3"), Map.entry(45, "1"), Map.entry(60, "√3"),
            Map.entry(120, "-√3"), Map.entry(135, "-1"), Map.entry(150, "-√3/3"), Map.entry(180, "0"),
            Map.entry(210, "√3/3"), Map.entry(225, "1"), Map.entry(240, "√3"), Map.entry(300, "-√3"),
            Map.entry(315, "-1"), Map.entry(330, "-√3/3"), Map.entry(360, "0")
    );

    private static final Map<String, String> SQUARE_OF = Map.ofEntries(
            Map.entry("0", "0"), Map.entry("1", "1"), Map.entry("-1", "1"),
            Map.entry("1/2", "1/4"), Map.entry("-1/2", "1/4"),
            Map.entry("√2/2", "1/2"), Map.entry("-√2/2", "1/2"),
            Map.entry("√3/2", "3/4"), Map.entry("-√3/2", "3/4"),
            Map.entry("√3", "3"), Map.entry("-√3", "3"),
            Map.entry("√3/3", "1/3"), Map.entry("-√3/3", "1/3")
    );

    private record TrigPair(String func1, int angle1, String func2, int angle2, String result) {
    }

    private static final TrigPair[] ADD_PAIRS = {
            new TrigPair("sin", 30, "cos", 60, "1"),
            new TrigPair("sin", 90, "cos", 180, "0"),
            new TrigPair("cos", 0, "sin", 270, "0"),
            new TrigPair("sin", 60, "cos", 150, "0"),
            new TrigPair("sin", 45, "cos", 135, "0"),
            new TrigPair("tan", 45, "tan", 180, "1"),
            new TrigPair("sin", 0, "cos", 90, "0"),
            new TrigPair("cos", 60, "cos", 300, "1"),
            new TrigPair("sin", 150, "sin", 30, "1"),
            new TrigPair("cos", 120, "cos", 240, "-1"),
    };

    private static final TrigPair[] SUB_PAIRS = {
            new TrigPair("cos", 60, "sin", 30, "0"),
            new TrigPair("sin", 90, "cos", 0, "0"),
            new TrigPair("sin", 30, "sin", 150, "0"),
            new TrigPair("cos", 30, "cos", 330, "0"),
            new TrigPair("sin", 60, "sin", 120, "0"),
            new TrigPair("tan", 45, "tan", 0, "1"),
            new TrigPair("tan", 180, "tan", 0, "0"),
            new TrigPair("cos", 60, "cos", 300, "0"),
            new TrigPair("tan", 135, "tan", 315, "0"),
            new TrigPair("tan", 0, "tan", 45, "-1"),
    };

    private record TrigMultiply(int multiplier, String func, int angle, String result) {
    }

    private static final TrigMultiply[] MULTIPLY_POOL = {
            new TrigMultiply(2, "sin", 30, "1"),
            new TrigMultiply(2, "cos", 60, "1"),
            new TrigMultiply(2, "sin", 150, "1"),
            new TrigMultiply(2, "cos", 300, "1"),
            new TrigMultiply(2, "sin", 210, "-1"),
            new TrigMultiply(2, "cos", 120, "-1"),
            new TrigMultiply(2, "sin", 60, "√3"),
            new TrigMultiply(2, "cos", 30, "√3"),
            new TrigMultiply(2, "sin", 120, "√3"),
            new TrigMultiply(2, "cos", 150, "-√3"),
            new TrigMultiply(2, "sin", 240, "-√3"),
            new TrigMultiply(2, "cos", 210, "-√3"),
            new TrigMultiply(3, "sin", 0, "0"),
            new TrigMultiply(3, "cos", 90, "0"),
            new TrigMultiply(3, "tan", 180, "0"),
    };

    private record TrigDivide(String func, int angle, String divisorDisplay) {
    }

    private static final TrigDivide[] DIVIDE_POOL = {
            new TrigDivide("tan", 60, "√3"),
            new TrigDivide("sin", 60, "√3/2"),
            new TrigDivide("cos", 30, "√3/2"),
            new TrigDivide("sin", 30, "1/2"),
            new TrigDivide("cos", 60, "1/2"),
            new TrigDivide("sin", 150, "1/2"),
            new TrigDivide("tan", 240, "√3"),
            new TrigDivide("cos", 300, "1/2"),
    };

    private static final String[] PROBABILITY_THEMES = {"공", "카드", "학생", "과일", "사탕", "동물"};

    public static GeneratedQuestion generate(MathCategory category, Random random) {
        return switch (category) {
            case TRIGONOMETRY -> generateTrigonometry(random);
            case SEQUENCE -> generateSequence(random);
            case PROBABILITY -> generateProbability(random);
            case POWERS -> generatePowers(random);
            case ROOTS -> generateRoots(random);
            case FRACTION -> generateFraction(random);
            case EQUATION -> generateEquation(random);
            case DIVISOR -> generateDivisor(random);
            case MULTIPLE -> generateMultiple(random);
        };
    }

    // ---------------- Trigonometry ----------------

    private static GeneratedQuestion generateTrigonometry(Random random) {
        int template = weightedPick(new int[]{30, 20, 10, 15, 10, 10, 5}, random);
        return switch (template) {
            case 0 -> trigT1(random);
            case 1 -> trigPairQuestion(ADD_PAIRS[random.nextInt(ADD_PAIRS.length)], "+");
            case 2 -> trigPairQuestion(SUB_PAIRS[random.nextInt(SUB_PAIRS.length)], "-");
            case 3 -> trigT4(random);
            case 4 -> trigT5(random);
            case 5 -> trigT6(random);
            default -> trigT7(random);
        };
    }

    private static GeneratedQuestion trigT1(Random random) {
        int functionIdx = random.nextInt(3);
        String func = functionIdx == 0 ? "sin" : functionIdx == 1 ? "cos" : "tan";
        int[] pool = func.equals("tan") ? ANGLES_NO_TAN_UNDEFINED : ANGLES;
        int angle = pool[random.nextInt(pool.length)];
        Map<Integer, String> table = func.equals("sin") ? SIN : func.equals("cos") ? COS : TAN;
        return new GeneratedQuestion(func + "(" + angle + "°)", AnswerType.TRIG, table.get(angle));
    }

    private static GeneratedQuestion trigPairQuestion(TrigPair pair, String op) {
        String text = pair.func1() + "(" + pair.angle1() + "°)" + op + pair.func2() + "(" + pair.angle2() + "°)";
        return new GeneratedQuestion(text, AnswerType.TRIG, pair.result());
    }

    private static GeneratedQuestion trigT4(Random random) {
        TrigMultiply m = MULTIPLY_POOL[random.nextInt(MULTIPLY_POOL.length)];
        String text = m.multiplier() + "×" + m.func() + "(" + m.angle() + "°)";
        return new GeneratedQuestion(text, AnswerType.TRIG, m.result());
    }

    private static GeneratedQuestion trigT5(Random random) {
        TrigDivide d = DIVIDE_POOL[random.nextInt(DIVIDE_POOL.length)];
        String text = d.func() + "(" + d.angle() + "°)÷" + d.divisorDisplay();
        return new GeneratedQuestion(text, AnswerType.TRIG, "1");
    }

    private static GeneratedQuestion trigT6(Random random) {
        boolean useSin = random.nextBoolean();
        int angle = ANGLES[random.nextInt(ANGLES.length)];
        String func = useSin ? "sin" : "cos";
        String base = (useSin ? SIN : COS).get(angle);
        String text = func + "²(" + angle + "°)";
        return new GeneratedQuestion(text, AnswerType.TRIG, SQUARE_OF.get(base));
    }

    private static GeneratedQuestion trigT7(Random random) {
        int angle = ANGLES[random.nextInt(ANGLES.length)];
        String text = "sin²(" + angle + "°)+cos²(" + angle + "°)";
        return new GeneratedQuestion(text, AnswerType.TRIG, "1");
    }

    // ---------------- Sequence ----------------

    private static GeneratedQuestion generateSequence(Random random) {
        int template = weightedPick(new int[]{40, 25, 25, 10}, random);
        return switch (template) {
            case 0 -> seqT1(random);
            case 1 -> seqT2(random);
            case 2 -> seqT3(random);
            default -> seqT4(random);
        };
    }

    private static GeneratedQuestion seqT1(Random random) {
        int first = 1 + random.nextInt(30);
        int diff = 1 + random.nextInt(10);
        int[] terms = {first, first + diff, first + 2 * diff, first + 3 * diff};
        int answer = first + 4 * diff;
        String text = terms[0] + ", " + terms[1] + ", " + terms[2] + ", " + terms[3] + ", ?";
        return new GeneratedQuestion(text, AnswerType.NUMBER, String.valueOf(answer));
    }

    private static GeneratedQuestion seqT2(Random random) {
        int first = 1 + random.nextInt(20);
        int diff = 1 + random.nextInt(9);
        int n = 5 + random.nextInt(11);
        int[] terms = {first, first + diff, first + 2 * diff};
        String text = terms[0] + ", " + terms[1] + ", " + terms[2] + ", ...\n" + n + "번째 항은?";
        int answer = first + diff * (n - 1);
        return new GeneratedQuestion(text, AnswerType.NUMBER, String.valueOf(answer));
    }

    private static GeneratedQuestion seqT3(Random random) {
        int first = 1 + random.nextInt(3);
        int ratio = 2 + random.nextInt(4);
        int[] terms = new int[4];
        terms[0] = first;
        for (int i = 1; i < 4; i++) terms[i] = terms[i - 1] * ratio;
        int answer = terms[3] * ratio;
        String text = terms[0] + ", " + terms[1] + ", " + terms[2] + ", " + terms[3] + ", ?";
        return new GeneratedQuestion(text, AnswerType.NUMBER, String.valueOf(answer));
    }

    private static GeneratedQuestion seqT4(Random random) {
        int first = 1 + random.nextInt(20);
        int diff = 1 + random.nextInt(10);
        int[] terms = {first, first + diff, first + 2 * diff, first + 3 * diff};
        String text = terms[0] + ", " + terms[1] + ", ?, " + terms[3];
        return new GeneratedQuestion(text, AnswerType.NUMBER, String.valueOf(terms[2]));
    }

    // ---------------- Probability ----------------

    private static GeneratedQuestion generateProbability(Random random) {
        int template = weightedPick(new int[]{45, 25, 15, 15}, random);
        return switch (template) {
            case 0 -> probT1(random);
            case 1 -> probT2(random);
            case 2 -> probT3(random);
            default -> probT4(random);
        };
    }

    private static GeneratedQuestion probT1(Random random) {
        String theme = PROBABILITY_THEMES[random.nextInt(PROBABILITY_THEMES.length)];
        int total = 5 + random.nextInt(16);
        int target = 1 + random.nextInt(total - 1);
        String text = switch (theme) {
            case "공" -> "공이 " + total + "개 있다.\n빨간 공은 " + target + "개이다.\n빨간 공을 뽑을 확률은?";
            case "카드" -> "카드가 " + total + "장 있다.\n하트 카드는 " + target + "장이다.\n하트 카드를 뽑을 확률은?";
            case "학생" -> "학생이 " + total + "명 있다.\n안경을 쓴 학생은 " + target + "명이다.\n안경을 쓴 학생을 뽑을 확률은?";
            case "과일" -> "바구니에 과일이 " + total + "개 있다.\n사과는 " + target + "개이다.\n사과를 뽑을 확률은?";
            case "사탕" -> "사탕이 " + total + "개 있다.\n딸기맛 사탕은 " + target + "개이다.\n딸기맛 사탕을 뽑을 확률은?";
            default -> "동물이 " + total + "마리 있다.\n강아지는 " + target + "마리이다.\n강아지를 뽑을 확률은?";
        };
        return new GeneratedQuestion(text, AnswerType.FRACTION, Fraction.of(target, total).toCanonicalString());
    }

    private static GeneratedQuestion probT2(Random random) {
        int condition = random.nextInt(4);
        return switch (condition) {
            case 0 -> {
                int n = 1 + random.nextInt(6);
                yield new GeneratedQuestion("주사위를 한 번 던질 때\n" + n + "이 나올 확률은?", AnswerType.FRACTION, "1/6");
            }
            case 1 -> new GeneratedQuestion("주사위를 한 번 던질 때\n홀수가 나올 확률은?", AnswerType.FRACTION, "1/2");
            case 2 -> new GeneratedQuestion("주사위를 한 번 던질 때\n짝수가 나올 확률은?", AnswerType.FRACTION, "1/2");
            default -> new GeneratedQuestion("주사위를 한 번 던질 때\n3의 배수가 나올 확률은?", AnswerType.FRACTION, "1/3");
        };
    }

    private static GeneratedQuestion probT3(Random random) {
        int flipCount = 1 + random.nextInt(3);
        return switch (flipCount) {
            case 1 -> new GeneratedQuestion("동전을 한 번 던질 때\n앞면이 나올 확률은?", AnswerType.FRACTION, "1/2");
            case 2 -> new GeneratedQuestion("동전을 두 번 던질 때\n앞면이 두 번 나올 확률은?", AnswerType.FRACTION, "1/4");
            default -> new GeneratedQuestion("동전을 세 번 던질 때\n앞면이 정확히 두 번 나올 확률은?", AnswerType.FRACTION, "3/8");
        };
    }

    private static GeneratedQuestion probT4(Random random) {
        int maxNumber = 6 + random.nextInt(15);
        int condition = random.nextInt(4);
        int count;
        String text;
        switch (condition) {
            case 0 -> {
                count = (maxNumber + 1) / 2;
                text = "1부터 " + maxNumber + "까지의 수 중\n홀수일 확률은?";
            }
            case 1 -> {
                count = maxNumber / 2;
                text = "1부터 " + maxNumber + "까지의 수 중\n짝수일 확률은?";
            }
            case 2 -> {
                count = maxNumber / 3;
                text = "1부터 " + maxNumber + "까지의 수 중\n3의 배수일 확률은?";
            }
            default -> {
                count = maxNumber / 5;
                text = "1부터 " + maxNumber + "까지의 수 중\n5의 배수일 확률은?";
            }
        }
        return new GeneratedQuestion(text, AnswerType.FRACTION, Fraction.of(count, maxNumber).toCanonicalString());
    }

    // ---------------- Powers ----------------

    private static GeneratedQuestion generatePowers(Random random) {
        int template = weightedPick(new int[]{50, 25, 25}, random);
        return switch (template) {
            case 0 -> {
                int number = 2 + random.nextInt(29);
                yield new GeneratedQuestion(number + "²", AnswerType.NUMBER, String.valueOf((long) number * number));
            }
            case 1 -> {
                int number = 2 + random.nextInt(9);
                yield new GeneratedQuestion(number + "³", AnswerType.NUMBER, String.valueOf((long) number * number * number));
            }
            default -> powerT3(random);
        };
    }

    private static GeneratedQuestion powerT3(Random random) {
        int[] bases = {2, 3, 4, 5, 6, 7, 8, 9, 10};
        int base = bases[random.nextInt(bases.length)];
        int minExp = 2;
        int maxExp = switch (base) {
            case 2 -> 10;
            case 3, 4 -> 5;
            case 5 -> 4;
            default -> 3;
        };
        int exponent = minExp + random.nextInt(maxExp - minExp + 1);
        long result = 1;
        for (int i = 0; i < exponent; i++) result *= base;
        return new GeneratedQuestion(base + toSuperscript(exponent), AnswerType.NUMBER, String.valueOf(result));
    }

    // ---------------- Roots ----------------

    private static GeneratedQuestion generateRoots(Random random) {
        int template = weightedPick(new int[]{45, 35, 20}, random);
        return switch (template) {
            case 0 -> {
                int k = 1 + random.nextInt(30);
                yield new GeneratedQuestion("√" + (k * k), AnswerType.NUMBER, String.valueOf(k));
            }
            case 1 -> {
                int k = 1 + random.nextInt(30);
                yield new GeneratedQuestion("□² = " + (k * k), AnswerType.NUMBER, String.valueOf(k));
            }
            default -> {
                int k = 2 + random.nextInt(9);
                yield new GeneratedQuestion("³√" + (k * k * k), AnswerType.NUMBER, String.valueOf(k));
            }
        };
    }

    // ---------------- Fraction ----------------

    private static GeneratedQuestion generateFraction(Random random) {
        int template = weightedPick(new int[]{30, 20, 25, 15, 10}, random);
        return switch (template) {
            case 0 -> fracAddOrSub(random, true);
            case 1 -> fracAddOrSub(random, false);
            case 2 -> fracMultiply(random);
            case 3 -> fracDivide(random);
            default -> fracReduce(random);
        };
    }

    private static int[] randomFraction(Random random) {
        int d = 2 + random.nextInt(11);
        int n = 1 + random.nextInt(d - 1);
        return new int[]{n, d};
    }

    private static GeneratedQuestion fracAddOrSub(Random random, boolean isAdd) {
        int[] f1 = randomFraction(random);
        int[] f2 = randomFraction(random);
        Fraction a = Fraction.of(f1[0], f1[1]);
        Fraction b = Fraction.of(f2[0], f2[1]);
        if (!isAdd && a.isLessThan(b)) {
            int[] tmp = f1;
            f1 = f2;
            f2 = tmp;
            Fraction tmpF = a;
            a = b;
            b = tmpF;
        }
        Fraction result = isAdd ? a.plus(b) : a.minus(b);
        String op = isAdd ? " + " : " - ";
        String text = f1[0] + "/" + f1[1] + op + f2[0] + "/" + f2[1];
        return new GeneratedQuestion(text, AnswerType.FRACTION, result.toCanonicalString());
    }

    private static GeneratedQuestion fracMultiply(Random random) {
        int[] f1 = randomFraction(random);
        int[] f2 = randomFraction(random);
        Fraction result = Fraction.of(f1[0], f1[1]).times(Fraction.of(f2[0], f2[1]));
        String text = f1[0] + "/" + f1[1] + " × " + f2[0] + "/" + f2[1];
        return new GeneratedQuestion(text, AnswerType.FRACTION, result.toCanonicalString());
    }

    private static GeneratedQuestion fracDivide(Random random) {
        int[] f1 = randomFraction(random);
        int[] f2 = randomFraction(random);
        Fraction result = Fraction.of(f1[0], f1[1]).dividedBy(Fraction.of(f2[0], f2[1]));
        String text = f1[0] + "/" + f1[1] + " ÷ " + f2[0] + "/" + f2[1];
        return new GeneratedQuestion(text, AnswerType.FRACTION, result.toCanonicalString());
    }

    private static GeneratedQuestion fracReduce(Random random) {
        int q, p;
        do {
            q = 2 + random.nextInt(11);
            p = 1 + random.nextInt(q - 1);
        } while (gcd(p, q) != 1);
        int k = 2 + random.nextInt(3);
        String text = (p * k) + "/" + (q * k);
        return new GeneratedQuestion(text, AnswerType.FRACTION, Fraction.of(p, q).toCanonicalString());
    }

    // ---------------- Equation ----------------

    private static GeneratedQuestion generateEquation(Random random) {
        int template = weightedPick(new int[]{40, 25, 20, 15}, random);
        return switch (template) {
            case 0 -> eqT1(random);
            case 1 -> eqT2(random);
            case 2 -> eqT3(random);
            default -> eqT4(random);
        };
    }

    private static GeneratedQuestion eqT1(Random random) {
        int x = 1 + random.nextInt(20);
        int a = 1 + random.nextInt(10);
        int b = -15 + random.nextInt(31);
        int c = a * x + b;
        String bTerm = b == 0 ? "" : (b > 0 ? "+" + b : String.valueOf(b));
        String text = a + "x" + bTerm + "=" + c;
        return new GeneratedQuestion(text, AnswerType.NUMBER, String.valueOf(x));
    }

    private static GeneratedQuestion eqT2(Random random) {
        int x = 1 + random.nextInt(20);
        if (random.nextBoolean()) {
            int b = 1 + random.nextInt(20);
            int c = x + b;
            return new GeneratedQuestion("□+" + b + "=" + c, AnswerType.NUMBER, String.valueOf(x));
        } else {
            int a = 2 + random.nextInt(8);
            int c = a * x;
            return new GeneratedQuestion(a + "×□=" + c, AnswerType.NUMBER, String.valueOf(x));
        }
    }

    private static GeneratedQuestion eqT3(Random random) {
        int base = 2 + random.nextInt(4);
        int exponent = 2 + random.nextInt(5);
        long c = 1;
        for (int i = 0; i < exponent; i++) c *= base;
        String text = base + "^x=" + c;
        return new GeneratedQuestion(text, AnswerType.NUMBER, String.valueOf(exponent));
    }

    private static GeneratedQuestion eqT4(Random random) {
        int base = 2 + random.nextInt(4);
        int answer = 1 + random.nextInt(6);
        long trueNum = 1;
        for (int i = 0; i < answer; i++) trueNum *= base;
        String text = "log" + toSubscript(base) + "(" + trueNum + ")=x";
        return new GeneratedQuestion(text, AnswerType.NUMBER, String.valueOf(answer));
    }

    // ---------------- Divisor ----------------

    private static GeneratedQuestion generateDivisor(Random random) {
        int template = weightedPick(new int[]{35, 45, 20}, random);
        return switch (template) {
            case 0 -> divisorCount(random);
            case 1 -> {
                int a = 4 + random.nextInt(47);
                int b = 4 + random.nextInt(47);
                yield new GeneratedQuestion(a + "과 " + b + "의 최대공약수", AnswerType.NUMBER, String.valueOf(gcd(a, b)));
            }
            default -> {
                int number = 4 + random.nextInt(97);
                int candidate = 2 + random.nextInt(19);
                int answer = number % candidate == 0 ? 1 : 0;
                yield new GeneratedQuestion(
                        candidate + "은 " + number + "의 약수인가?\n(1: 예 / 0: 아니오)",
                        AnswerType.NUMBER, String.valueOf(answer));
            }
        };
    }

    private static GeneratedQuestion divisorCount(Random random) {
        int number;
        int count;
        int attempts = 0;
        do {
            number = 4 + random.nextInt(97);
            count = countDivisors(number);
            attempts++;
        } while (count > 8 && attempts < 50);
        return new GeneratedQuestion(number + "의 약수는 몇 개인가?", AnswerType.NUMBER, String.valueOf(count));
    }

    // ---------------- Multiple ----------------

    private static GeneratedQuestion generateMultiple(Random random) {
        int template = weightedPick(new int[]{45, 25, 30}, random);
        return switch (template) {
            case 0 -> multipleLcm(random);
            case 1 -> {
                int number = 2 + random.nextInt(99);
                int candidate = 2 + random.nextInt(19);
                int answer = number % candidate == 0 ? 1 : 0;
                yield new GeneratedQuestion(
                        number + "는 " + candidate + "의 배수인가?\n(1: 예 / 0: 아니오)",
                        AnswerType.NUMBER, String.valueOf(answer));
            }
            default -> {
                int number = 2 + random.nextInt(11);
                int index = 2 + random.nextInt(9);
                yield new GeneratedQuestion(number + "의 " + index + "번째 배수", AnswerType.NUMBER,
                        String.valueOf(number * index));
            }
        };
    }

    private static GeneratedQuestion multipleLcm(Random random) {
        int a, b, lcm;
        int attempts = 0;
        do {
            a = 2 + random.nextInt(19);
            b = 2 + random.nextInt(19);
            lcm = (a / gcd(a, b)) * b;
            attempts++;
        } while (lcm > 200 && attempts < 50);
        return new GeneratedQuestion(a + "과 " + b + "의 최소공배수", AnswerType.NUMBER, String.valueOf(lcm));
    }

    // ---------------- helpers ----------------

    private static int weightedPick(int[] weights, Random random) {
        int total = 0;
        for (int w : weights) total += w;
        int roll = random.nextInt(total);
        int acc = 0;
        for (int i = 0; i < weights.length; i++) {
            acc += weights[i];
            if (roll < acc) return i;
        }
        return weights.length - 1;
    }

    private static int gcd(int a, int b) {
        while (b != 0) {
            int t = b;
            b = a % b;
            a = t;
        }
        return a == 0 ? 1 : a;
    }

    private static int countDivisors(int n) {
        int count = 0;
        for (int i = 1; i <= n; i++) {
            if (n % i == 0) count++;
        }
        return count;
    }

    private static final char[] SUPERSCRIPTS = {'⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹'};
    private static final char[] SUBSCRIPTS = {'₀', '₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈', '₉'};

    private static String toSuperscript(int n) {
        StringBuilder sb = new StringBuilder();
        for (char c : String.valueOf(n).toCharArray()) {
            sb.append(SUPERSCRIPTS[c - '0']);
        }
        return sb.toString();
    }

    private static String toSubscript(int n) {
        StringBuilder sb = new StringBuilder();
        for (char c : String.valueOf(n).toCharArray()) {
            sb.append(SUBSCRIPTS[c - '0']);
        }
        return sb.toString();
    }
}
