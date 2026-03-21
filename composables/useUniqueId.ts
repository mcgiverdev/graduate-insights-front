let idCounter = 0

export function useUniqueId() {
  return `id-${++idCounter}`
}
