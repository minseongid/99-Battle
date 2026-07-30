import type { ReactNode } from 'react'

export default function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen justify-center bg-[var(--color-bg)] sm:bg-[linear-gradient(160deg,var(--color-page-outer-start),var(--color-page-outer-end))] sm:py-8">
      <div className="relative flex w-full max-w-[430px] flex-col bg-[var(--color-bg)] sm:max-h-[calc(100vh-4rem)] sm:overflow-y-auto sm:rounded-[28px] sm:shadow-[0_20px_60px_-12px_rgba(11,27,61,0.35)]">
        {children}
      </div>
    </div>
  )
}
