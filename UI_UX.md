# UI / UX Design

## Design Philosophy

99 Battle은 모바일 환경에서 빠르고 직관적인 플레이를 목표로 한다.

모든 화면은 세로(Portrait) 모드를 기준으로 설계하며,
한 손으로도 쉽게 조작할 수 있는 UI를 제공한다.

복잡한 요소를 최소화하고,
플레이어가 게임 진행과 문제 풀이에만 집중할 수 있도록 심플한 인터페이스를 지향한다.

---

## Design Keywords

- Mobile First
- Clean
- Simple
- Minimal
- Fast Interaction
- One-Hand Play
- Real-Time Feedback

---

## Color System

Primary

- Blue

Secondary

- White

Accent

- Sky Blue
- Light Gray

Error

- Red

Success

- Green

전체적인 UI는 화이트를 기본으로 하며,
주요 버튼과 강조 요소에는 블루 계열을 사용한다.

---

## Typography

- 큰 제목
- 높은 가독성
- Bold 중심
- 최소한의 텍스트

게임 중에는 플레이어가 문제를 빠르게 읽을 수 있도록
불필요한 설명은 최소화한다.

---

## Component Design

모든 컴포넌트는 둥근 모서리(Rounded Rectangle)를 기본 형태로 사용한다.

### Button

- Large Size
- Rounded Corner
- Blue / White Theme
- Clear Press Feedback

### Card

- White Background
- Rounded Corner
- Soft Shadow

### Input

직접 키보드를 사용하지 않는다.

모든 숫자 입력은 게임에서 제공하는 전용 숫자 키패드를 사용한다.

---

## Custom Numeric Keypad

게임 플레이 중에는 시스템 키보드를 사용하지 않는다.

모든 답안 입력은 자체 제작한 숫자 키패드를 통해 이루어진다.

### Purpose

- 빠른 입력
- 오입력 감소
- 모든 플랫폼에서 동일한 UX 제공

### Layout

```
7 8 9

4 5 6

1 2 3

← 0 확인
```

### Design

- 큰 버튼
- 넓은 터치 영역
- 한 손 조작 가능
- 즉각적인 터치 피드백

---

## Screen Layout

모든 화면은 세로 화면을 기준으로 구성한다.

상단

- 게임 정보
- 타이머

중앙

- 게임 플레이 영역

하단

- 전용 숫자 키패드

---

## Responsive Design

Primary

- Mobile Web

Secondary

- Desktop Web

PC에서는 모바일 화면 비율을 유지한 상태로 중앙에 배치한다.

게임 플레이 방식은 모든 플랫폼에서 동일하다.

---

## Animation

과도한 애니메이션은 사용하지 않는다.

사용하는 애니메이션

- Fade
- Scale
- Slide

애니메이션은 게임 진행을 방해하지 않는 수준으로 제한한다.

---

## Sound Design

사운드는 게임의 몰입감을 높이는 보조 요소로 활용한다.

### BGM

- Lobby
- In Game
- Result

### Stage 4+

Stage 4부터는 제한 시간이 짧아지므로
긴장감을 높일 수 있는 BGM을 사용한다.

음악의 템포 변화와 함께 플레이어가 시간 압박을 자연스럽게 인식할 수 있도록 설계한다.

### Sound Effect

- 버튼 클릭
- 정답
- 오답
- 카운트다운
- 게임 시작
- 게임 종료

---

## UX Principles

### One-Hand Interaction

모든 주요 버튼은 엄지손가락으로 쉽게 누를 수 있는 위치에 배치한다.

### Large Touch Area

작은 버튼 대신 큰 터치 영역을 제공하여 오입력을 최소화한다.

### Immediate Feedback

모든 입력은 즉시 시각적·청각적 피드백을 제공한다.

### Focus on Gameplay

게임 진행 중에는 불필요한 UI를 제거하여
플레이어가 문제 풀이에 집중할 수 있도록 한다.

### Consistency

모든 화면에서 동일한 색상, 버튼, 간격, 인터랙션을 유지하여
학습 비용을 최소화한다.

## Visual Style

- 충분한 여백(Whitespace)
- 낮은 시각적 복잡도
- 플랫 디자인 기반
- 제한된 컬러 팔레트 사용

Border Radius : 16px
Spacing : 8px Grid
Shadow : Soft
Animation : Fast (150~250ms)

---

## Design Reference

본 프로젝트의 UI/UX는 아래 디자인 샘플의 레이아웃, 색상 구성, 여백 활용 및 미니멀한 디자인 철학을 참고하여 설계한다.

### Reference

- `designsample.webp`

### Reference Keywords

- Mobile First
- Clean & Minimal
- Blue & White Theme
- Rounded Rectangle Components
- Large Touch Targets
- Spacious Whitespace
- Modern Startup UI
- Simple Animation
- High Readability

※ 본 이미지는 전체적인 디자인 방향성과 UI 스타일을 참고하기 위한 자료이며,
실제 화면 구성은 게임 플레이와 모바일 UX에 맞게 재구성하여 구현한다.