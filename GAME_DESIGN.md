# GAME_DESIGN.md

# 구구배틀 (99 Battle)

Version : 1.0

Status : MVP Design Complete

---

# 1. 프로젝트 개요

## 게임명

국문

구구배틀

영문

99 Battle

---

## 장르

실시간 멀티플레이 캐주얼 계산 배틀 게임

Real-time Multiplayer Casual Math Battle Game

---

## 플랫폼

- Mobile Web
- Progressive Web App (PWA)

MVP에서는 모바일 세로 화면만 지원한다.

태블릿 및 PC 환경은 고려하지 않는다.

---

## 프로젝트 목표

구구배틀은

'어려운 수학 문제를 푸는 게임'이 아니다.

누구나 풀 수 있는 쉬운 계산 문제를

얼마나 빠르고 정확하게 해결하는지를 경쟁하는

실시간 멀티플레이 게임이다.

학습보다는

긴장감,

속도감,

친구들과의 경쟁,

순간적인 판단력을

게임의 핵심 재미 요소로 설계한다.

---

## 핵심 컨셉

모든 플레이어는

동일한 문제를

동일한 시간에

동시에 풀게 된다.

문제를 먼저 맞힐수록 높은 점수를 획득한다.

게임은

구구단 문제를 중심으로 진행되며,

중간중간 다양한 계산 카테고리가 등장하여

게임의 리듬을 변화시킨다.

---

## 핵심 플레이 경험

플레이어는

"이 정도는 쉬운데?"

라고 생각하는 순간

제한시간,

경쟁,

속도,

콤보,

점수 때문에

실수를 하게 된다.

구구배틀은

쉬운 문제를 어렵게 만드는 것이 아니라

쉬운 문제를 긴장 속에서 빠르게 풀게 만드는 게임이다.

---

# 핵심 철학

구구배틀의 모든 시스템은

다음 철학을 절대적으로 따른다.

> 어려운 문제를 푸는 게임이 아니라,
> 쉬운 문제를 얼마나 빠르고 정확하게 푸는가를 겨루는 게임이다.

이 철학을 벗어나는 기능은

MVP에 추가하지 않는다.

---

# MVP 목표

MVP의 목표는

"친구들과 3~5분 동안 재미있게 경쟁할 수 있는 게임"

이다.

복잡한 성장 시스템,

랭킹 시스템,

아이템,

스킨,

업적,

레벨,

경험치 등은

MVP에 포함하지 않는다.

오직

게임 한 판의 재미에 집중한다.

---

# 타겟 유저

- 초등학생
- 중학생
- 고등학생
- 대학생
- 친구들과 함께 플레이하는 일반 사용자

수학 실력보다

순발력과 경쟁을 즐기는 유저를 대상으로 한다.

---

# 플레이 인원

최소 2명

최대 6명

---

# 예상 플레이 시간

약 3~5분

랜덤 이벤트 개수에 따라

플레이 시간이 달라질 수 있다.

---

# 핵심 재미 요소

구구배틀의 재미는

다음 요소들의 조합으로 만들어진다.

1.
실시간 경쟁

모든 플레이어가 동시에 같은 문제를 푼다.

누가 가장 먼저 맞히는지가 중요하다.

---

2.
쉬운 문제

누구나 풀 수 있는 문제만 출제한다.

문제 자체가 어려워서는 안 된다.

---

3.
빠른 템포

문제가 끝나면

0.5초 후

즉시 다음 문제로 넘어간다.

플레이어가 지루함을 느끼지 않도록

빠른 리듬을 유지한다.

---

4.
랜덤 이벤트

구구단만 반복되지 않도록

다양한 계산 카테고리를

게임 중간마다 삽입한다.

---

5.
콤보

연속 정답은

플레이어에게

집중감을 유지하도록 만든다.

---

6.
순위 경쟁

한 문제를 먼저 맞히는 것이

최종 순위에 직접적인 영향을 준다.

끝까지 역전 가능성이 존재하도록 설계한다.

---

# 개발 원칙

이 문서는

구구배틀 MVP 개발의 기준 문서이다.

구현 과정에서

새로운 기능을 임의로 추가하지 않는다.

기능을 단순화하는 것은 가능하지만

새로운 시스템을 추가해서는 안 된다.

모든 개발은

본 문서를 기준으로 진행한다.

문서와 구현이 충돌하는 경우

문서를 우선한다.

게임의 핵심 철학을 훼손하는 기능은

추가하지 않는다.

# 2. 게임 진행 흐름 (Game Flow)

## 게임 진행 순서

구구배틀의 한 게임은 아래 순서로 진행된다.

```text
메인 화면

↓

방 생성 / 방 참가

↓

대기방(Room)

↓

모든 플레이어 Ready

↓

게임 시작 카운트다운

↓

Stage 1

↓

Math Event

↓

Stage 2

↓

Math Event

↓

Stage 3

↓

Math Event

↓

Stage 4

↓

Math Event

↓

Stage 4 반복

↓

게임 종료

↓

결과 화면
```

Math Event의 개수는 방 생성 시 설정한 값(2, 4, 6, 8개)에 따라 달라진다.

모든 Math Event가 종료되면 이후에는 Stage4가 반복되며 게임이 종료될 때까지 계속 진행된다.

---

# 게임 상태(State)

게임은 아래 상태를 가진다.

| State | 설명 |
|--------|------|
| WAITING | 플레이어 입장 대기 |
| READY | 플레이어 준비 완료 |
| COUNTDOWN | 게임 시작 카운트다운 |
| QUESTION | 문제 풀이 |
| RESULT | 문제 결과 표시 |
| EVENT_INTRO | 랜덤 이벤트 소개 |
| EVENT | 랜덤 이벤트 진행 |
| GAME_END | 게임 종료 |
| RESULT_SCREEN | 결과 화면 |

각 상태는 반드시 순서대로 진행한다.

임의로 상태를 건너뛰지 않는다.

---

# 메인 화면

메인 화면에서는 아래 기능만 제공한다.

- 닉네임 입력
- 방 생성
- 방 참가

MVP에서는

로그인 기능을 제공하지 않는다.

닉네임만 입력하면 바로 플레이할 수 있다.

---

# 방 생성

방 생성 시 설정 가능한 항목은 아래와 같다.

## 방 이름

기본값

```
OO님의 방
```

사용자가 자유롭게 수정 가능하다.

최대 길이는 20자이다.

---

## 최대 인원

선택 가능

- 2명
- 3명
- 4명
- 5명
- 6명

