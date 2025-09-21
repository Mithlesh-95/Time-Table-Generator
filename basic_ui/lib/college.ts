export function parseJwt(token: string | null): any | null {
  if (!token) return null
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    }).join(''))
    return JSON.parse(jsonPayload)
  } catch {
    return null
  }
}

export function getCollegeCode(): string {
  if (typeof window === 'undefined') return ''
  const lsCode = localStorage.getItem('college_code')
  if (lsCode) {
    const trimmed = lsCode.trim()
    if (trimmed && trimmed !== '[object Object]') return trimmed
    if (trimmed === '[object Object]') localStorage.removeItem('college_code')
  }
  const token = localStorage.getItem('access_token')
  const payload = parseJwt(token)
  const byClaim = payload?.college_code || payload?.college || payload?.user?.college_code
  if (typeof byClaim === 'string' && byClaim.trim()) return byClaim.trim()
  if (byClaim && typeof byClaim === 'object' && typeof byClaim.code === 'string') return byClaim.code.trim()
  return ''
}

export function subscribeCollegeCode(callback: (code: string) => void): () => void {
  if (typeof window === 'undefined') return () => {}
  const storageHandler = (e: StorageEvent) => {
    if (e.key === 'college_code') {
      callback(getCollegeCode())
    }
    if (e.key === 'access_token') {
      callback(getCollegeCode())
    }
  }
  const customHandler = () => callback(getCollegeCode())
  window.addEventListener('storage', storageHandler)
  window.addEventListener('college_code_changed', customHandler as EventListener)
  return () => {
    window.removeEventListener('storage', storageHandler)
    window.removeEventListener('college_code_changed', customHandler as EventListener)
  }
}

export function setCollegeCode(code: string) {
  if (typeof window === 'undefined') return
  localStorage.setItem('college_code', code)
  // Notify same-tab listeners as storage event won't fire here
  window.dispatchEvent(new CustomEvent('college_code_changed'))
}
