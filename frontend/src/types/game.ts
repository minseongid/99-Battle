export type GamePhase = 'QUESTION' | 'RESULT' | 'EVENT_INTRO' | 'GAME_END'
export type SegmentType = 'STAGE' | 'EVENT'
export type AnswerType = 'NUMBER' | 'FRACTION' | 'TRIG'
export type MathCategory =
  | 'TRIGONOMETRY'
  | 'SEQUENCE'
  | 'PROBABILITY'
  | 'POWERS'
  | 'ROOTS'
  | 'FRACTION'
  | 'EQUATION'
  | 'DIVISOR'
  | 'MULTIPLE'

export interface PlayerResultDto {
  playerId: string
  nickname: string
  colorIndex: number
  submittedAnswer: string | null
  correct: boolean
  timedOut: boolean
  forfeited: boolean
  pointsDelta: number
  totalScore: number
  rank: number
}

export interface PlayerRankingDto {
  playerId: string
  nickname: string
  colorIndex: number
  totalScore: number
  rank: number
  forfeited: boolean
}

export interface GameMessage {
  phase: GamePhase
  segmentIndex: number | null
  totalSegments: number | null
  segmentType: SegmentType | null
  eventCategory: MathCategory | null
  segmentLabel: string | null
  segmentDescription: string | null
  questionIndex: number | null
  questionsInSegment: number | null
  questionText: string | null
  answerType: AnswerType | null
  timeLimitSeconds: number | null
  questionStartAtEpochMs: number | null
  correctAnswerDisplay: string | null
  results: PlayerResultDto[] | null
  finalRanking: PlayerRankingDto[] | null
}