---

## Math Event 개수

선택 가능

- 2개
- 4개
- 6개
- 8개

0개는 선택할 수 없다.

Math Event는 게임의 핵심 재미 요소이므로 반드시 포함한다.

---

# 방 참가

플레이어는

방 코드 또는 공유 링크를 통해 참가한다.

참가 즉시 대기방으로 이동한다.

---

# 대기방(Room)

대기방에서는 아래 정보를 표시한다.

- 방 이름
- 현재 인원
- 최대 인원
- Math Event 개수
- 플레이어 목록
- Ready 버튼
- 방 나가기 버튼

방장은 방 설정(최대 인원 / 스테이지 개수) 변경 권한과 게임 시작 권한을 가진다.

게임 시작은

방장을 제외한 모든 플레이어가 Ready 상태가 되면, 방장이 "시작하기" 버튼을 눌러야 시작된다.

(방에 방장 혼자만 있는 경우에는 즉시 시작할 수 있다.)

---

# Ready 시스템

플레이어는

Ready 버튼을 눌러 준비 상태가 된다.

방장을 제외한 모든 플레이어가 Ready가 되면

방장의 화면에 "시작하기" 버튼이 활성화된다.

방장이 버튼을 눌러야 게임이 시작된다.

---

# 게임 시작

모든 플레이어가 Ready 상태가 되면

3초 카운트다운을 시작한다.

```text
3

2

1

START!
```

카운트다운 중에는

모든 입력을 비활성화한다.

카운트다운 종료 즉시

첫 번째 문제가 표시된다.

---

# Stage 진행

Stage는 아래 순서대로 진행된다.

Stage1

↓

Math Event

↓

Stage2

↓

Math Event

↓

Stage3

↓

Math Event

↓

Stage4

↓

Math Event

↓

Stage4 반복

Stage4는 최고 난이도이며,

게임 종료 시까지 계속 유지된다.

---

# 문제 진행

모든 플레이어는

동일한 문제를

동일한 시점에

동시에 본다.

예시

```text
17 × 8
```

↓

모든 플레이어 입력

↓

결과 표시

↓

다음 문제

문제를 먼저 푼 사람이

더 높은 점수를 획득한다.

---

# 문제 종료 조건

현재 문제는

아래 두 조건 중 하나를 만족하면 종료된다.

## 조건 1

모든 플레이어가 답안을 제출하였다.

↓

즉시 결과 화면으로 이동한다.

---

## 조건 2

제한시간이 종료되었다.

↓

제출하지 않은 플레이어는

TIME OUT 처리한다.

↓

결과 화면으로 이동한다.

---

# 결과 표시

문제가 종료되면

0.5초 동안 결과를 표시한다.

표시 내용

- 정답
- 본인 입력값
- 정답 여부
- 획득 점수
- 현재 순위

0.5초 후

자동으로 다음 문제를 시작한다.

이 시간은 고정값이다.

---

# 문제 전환

문제 전환 시

별도의 버튼을 누르지 않는다.

자동으로 다음 문제가 시작된다.

빠른 게임 템포를 유지하기 위함이다.

---

# 게임 종료

모든 Stage와 Math Event가 종료되면

게임을 종료한다.

종료 후에는

결과 화면으로 이동한다.

---

# 결과 화면

결과 화면에서는

아래 정보만 표시한다.

- 최종 순위
- 플레이어 이름
- 최종 점수

1~3위는 메달 아이콘과 함께 표시하고, 4위 이하는 순위 숫자와 이름만 표시한다.

MVP에서는

아래 버튼만 제공한다.

- 다시 하기
- 방 나가기

## 자동 진행 타이머

결과 화면 진입 시 10초 타이머가 시작된다.

10초 안에 아무 버튼도 누르지 않으면 자동으로 "다시 하기"가 선택된 것으로 처리한다.

"방 나가기"는 명시적으로 버튼을 눌렀을 때만 실행된다.

---

# 점수 시스템 (Scoring)

## 정답

```text
100 + floor(remaining_time / time_limit × 50)
```

빠르게 맞힐수록 최대 150점까지 획득한다.

## 오답 (제출함)

```text
-30
```

찍기를 방지하기 위해 오답 제출에는 실제 점수 손해가 있다.

## TIME OUT (미제출)

```text
0
```

시도하지 않은 것에는 별도 페널티를 주지 않는다.

## 최종 점수

모든 문제의 점수 변화를 누적하되, 총점은 항상 0 이상으로 고정한다 (음수로 표시되지 않는다).

## 동점자 처리

최종 점수가 동일한 경우, 문제 풀이에 사용한 누적 응답 시간이 더 짧은 플레이어를 상위 순위로 처리한다.

(오답 제출 시각 = 실제 제출 시각, TIME OUT = 해당 문제의 제한시간 전체로 기록)

---

# 다시 하기

모든 플레이어가

다시 하기를 선택하면

동일한 방의 대기방으로 돌아간다.

게임을 자동으로 시작하지 않는다 —

방장을 제외한 모든 플레이어가 다시 Ready를 눌러야 하고,

방장이 "시작하기"를 눌러야 새 게임이 시작된다.

새 게임에서는

모든 문제를 다시 랜덤 생성한다.

이전 게임의 점수는 유지되지 않는다.

---

# 방 나가기

플레이어는

언제든지 방을 나갈 수 있다.

게임 진행 중 나간 경우

기권 처리한다.

남은 플레이어는

게임을 계속 진행한다.

기권한 플레이어는

최하위로 기록한다.

## 연결 끊김(Disconnect)

MVP에서는 재접속 대기를 지원하지 않는다.

연결이 끊긴 플레이어는 방을 나간 것과 동일하게 즉시 기권 처리한다.

---

# 설계 의도

구구배틀의 게임 진행은

최대한 단순하게 설계한다.

플레이어는

"문제 → 결과 → 다음 문제"

이 흐름만 반복하도록 만든다.

불필요한 화면 전환이나

복잡한 메뉴를 최소화하여

게임의 템포와 몰입감을 유지하는 것을 목표로 한다.

# 3. 스테이지 시스템 (Stage System)

## 개요

구구배틀의 메인 콘텐츠는 스테이지(Stage) 시스템이다.

플레이어는 게임이 시작되면 순차적으로 스테이지를 진행하며, 스테이지가 올라갈수록 문제 해결 속도와 집중력을 요구받는다.

