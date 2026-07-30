// Soft pastel tones for avatar backgrounds (matches the original sky-blue profile look)
const PLAYER_COLORS_SOFT = [
  '#B5D5FC', // blue
  '#BBEFD1', // green
  '#FFD9AE', // orange
  '#DACCFB', // purple
  '#FBD0E8', // pink
  '#BDEEE6', // teal
] as const

// Vivid tones for use on dark backgrounds (chat text) where pastel would be low-contrast
const PLAYER_COLORS_VIVID = [
  '#0064FE', // blue
  '#22C55E', // green
  '#FB923C', // orange
  '#8B5CF6', // purple
  '#F472B6', // pink
  '#14B8A6', // teal
] as const

export function getPlayerColor(index: number): string {
  return PLAYER_COLORS_SOFT[index % PLAYER_COLORS_SOFT.length]
}

export function getPlayerTextColor(index: number): string {
  return PLAYER_COLORS_VIVID[index % PLAYER_COLORS_VIVID.length]
}
