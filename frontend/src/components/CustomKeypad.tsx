import { Delete, Check } from 'lucide-react'
import type { AnswerType } from '../types/game'

const LAYOUTS: Record<AnswerType, string[][]> = {
  NUMBER: [
    ['7', '8', '9'],
    ['4', '5', '6'],
    ['1', '2', '3'],
    ['', '0', '⌫'],
  ],
  FRACTION: [
    ['7', '8', '9'],
    ['4', '5', '6'],
    ['1', '2', '3'],
    ['/', '0', '⌫'],
  ],
  TRIG: [
    ['7', '8', '9'],
    ['4', '5', '6'],
    ['1', '2', '3'],
    ['√', '0', '/'],
    ['±', '⌫', ''],
  ],
}

interface CustomKeypadProps {
  variant: AnswerType
  value: string
  onInput: (char: string) => void
  onBackspace: () => void
  onToggleSign: () => void
  onSubmit: () => void
  disabled: boolean
}

export default function CustomKeypad({
  variant,
  value,
  onInput,
  onBackspace,
  onToggleSign,
  onSubmit,
  disabled,
}: CustomKeypadProps) {
  const layout = LAYOUTS[variant]

  function handleKey(key: string) {
    if (disabled || key === '') return
    if (key === '⌫') {
      onBackspace()
    } else if (key === '±') {
      onToggleSign()
    } else {
      onInput(key)
    }
  }

  return (
    <div className="flex w-full flex-col gap-[var(--keypad-gap)]">
      <div className="flex flex-col gap-[var(--keypad-gap)]">
        {layout.map((row, rowIdx) => (
          <div key={rowIdx} className="grid grid-cols-3 gap-[var(--keypad-gap)]">
            {row.map((key, colIdx) => {
              if (key === '') {
                return <div key={colIdx} />
              }
              const isFunctionKey = key === '⌫' || key === '±' || key === '/' || key === '√'
              return (
                <button
                  key={colIdx}
                  type="button"
                  disabled={disabled}
                  onClick={() => handleKey(key)}
                  className={`flex items-center justify-center rounded-[var(--radius-card)] text-xl font-bold transition active:scale-[0.95] disabled:opacity-40 ${
                    isFunctionKey
                      ? 'bg-[var(--color-bg)] text-[var(--color-primary)]'
                      : 'bg-[var(--color-surface)] text-[var(--color-ink)] shadow-sm'
                  } h-[var(--keypad-key-h)]`}
                >
                  {key === '⌫' ? <Delete size={20} /> : key}
                </button>
              )
            })}
          </div>
        ))}
      </div>
      <button
        type="button"
        disabled={disabled || value.length === 0}
        onClick={onSubmit}
        className="flex h-[var(--keypad-confirm-h)] w-full items-center justify-center gap-1.5 rounded-[var(--radius-card)] bg-[var(--color-primary)] text-base font-bold text-white shadow-[0_8px_20px_-8px_var(--color-primary)] transition active:scale-[0.98] disabled:bg-[var(--color-border)] disabled:text-[var(--color-muted)] disabled:shadow-none"
      >
        <Check size={18} />
        확인
      </button>
    </div>
  )
}