스테이지의 목적은 플레이어에게 어려운 수학 문제를 제공하는 것이 아니라, 같은 수준의 계산을 점점 더 빠른 템포에서 해결하도록 만드는 것이다.

난이도 상승은 계산 난이도와 제한시간의 조합으로 이루어진다.

---

# 스테이지 구성

구구배틀의 게임은 여러 개의 Stage로 구성된다.

방 생성 시 방장은 Math Event 개수를 선택하며, 선택한 개수에 따라 게임의 총 Stage 수가 결정된다.

| Math Event 개수 | 총 Stage 수 |
|-------------------|-------------|
| 2개 | Stage 3까지 |
| 4개 | Stage 5까지 |
| 6개 | Stage 7까지 |
| 8개 | Stage 9까지 |

Stage 사이에는 반드시 Math Event가 1개씩 진행된다.

Stage4 이후에는 새로운 난이도를 추가하지 않는다.

Stage5 이후의 모든 Stage는 Stage4와 동일한 규칙을 사용한다.

---

# 설계 의도

Stage의 목적은 문제를 어렵게 만드는 것이 아니다.

같은 계산을

더 짧은 시간 안에

더 정확하게

더 빠르게

풀도록 만드는 것이 핵심이다.

구구배틀은 암산 능력보다 순발력과 집중력을 겨루는 게임이다.

---

# Stage 1

## 목적

플레이어가 게임에 적응하는 구간이다.

첫 게임을 하는 사용자도 부담 없이 시작할 수 있도록 설계한다.

---

## 문제 범위

출제 범위

```
2 × 1

~

9 × 9
```

0단은 사용하지 않는다.

1×1 역시 출제하지 않는다.

---

## 문제 개수

총 5문제

---

## 제한시간

5초

---

## 출제 예시

```
2 × 7

8 × 9

5 × 6

3 × 8

9 × 4
```

---

# Stage 2

## 목적

플레이어가 게임에 익숙해졌다고 판단하는 구간이다.

문제 수준은 그대로 유지하고

제한시간만 감소한다.

---

## 문제 범위

```
2 × 1

~

9 × 9
```

---

## 문제 개수

5문제

---

## 제한시간

3초

---

## 설계 이유

문제를 어렵게 만들지 않고

속도를 높여 긴장감을 만든다.

---

# Stage 3

## 목적

구구단의 확장 구간이다.

여기서부터

두 자리 × 한 자리 계산이 등장한다.

---

## 문제 범위

```
10 × 1

~

19 × 9
```

예시

```
10 × 8

12 × 7

17 × 4

19 × 9
```

---

## 문제 개수

5문제

---

## 제한시간

5초

---

## 설계 이유

계산 자체는 여전히 쉽다.

17 × 8 정도는

암산으로 충분히 가능한 수준이다.

하지만

빠르게 계산해야 하므로

긴장감이 크게 증가한다.

---

# Stage 4

## 목적

최종 난이도 구간이다.

Stage4 이후의 모든 Stage는 동일한 규칙을 사용한다.

---

## 문제 범위

```
10 × 1

~

19 × 9
```

---

## 문제 개수

5문제

---

## 제한시간

3초

---

## 설계 이유

문제 개수는 적지만

매우 빠른 템포로 진행된다.

Stage4는

순간적인 암산 능력보다

집중력과 반응속도를 시험하는 구간이다.

---

# 왜 19 × 9까지만 사용하는가

MVP에서는

20 이상의 숫자를 사용하지 않는다.

예를 들어

```
24 × 8

31 × 9

46 × 7
```

같은 문제는 출제하지 않는다.

---

## 이유

구구배틀은

구구단을 기반으로 하는 게임이다.

너무 큰 숫자가 등장하면

게임의 성격이

암산 게임으로 변한다.

이는 게임의 핵심 철학과 맞지 않는다.

19 × 9 정도는

약간의 계산만으로 해결 가능하며,

누구나 연습하면 빠르게 풀 수 있는 수준이다.

---

# 문제 생성 규칙

모든 문제는

현재 스테이지의 범위 내에서

무작위(Random)로 생성한다.

---

## Stage1~2

랜덤 범위

```
첫 번째 숫자

2~9

두 번째 숫자

1~9
```

---

## Stage3 이후

첫 번째 숫자

```
10~19
```

두 번째 숫자

```
1~9
```

Stage4 이후의 모든 Stage 역시 동일한 범위를 사용한다.

---

# 문제 중복 방지

동일한 게임에서는

같은 문제가 두 번 등장하지 않는다.

예시

```
17 × 8
```

이 나왔다면

이번 게임에서는

다시 출제하지 않는다.

새 게임이 시작되면

중복 여부를 초기화한다.

---

# 문제 순서

문제는

게임 시작 시

미리 생성한다.

게임 도중에는

새로운 문제를 생성하지 않는다.

즉,

Game Start

↓

모든 문제 생성

↓

셔플

↓

순서대로 사용

이 방식을 사용한다.

---

# 문제 생성 이유

게임 도중 문제를 생성하면

플레이어마다

네트워크 지연으로 인해

문제 동기화 문제가 발생할 수 있다.

따라서

모든 문제를

게임 시작 전에 생성하여

모든 플레이어가

동일한 순서의 문제를 보도록 한다.

---

# 문제 표시

한 번에

하나의 문제만 화면에 표시한다.

예시

```
17 × 8
```

입력창

```
[     ]
```

문제 번호

```
2 / 5
```

남은 시간

```
■■■■□□□□
```

---

# 입력 방식

정답은

숫자만 입력한다.

예시

```
136
```

입력 완료 후

Submit 버튼을 누르거나

Enter를 누르면 제출된다.

모바일에서는

숫자 키패드를 기본으로 사용한다.

---

# 입력 제한

숫자가 아닌 문자는 입력할 수 없다.

음수는 입력할 수 없다.

소수는 입력할 수 없다.

공백은 허용하지 않는다.

---

# 시간 종료

제한시간이 종료될 때까지

답을 제출하지 않은 경우

자동으로 TIME OUT 처리한다.

빈 값은 제출되지 않는다.

TIME OUT은

오답보다 더 큰 패널티를 가진다.

---

# 제출 이후

답안을 제출한 플레이어는

더 이상 수정할 수 없다.

결과가 나올 때까지

입력창을 비활성화한다.

---

# 스테이지 전환

현재 Stage의 모든 문제를 완료하면 다음 순서로 진행한다.

1. Stage 종료
2. Math Event가 남아 있는 경우 Math Event 진행
3. 다음 Stage 시작

