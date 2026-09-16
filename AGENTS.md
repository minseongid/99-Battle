# Codex 작업 지침

이 저장소에서 작업을 시작하기 전에 반드시 아래 순서로 읽으세요.

1. `HANDOFF.md` — 지금까지 진행 상황, 이번에 할 일, 꼭 알아야 할 이슈 요약
2. `CLAUDE.md` — 이 프로젝트의 개발 규칙 (No-Scroll Policy 등, 위반하면 안 되는 규칙들)
3. `GAME_DESIGN.md`, `SYSTEM_DESIGN.md`, `UI_UX.md` — 기획 스펙 (구현 전 관련 섹션 확인)

## 가장 중요한 규칙 요약 (자세한 내용은 위 문서 참고)

- **No-Scroll Policy**: Room/Game/Result 등 대부분 화면은 페이지 자체가 스크롤되면 안 됩니다. 새 화면 작업을 끝낼 때마다 375×667, 1366×768, 1280×1200 세 가지 뷰포트에서 `document.documentElement.scrollHeight - window.innerHeight`가 0인지 실측하세요.
- 기획 문서(`GAME_DESIGN.md`/`SYSTEM_DESIGN.md`/`UI_UX.md`)에 없는 기능은 임의로 추가하지 말고 먼저 사용자에게 물어보세요.
- `backend/src/main/java/com/battle99/backend/game/GameEngineService.java`의 `FAST_TEST_MODE = true`는 테스트 편의를 위한 **임시** 플래그입니다 (스테이지당 문제 1개, 제한시간 1초). 사용자가 명시적으로 요청하기 전까지 건드리지 마세요.
- 코드를 고친 뒤에는 타입체크/빌드만으로 끝내지 말고, 실제로 로컬 서버(프론트+백엔드)를 띄워서 브라우저로 확인한 뒤에만 "완료"라고 답하세요. 실시간 멀티플레이 기능은 여러 플레이어가 동시에 있을 때를 가정하고 확인하세요.
- 사용자는 한국어로 대화하고, 스크린샷을 보여주며 구체적으로 피드백하는 방식을 선호합니다. 답변도 한국어로, 간결하게.
