# System Design

## System Overview

99 Battle은 모바일 환경을 중심으로 설계된 실시간 멀티플레이 수학 게임이다.

모든 게임 플레이는 모바일 웹(PWA)을 기준으로 구현하며, PC 환경에서도 동일한 기능을 사용할 수 있도록 지원한다.

실시간 게임 진행은 WebSocket을 사용하며, 일반적인 데이터 조회 및 저장은 REST API를 사용한다.

## Client Platform

본 프로젝트는 모바일 웹(PWA)을 우선으로 설계한다.

### Target Platform

- Mobile Web (Primary)
- Desktop Web (Secondary)

### Screen Orientation

모든 게임 화면은 세로(Portrait) 모드를 기준으로 설계한다.

### Responsive Design

- 모바일 화면을 기준으로 UI를 구성한다.
- PC에서는 화면을 중앙에 배치하여 동일한 레이아웃을 제공한다.
- 모든 UI는 다양한 화면 크기에 대응할 수 있도록 Responsive Layout을 적용한다.

## Architecture

```text
             +-----------------------+
             |  Mobile / Desktop Web |
             |        (PWA)          |
             +-----------------------+
                       │
            REST API / WebSocket
                       │
             +-----------------------+
             |     Spring Boot       |
             +-----------------------+
                       │
     ┌─────────────────┼─────────────────┐
     │                 │                 │
+------------+  +--------------+  +--------------+
| Room       |  | Game         |  | Ranking      |
| Service    |  | Service      |  | Service      |
+------------+  +--------------+  +--------------+
                       │
             +-----------------------+
             |   Math Generator      |
             +-----------------------+
                       │
             +-----------------------+
             |        MySQL          |
             +-----------------------+
```

## Core Components

| Component | Responsibility |
|-----------|----------------|
| Client | 사용자 입력 및 UI 렌더링 |
| Room Service | 게임방 생성 및 참가 |
| Game Service | 게임 진행 및 상태 관리 |
| Math Generator | 수학 문제 생성 |
| Ranking Service | 랭킹 계산 및 조회 |
| User Service | 사용자 정보 관리 |
| Database | 사용자 및 게임 데이터 저장 |

WAITING

↓

READY

↓

COUNTDOWN

↓

PLAYING

↓

RESULT

↓

FINISHED

| State     | Description |
| --------- | ----------- |
| WAITING   | 플레이어 입장     |
| READY     | 준비 완료       |
| COUNTDOWN | 게임 시작 대기    |
| PLAYING   | 게임 진행       |
| RESULT    | 결과 표시       |
| FINISHED  | 게임 종료       |

Create Room

↓

Join Room

↓

Ready

↓

Countdown

↓

Game Start

↓

Play

↓

Math Event

↓

Repeat

↓

Result

↓

Lobby

## Communication

### REST API

- Login
- Room
- Ranking
- User

### WebSocket

- Player Ready
- Game Start
- Player Movement
- Math Event
- Answer Submit
- Game End


Category

↓

Template

↓

Parameter

↓

Validation

↓

Question

↓

Broadcast

↓

Player Answer

↓

Result

| Situation      | Action |
| -------------- | ------ |
| Disconnect     | 재접속 대기 |
| Timeout        | 미응답 처리 |
| Invalid Answer | 오답 처리  |
| Room Full      | 입장 거부  |
| Server Error   | 게임 종료  |