모든 Math Event를 사용한 이후에는 남은 Stage만 진행한다.

마지막 Stage를 완료하면 즉시 게임이 종료된다.

플레이어의 추가 입력 없이 모든 과정은 자동으로 진행된다.

---

# Stage4 이후

Stage4는 마지막 난이도이다.

Stage5부터는 Stage 번호만 증가하며 새로운 난이도는 추가되지 않는다.

Stage5 이후의 모든 Stage는 아래 규칙을 동일하게 사용한다.

- 문제 범위 : 10~19 × 1~9
- 제한시간 : 3초
- 문제 개수 : 5문제

게임은 방 생성 시 결정된 마지막 Stage를 완료하면 종료된다.

Math Event는 Stage와 Stage 사이에서만 진행되며, 마지막 Stage가 종료된 이후에는 Math Event가 발생하지 않는다.

---

# 설계 원칙

스테이지 시스템은

'난이도 증가'보다

'게임 템포 증가'를 우선한다.

플레이어는

"문제가 어려워졌다."

라고 느끼는 것이 아니라,

"점점 더 정신없어진다."

라고 느껴야 한다.

이것이 구구배틀이 추구하는 핵심 플레이 경험이다.

# 4. Math Event 시스템

## 개요

Math Event는 Stage와 Stage 사이에서 진행되는 특별 문제 라운드이다.

Math Event에서는 일반 Stage의 구구단 문제가 아닌, 다양한 수학 카테고리의 문제가 출제된다.

모든 플레이어는 동일한 Math Event를 동시에 진행한다.

Math Event는 게임의 흐름에 변화를 주고 다양한 수학적 사고를 요구하는 콘텐츠이다.

---

# 진행 시점

Math Event는 Stage와 Stage 사이에서만 진행된다.

예시

Stage1

↓

Math Event

↓

Stage2

↓

Math Event

↓

Stage3

↓

...

마지막 Stage 이후에는 Math Event가 진행되지 않는다.

---

# Math Event 개수

방 생성 시 방장은 Math Event 개수를 선택한다.

선택 가능한 개수는 아래와 같다.

- 2개
- 4개
- 6개
- 8개

선택된 개수에 따라 게임의 총 Stage 수가 결정된다.

---

# Math Event 선택 방식

게임 시작 시 사용할 Math Event를 모두 무작위로 결정한다.

동일한 Math Event는 한 게임에서 중복 등장할 수 있다.

단, 동일한 Math Event가 연속으로 등장해서는 안 된다.

예시

가능

제곱

↓

확률

↓

제곱

↓

분수

불가능

제곱

↓

제곱

---

# 진행 순서

Math Event는 아래 순서로 진행한다.

Stage 종료

↓

Math Event 소개

↓

문제 풀이

↓

결과 반영

↓

다음 Stage 시작

---

# 소개 화면

Math Event 시작 전 1초 동안

Math Event 이름과 간단한 설명을 표시한다.

예시

📐 삼각함수

"기본 삼각함수 문제를 풀어보세요."

또는

🧩 방정식

"x의 값을 구해보세요."

소개 화면에서는 입력을 받을 수 없다.

---

# 문제 구성

Math Event는 하나의 수학 카테고리만 사용한다.

하나의 Math Event에서는 다른 카테고리 문제가 함께 출제되지 않는다.

출제되는 문제는 일반적인 교육과정의 기초 수준으로 제한한다.

복잡한 계산이나 긴 풀이 과정이 필요한 문제는 출제하지 않는다.

---

# 입력 방식

Math Event는 문제 유형에 따라 입력 UI가 변경될 수 있다.

예를 들어 숫자 입력, 객관식 선택, O/X 선택 등 각 카테고리에 적합한 입력 방식을 사용할 수 있다.

모든 입력 UI는 모바일 환경에서 빠르게 입력할 수 있도록 설계한다.

---

# 종료

모든 플레이어가 문제를 완료하거나 제한시간이 종료되면 Math Event를 종료한다.

종료 후에는 즉시 다음 Stage를 시작한다.

별도의 확인 버튼은 제공하지 않는다.

# 5. Math Event

## 5.1 Overview

### Purpose

Math Event는 반복되는 Multiplication Stage 사이에 진행되는 Bonus Round이다.

플레이어는 다양한 수학 카테고리의 문제를 해결한 뒤 다시 Multiplication Stage로 복귀한다.

Math Event의 목적은 게임의 반복성을 줄이고, 다양한 사고를 요구하는 문제를 제공하여 플레이 경험을 풍부하게 만드는 것이다.

---

### Features

- 모든 플레이어에게 동일한 문제가 출제된다.
- 서버에서 문제를 생성한다.
- 문제는 Template 기반으로 생성한다.
- 하나의 Event에서는 하나의 카테고리만 출제된다.
- 카테고리는 Weight 기반으로 랜덤 선택된다.
- Template는 Weight 기반으로 랜덤 선택된다.
- Parameter를 변경하여 다양한 문제를 생성한다.
- 모든 문제는 하나의 정답만 가진다.
- 모든 문제는 직접 입력 방식으로 해결한다.
- 긴 계산이나 복잡한 풀이를 요구하는 문제는 생성하지 않는다.

---

## 5.2 Game Flow

Math Event는 Multiplication Stage와 Multiplication Stage 사이에서 진행된다.

```text
Stage 1
    │
    ▼
Math Event
    │
    ▼
Stage 2
    │
    ▼
Math Event
    │
    ▼
Stage 3
    │
    ▼
...
    │
    ▼
Final Stage
    │
    ▼
Game End
```

Final Stage 종료 이후에는 Math Event가 발생하지 않는다.

---

## 5.3 Event Count

방 생성 시 Host는 Math Event 횟수를 선택한다.

### Available Options

- 2
- 4
- 6
- 8

Final Stage는 아래 공식을 따른다.

```text
Final Stage = Event Count + 1
```

| Event Count | Final Stage |
| ------------ | ----------- |
| 2 | Stage 3 |
| 4 | Stage 5 |
| 6 | Stage 7 |
| 8 | Stage 9 |

---

## 5.4 Time Limit

### Multiplication Stage

Multiplication Stage는 Stage 진행에 따라 제한시간이 감소한다.

| Stage | Time | Questions |
| ------ | ---- | --------- |
| Stage 1 | 5 sec | 5 |
| Stage 2 | 3 sec | 5 |
| Stage 3 | 5 sec | 5 |
| Stage 4+ | 3 sec | 5 |

---

### Math Event

