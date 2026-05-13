/**
 * Extract a human-readable `detail` from FastAPI error payloads.
 *
 * Shape patterns:
 * - { detail: "Out of stock" }
 * - { detail: [ { msg: "...", loc: [...] }, ... ] }
 */

export function getErrorMessage(error, fallback = 'Something went wrong') {
  if (!error) return fallback
  if (typeof error.message === 'string' && error.message.trim()) return error.message
  return fallback
}

export function extractApiErrorMessage(error, fallback = 'Something went wrong') {
  // Axios error usually looks like: { response: { data: {detail: ...} } }
  const payload = error?.response?.data
  const detail = payload?.detail ?? payload?.message ?? payload

  if (typeof detail === 'string' && detail.trim()) return detail

  if (Array.isArray(detail)) {
    const parts = detail
      .map((d) => {
        if (typeof d === 'string') return d
        if (d?.msg && typeof d.msg === 'string') return d.msg
        return null
      })
      .filter(Boolean)
    return parts.length ? parts.join('; ') : fallback
  }

  if (detail && typeof detail === 'object') {
    if (typeof detail.msg === 'string' && detail.msg.trim()) return detail.msg
    if (typeof detail.detail === 'string' && detail.detail.trim()) return detail.detail
  }

  return getErrorMessage(error, fallback)
}
