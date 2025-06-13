let idCounter = 0

export function useId() {
  return `id-${++idCounter}`
}