Math Event는 Bonus Round 역할을 수행한다.

모든 Math Event의 제한시간은 **항상 5초**이다.

Stage 진행 여부와 관계없이 제한시간은 변경되지 않는다.

Math Event 1회당 문제 수는 **5문제**이다 (Stage와 동일).

| Categories | Time | Questions |
| -------- | ---- | --------- |
| All Math Events | 5 sec | 5 |

---

## 5.5 Problem Generation

모든 문제는 서버에서 생성한다.

```text
Math Event Start
        │
        ▼
Select Category
        │
        ▼
Select Template
        │
        ▼
Generate Parameters
        │
        ▼
Generate Question
        │
        ▼
Generate Answer
        │
        ▼
Send Same Question To Every Player
```

Client는 문제를 생성하지 않는다.

---

## 5.6 Common Rules

### Rule 0

Math Event는 문제를 어렵게 만드는 것이 목적이 아니다.

모든 문제는 제한시간(5초) 안에 암산 또는 간단한 계산만으로 해결 가능해야 한다.

문제의 다양성은 계산량을 늘리는 것이 아니라 Template의 다양성을 통해 제공한다.

새로운 Template를 추가할 경우에도 위 원칙을 반드시 만족해야 한다.Trigonometry

### Rule 1

모든 문제는 Template 기반으로 생성한다.

Runtime에서 새로운 유형의 문제를 생성하지 않는다.

---

### Rule 2

동일한 Template에서도 Parameter를 변경하여 다양한 문제를 생성한다.

예시

```text
17²

18²

19²
```

위 문제들은 모두 동일한 Template이다.

---

### Rule 3

모든 문제는 하나의 정답만 가져야 한다.

허용

```text
√144

↓

12
```

비허용

```text
24의 약수를 모두 입력하세요.
```

---

### Rule 4

모든 문제는 암산 또는 간단한 계산만으로 해결 가능해야 한다.

허용

```text
18²

2⁸

√256

2ˣ = 16
```

비허용

```text
97²

19⁵

√92881
```

---

### Rule 5

긴 풀이 과정이 필요한 문제는 생성하지 않는다.

---

### Rule 6

객관식은 사용하지 않는다.

모든 문제는 직접 입력 방식으로 해결한다.

---

### Rule 7

모든 플레이어는 동일한 문제를 제공받는다.

---

### Rule 8

정답은 반드시 하나만 존재해야 한다.

---

## 5.7 Answer Validation

### Integer

정수는 숫자가 완전히 일치해야 한다.

예시

```text
225
```

---

### Fraction

분수는 기약분수만 정답으로 인정한다.

허용

```text
1/2
```

비허용

```text
2/4
```

---

### Trigonometry

수학적으로 동일한 값은 모두 정답으로 인정한다.

허용

```text
√2/2

=

1/√2
```

허용

```text
√3/3

=

1/√3
```

Validation은 문자열 비교가 아닌 수학적 동치 비교를 수행한다.

---

### Equation

항상 정수 해만 생성한다.

생성하지 않는 문제

- 소수 해
- 무리수 해
- 복수 입력이 필요한 문제

---

## 5.8 Input UI

### Number Keypad

사용 카테고리

- Sequence
- Powers
- Roots
- Equation
- Divisor
- Multiple

```text
7 8 9

4 5 6

1 2 3

0   ⌫   확인
```

---

### Fraction Keypad

사용 카테고리

- Probability
- Fraction

```text
7 8 9

4 5 6

1 2 3

0   /   ⌫   확인
```

---

### Trigonometry Keypad

사용 카테고리

- Trigonometry

```text
7 8 9

4 5 6

1 2 3

0   /   √

⌫      확인
```

---

## 5.9 Math Categories

Math Event는 아래 9개의 카테고리로 구성된다.

| Category | Description |
| ---------- | --------------------------- |
| Trigonometry | 삼각함수 |
| Sequence | 수열 |
| Probability | 확률 |
| Powers | 거듭제곱 |
| Roots | 근 |
| Fraction | 분수 |
| Equation | 방정식 |
| Divisor | 약수 |
| Multiple | 배수 |

## 5.10 Trigonometry

### Description

Trigonometry 카테고리는 특수각의 삼각함수 값을 맞히는 문제를 출제한다.

모든 문제는 암기만으로 해결 가능해야 하며, 계산이 필요한 문제는 생성하지 않는다.

---

### Input UI

Trigonometry Keypad

```text
7 8 9

4 5 6

1 2 3

0   /   √

⌫      확인
```

---

### Supported Values

| Angle |
| ------- |
| 0° |
| 30° |
| 45° |
| 60° |
| 90° |
| 120° |
| 135° |
| 150° |
| 180° |
| 210° |
| 225° |
| 240° |
| 270° |
| 300° |
| 315° |
| 330° |
| 360° |

---

### Supported Functions

- sin
- cos
- tan

---

### Supported Answers

```text
0

1

-1

1/2

-1/2

√2/2

-√2/2

√3/2

-√3/2

√3

-√3

√3/3

-√3/3
```

---

### Validation Rules

- 문자열이 아닌 수학적 동치 여부를 비교한다.
- 기약분수만 인정한다.
- 약분되지 않은 분수는 오답 처리한다.
- tan이 정의되지 않는 각도는 생성하지 않는다.

---

### Templates

#### TRIG_T1

**Description**

단일 삼각함수 값 계산

**Weight**

30

**Parameters**

| Name | Range |
|------|-------|
| Function | sin, cos, tan |
| Angle | Supported Values |

**Examples**

```text
sin(30°)
```

↓

```text
1/2
```

---

```text
cos(150°)
```

↓

```text
-√3/2
```

---

#### TRIG_T2

**Description**

삼각함수 덧셈

**Weight**

20

**Parameters**

두 개의 특수각 삼각함수를 생성한다.

결과는 Supported Answers 범위 안에서만 생성한다.

**Examples**

```text
sin(30°)+cos(60°)
```

↓

```text
1
```

---

```text
sin(45°)+cos(45°)
```

↓

```text
√2
```

---

#### TRIG_T3

**Description**

삼각함수 뺄셈

**Weight**

10

**Examples**

```text
cos(60°)-sin(30°)
```

↓

```text
0
```

---

#### TRIG_T4

**Description**

상수와의 곱셈

**Weight**

15

**Parameters**

Multiplier

- 2
- 3

**Examples**

```text
2×sin(30°)
```

↓

```text
1
```

---

```text
2×cos(60°)
```

