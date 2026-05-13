/**
 * Debounce a rapidly changing value (e.g. search text) to avoid expensive work.
 */

import { useEffect, useState } from 'react'

export function useDebouncedValue(value, delayMs = 250) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(t)
  }, [value, delayMs])

  return debounced
}