↓

```text
1
```

---

#### TRIG_T5

**Description**

상수와의 나눗셈

**Weight**

10

**Examples**

```text
tan(60°)÷√3
```

↓

```text
1
```

---

```text
sin(60°)÷(√3/2)
```

↓

```text
1
```

---

#### TRIG_T6

**Description**

제곱 계산

**Weight**

10

**Examples**

```text
sin²(30°)
```

↓

```text
1/4
```

---

```text
cos²(60°)
```

↓

```text
1/4
```

---

#### TRIG_T7

**Description**

제곱합 계산

**Weight**

5

**Examples**

```text
sin²(45°)+cos²(45°)
```

↓

```text
1
```

---

```text
sin²(30°)+cos²(30°)
```

↓

```text
1
```

## 5.11 Sequence

### Description

Sequence 카테고리는 등차수열과 등비수열의 규칙을 이용하여 다음 항 또는 특정 항을 찾는 문제를 출제한다.

복잡한 점화식이나 합 공식은 사용하지 않는다.

---

### Input UI

Number Keypad

---

### Validation Rules

- 항상 정수만 생성한다.
- 음수는 생성하지 않는다.
- 답은 하나만 존재해야 한다.

---

### Templates

#### SEQ_T1

**Description**

등차수열 다음 항

**Weight**

40

**Parameters**

| Name | Range |
| ------ | ------ |
| First | 1~30 |
| Difference | 1~10 |
| Length | 4 |

**Question**

```text
3, 7, 11, 15, ?
```

**Answer**

```text
19
```

---

#### SEQ_T2

**Description**

등차수열 n번째 항

**Weight**

25

**Question**

```text
2, 5, 8, ...

10번째 항은?
```

**Answer**

```text
29
```

---

#### SEQ_T3

**Description**

등비수열 다음 항

**Weight**

25

**Parameters**

| Name | Range |
| ------ | ------ |
| Ratio | 2~5 |

**Question**

```text
3, 6, 12, 24, ?
```

**Answer**

```text
48
```

---

#### SEQ_T4

**Description**

빈칸 채우기

**Weight**

10

**Question**

```text
5, 10, ?, 20
```

**Answer**

```text
15
```

---

## 5.12 Probability

### Description

Probability 카테고리는 기본적인 확률 계산 문제를 출제한다.

답은 항상 기약분수 또는 정수이며, 복잡한 조합(Combination)이나 순열(Permutation)을 요구하는 문제는 생성하지 않는다.

---

### Input UI

Fraction Keypad

---

### Validation Rules

- 기약분수만 정답으로 인정한다.
- 분모는 항상 양수이다.
- 소수 입력은 허용하지 않는다.
- 답은 항상 하나만 존재해야 한다.
- 모든 문제는 암산 또는 간단한 계산만으로 해결 가능해야 한다.

---

### Templates

#### PROB_T1

**Description**

단일 선택 확률

**Weight**

45

**Parameters**

| Name | Range |
|------|-------|
| Theme | 공, 카드, 학생, 과일, 사탕, 동물 등 |
| Total | 5~20 |
| Target | 1~Total-1 |

**Generation Rules**

- 모든 경우의 수는 동일한 확률을 가진다.
- 정답은 항상 기약분수로 표현 가능해야 한다.

**Examples**

```text
공이 10개 있다.

빨간 공은 4개이다.

빨간 공을 뽑을 확률은?
```

↓

```text
2/5
```

---

```text
학생이 15명 있다.

안경을 쓴 학생은 3명이다.

안경을 쓴 학생을 뽑을 확률은?
```

↓

```text
1/5
```

---

```text
바구니에 과일이 12개 있다.

사과는 6개이다.

사과를 뽑을 확률은?
```

↓

```text
1/2
```

---

#### PROB_T2

**Description**

주사위 확률

**Weight**

25

**Parameters**

| Name | Range |
|------|-------|
| Condition | 특정 숫자, 홀수, 짝수, 3의 배수 |

**Examples**

```text
주사위를 한 번 던질 때

짝수가 나올 확률은?
```

↓

```text
1/2
```

---

```text
주사위를 한 번 던질 때

5가 나올 확률은?
```

↓

```text
1/6
```

---

```text
주사위를 한 번 던질 때

3의 배수가 나올 확률은?
```

↓

```text
1/3
```

---

#### PROB_T3

**Description**

동전 확률

**Weight**

15

**Parameters**

| Name | Range |
|------|-------|
| Flip Count | 1~3 |
| Condition | 앞면 개수, 뒷면 개수 |

**Generation Rules**

- 경우의 수가 너무 커지는 문제는 생성하지 않는다.

**Examples**

```text
동전을 한 번 던질 때

앞면이 나올 확률은?
```

↓

```text
1/2
```

---

```text
동전을 두 번 던질 때

앞면이 두 번 나올 확률은?
```

↓

```text
1/4
```

---

```text
동전을 세 번 던질 때

앞면이 정확히 두 번 나올 확률은?
```

↓

```text
3/8
```

---

#### PROB_T4

**Description**

번호 선택 확률

**Weight**

15

**Parameters**

| Name | Range |
|------|-------|
| Max Number | 6~20 |
| Condition | 홀수, 짝수, 배수 |

**Examples**

```text
1부터 12까지의 수 중

짝수일 확률은?
```

↓

```text
1/2
```

---

```text
1부터 15까지의 수 중

5의 배수일 확률은?
```

↓

```text
1/5
```

---

```text
1부터 18까지의 수 중

3의 배수일 확률은?
```

↓

```text
1/3
```

## 5.13 Powers

### Description

Powers 카테고리는 거듭제곱 값을 계산하는 문제를 출제한다.

모든 문제는 암산 또는 짧은 계산만으로 해결 가능해야 하며, 지나치게 큰 수가 생성되지 않도록 Parameter를 제한한다.

---

### Input UI

Number Keypad

---

### Validation Rules

- 정답은 항상 양의 정수이다.
- 지수는 항상 2 이상이다.
- 지나치게 큰 결과값은 생성하지 않는다.
- 답은 하나만 존재해야 한다.

---

### Parameter Constraints

| Base | Exponent |
|------|----------|
| 2 | 2 ~ 10 |
| 3 | 2 ~ 5 |
| 4 | 2 ~ 5 |
| 5 | 2 ~ 4 |
| 6 | 2 ~ 3 |
| 7 | 2 ~ 3 |
| 8 | 2 ~ 3 |
| 9 | 2 ~ 3 |
| 10 | 2 ~ 3 |

---

### Templates

#### POWER_T1

**Description**

제곱 계산

**Weight**

50

**Parameters**

| Name | Range |
|------|-------|
| Number | 2 ~ 30 |

**Question**

```text
17²
```

**Answer**

```text
289
```

---

#### POWER_T2

**Description**

세제곱 계산

**Weight**

25

**Parameters**

| Name | Range |
|------|-------|
| Number | 2 ~ 10 |

**Question**

```text
6³
```

**Answer**

```text
216
```

---

#### POWER_T3

**Description**

거듭제곱 계산

**Weight**

25

**Parameters**

Base와 Exponent는 Parameter Constraints를 따른다.

**Question**

```text
2⁸
```

**Answer**

```text
256
```

---

### Example Questions

```text
13²
```

↓

169

---

```text
5³
```

↓

125

---

```text
3⁵
```

↓

243

---

```text
2¹⁰
```

↓

1024

---

## 5.14 Roots

### Description

Roots 카테고리는 제곱근과 세제곱근을 이용한 문제를 출제한다.

모든 문제는 완전제곱수 또는 완전세제곱수만 사용한다.

---

### Input UI

Number Keypad

---

### Validation Rules

- 항상 정수만 생성한다.
- 음수는 생성하지 않는다.
- 무리수는 생성하지 않는다.
- 답은 하나만 존재해야 한다.

---

### Templates

#### ROOT_T1

**Description**

제곱근 계산

**Weight**

45

**Parameters**

| Name | Range |
|------|-------|
| Number | 1² ~ 30² |

**Question**

```text
√225
```

**Answer**

```text
15
```

---

#### ROOT_T2

**Description**

빈칸 채우기

**Weight**

35

**Question**

```text
□² = 196
```

**Answer**

```text
14
```

---

#### ROOT_T3

**Description**

세제곱근 계산

**Weight**

20

**Parameters**

| Name | Range |
|------|-------|
| Number | 2³ ~ 10³ |

**Question**

```text
³√512
```

**Answer**

```text
8
```

---

### Example Questions

```text
√324
```

↓

18

---

```text
□² = 289
```

↓

17

---

```text
³√729
```

↓

9

---

## 5.15 Fraction

### Description

Fraction 카테고리는 분수의 사칙연산과 약분 문제를 출제한다.

답은 항상 기약분수 또는 정수이다.

---

### Input UI

Fraction Keypad

---

### Validation Rules

- 기약분수만 인정한다.
- 분모는 항상 양수이다.
- 소수 입력은 허용하지 않는다.
- 약분되지 않은 답은 오답 처리한다.

---

### Templates

#### FRAC_T1

**Description**

분수 덧셈

**Weight**

30

**Parameters**

분모는 2~12 범위에서 생성한다.

**Question**

```text
1/4 + 1/2
```

**Answer**

```text
3/4
```

---

#### FRAC_T2

**Description**

분수 뺄셈

**Weight**

20

**Question**

```text
5/6 - 1/3
```

**Answer**

```text
1/2
```

---

#### FRAC_T3

**Description**

분수 곱셈

**Weight**

25

**Question**

```text
2/3 × 3/5
```

**Answer**

```text
2/5
```

---

#### FRAC_T4

**Description**

분수 나눗셈

**Weight**

15

**Question**

```text
3/4 ÷ 1/2
```

**Answer**

```text
3/2
```

---

#### FRAC_T5

**Description**

약분하기

**Weight**

10

**Question**

```text
12/18
```

**Answer**

```text
2/3
```

---

### Example Questions

```text
2/5 + 1/5
```

↓

3/5

---

```text
3/8 × 4/9
```

↓

1/6

---

```text
10/15
```

↓

2/3

---

```text
5/6 ÷ 5/12
```

↓

2

## Equation

### Description

간단한 방정식을 해결하여 미지수의 값을 구한다.

모든 문제는 암산 또는 간단한 계산만으로 해결 가능해야 하며, 정답은 항상 정수이다.

---

### Answer Format

- Integer

---

### Templates

#### EQ_T1

**Description**

일차방정식

**Weight**

40

**Parameters**

| Name | Range |
|------|-------|
| Coefficient | 1~10 |
| Answer | -20~20 |

**Generation Rules**

- 해는 항상 정수이다.
- 식은 한 번의 계산으로 해결 가능해야 한다.

**Examples**

```text
2x+3=11
```

↓

```text
4
```

---

```text
5x-10=15
```

↓

```text
5
```

---

#### EQ_T2

**Description**

빈칸 채우기

**Weight**

25

**Parameters**

| Name | Range |
|------|-------|
| Answer | -20~20 |

**Examples**

```text
□+8=15
```

↓

```text
7
```

---

```text
4×□=28
```

↓

```text
7
```

---

#### EQ_T3

**Description**

지수방정식

**Weight**

20

**Parameters**

| Name | Range |
|------|-------|
| Base | 2~5 |
| Exponent | 2~6 |

**Generation Rules**

- 좌변은 항상 Base^x 형태이다.
- 답은 항상 정수이다.

**Examples**

```text
2^x=32
```

↓

```text
5
```

---

```text
3^x=27
```

↓

```text
3
```

---

#### EQ_T4

**Description**

로그방정식

**Weight**

15

**Parameters**

| Name | Range |
|------|-------|
| Base | 2~5 |
| Answer | 1~6 |

**Generation Rules**

- 로그값은 항상 정수이다.
- 진수는 Base^Answer 형태로 생성한다.

**Examples**

```text
log₂32=x
```

↓

```text
5
```

---

```text
log₃81=x
```

↓

```text
4
```

## Divisor

### Description

약수와 최대공약수를 계산한다.

---

### Answer Format

- Integer

---

### Templates

#### DIV_T1

**Description**

약수 개수

**Weight**

35

**Parameters**

| Name | Range |
|------|-------|
| Number | 4~100 |

**Generation Rules**

- 약수 개수가 너무 많아지는 수는 생성하지 않는다.

**Examples**

```text
12의 약수는 몇 개인가?
```

↓

```text
6
```

---

```text
18의 약수는 몇 개인가?
```

↓

```text
6
```

---

#### DIV_T2

**Description**

최대공약수

**Weight**

45

**Parameters**

| Name | Range |
|------|-------|
| A | 4~50 |
| B | 4~50 |

**Generation Rules**

- 암산 가능한 범위만 생성한다.

**Examples**

```text
18과 24의 최대공약수
```

↓

```text
6
```

---

```text
12와 20의 최대공약수
```

↓

```text
4
```

---

#### DIV_T3

**Description**

약수 판별

**Weight**

20

**Parameters**

| Name | Range |
|------|-------|
| Number | 4~100 |
| Candidate | 2~20 |

**Examples**

```text
6은 24의 약수인가?

(1: 예 / 0: 아니오)
```

↓

```text
1
```

---

```text
8은 30의 약수인가?

(1: 예 / 0: 아니오)
```

↓

```text
0
```

## Multiple

### Description

배수와 최소공배수를 계산한다.

---

### Answer Format

- Integer

---

### Templates

#### MUL_T1

**Description**

최소공배수

**Weight**

45

**Parameters**

| Name | Range |
|------|-------|
| A | 2~20 |
| B | 2~20 |

**Generation Rules**

- 최소공배수는 200 이하만 생성한다.

**Examples**

```text
6과 8의 최소공배수
```

↓

```text
24
```

---

```text
9와 12의 최소공배수
```

↓

```text
36
```

---

#### MUL_T2

**Description**

배수 판별

**Weight**

25

**Parameters**

| Name | Range |
|------|-------|
| Number | 2~100 |
| Candidate | 2~20 |

**Examples**

```text
24는 6의 배수인가?

(1: 예 / 0: 아니오)
```

↓

```text
1
```

---

```text
35는 8의 배수인가?

(1: 예 / 0: 아니오)
```

↓

```text
0
```

---

#### MUL_T3

**Description**

n번째 배수

**Weight**

30

**Parameters**

| Name | Range |
|------|-------|
| Number | 2~12 |
| Index | 2~10 |

**Examples**

```text
7의 5번째 배수
```

↓

```text
35
```

---

```text
9의 4번째 배수
```

↓

```text
36
```

# Global Generation Rules

모든 Math Event 문제 생성기는 아래 규칙을 반드시 만족해야 한다.

---

## Difficulty

- 모든 문제는 제한시간(5초) 안에 암산 또는 간단한 계산만으로 해결 가능해야 한다.
- 계산량보다 문제 유형의 다양성을 우선한다.
- 문제는 직관적으로 풀이 방법이 떠오르는 수준이어야 한다.

---

## Answer

- 정답은 항상 하나만 존재해야 한다.
- 모든 문제는 자동 채점이 가능해야 한다.
- 소수는 사용하지 않는다.
- 분수는 항상 기약분수로 입력한다.

---

## Parameter

- Parameter는 항상 유효한 문제만 생성해야 한다.
- 생성된 문제는 예외 상황이 없어야 한다.
- 모든 Parameter는 난이도를 크게 증가시키지 않는 범위에서만 선택한다.

---

## Number Range

- 지나치게 큰 수는 생성하지 않는다.
- 계산이 복잡한 수는 생성하지 않는다.
- 암산 가능한 범위를 유지한다.

---

## Fraction

- 정답은 항상 기약분수이다.
- 분모는 0이 될 수 없다.
- 음수 분모는 생성하지 않는다.

---

## Root

- 루트 내부는 항상 완전제곱수 또는 완전세제곱수이다.
- 무리수 계산은 요구하지 않는다.

---

## Power

- 거듭제곱은 암산 가능한 범위만 생성한다.

Example

```text
2¹⁰
```

가능

```text
19⁵
```

불가능

---

## Trigonometry

- 특수각만 사용한다.
- 결과는 Supported Answers 목록 안에서만 생성한다.
- 일반각, 라디안, 역삼각함수는 생성하지 않는다.

---

## Probability

- 모든 경우의 수는 동일한 확률을 가진다.
- 조건부확률은 생성하지 않는다.
- 순열·조합은 생성하지 않는다.

---

## Equation

- 해는 항상 정수이다.
- 복잡한 식 변형은 생성하지 않는다.
- 연립방정식은 생성하지 않는다.

---

## Divisor / Multiple

- 최대공약수와 최소공배수는 암산 가능한 범위만 생성한다.
- 약수와 배수의 판별은 한 번의 계산으로 가능해야 한다.

---

## Template

- Template는 계산 방식만 정의한다.
- 실제 문제는 Parameter를 통해 생성한다.
- 하나의 Template에서 다양한 문제가 생성될 수 있어야 한다.

Example

```text
TRIG_T2
```

↓

```text
sin(30°)+cos(60°)
```

또는

```text
sin(45°)+cos(45°)
```

또는

```text
cos(150°)+sin(30°)
```

모두 동일한 Template를 사용한다.

---

## Validation

생성된 모든 문제는 아래 조건을 만족해야 한다.

- 정답이 하나이다.
- 암산이 가능하다.
- 자동 채점이 가능하다.
- Template 규칙을 만족한다.
- 난이도 기준을 만족한다.

# Math Event Generation Flow

Math Event는 아래 순서에 따라 생성된다.

```text
Category 선택
        │
        ▼
Template 선택
        │
        ▼
Parameter 생성
        │
        ▼
Validation
        │
        ▼
Question 생성
        │
        ▼
Answer 생성
        │
        ▼
Client 전송
```

---

## Step 1. Category Selection

등록된 Math Categories 중 하나를 무작위로 선택한다.

Example

```text
Probability
```

↓

```text
Trigonometry
```

↓

```text
Equation
```

---

## Step 2. Template Selection

선택된 Categories 내부에서 Weight를 기반으로 Template를 선택한다.

Example

```text
Probability
```

↓

```text
PROB_T1
```

---

## Step 3. Parameter Generation

Template에 필요한 Parameter를 생성한다.

Example

```text
Theme = 공

Total = 15

Target = 6
```

---

## Step 4. Validation

생성된 Parameter가 모든 규칙을 만족하는지 검사한다.

Validation 실패 시 Parameter를 다시 생성한다.

검사 항목

- 암산 가능한가
- 정답이 하나인가
- Parameter 범위가 올바른가
- Template 규칙을 만족하는가
- 예외 상황이 없는가

---

## Step 5. Question Generation

Template와 Parameter를 이용하여 Question을 생성한다.

Example

```text
공이 15개 있다.

빨간 공은 6개이다.

빨간 공을 뽑을 확률은?
```

---

## Step 6. Answer Generation

동일한 Parameter를 이용하여 정답을 생성한다.

Example

```text
2/5
```

---

## Step 7. Send

Question과 Answer를 Client에 전송한다.

모든 플레이어는 동일한 문제를 받는다.

