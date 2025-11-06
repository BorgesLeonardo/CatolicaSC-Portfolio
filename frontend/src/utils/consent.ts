export const TERMS_VERSION = '1.0.0'

export interface TermsAcceptanceRecord {
  accepted: boolean
  version: string
  acceptedAt: string // ISO timestamp
}

function storageKey(userId: string): string {
  return `terms_acceptance:${userId}`
}

export function getTermsAcceptance(userId: string): TermsAcceptanceRecord | null {
  try {
    const raw = localStorage.getItem(storageKey(userId))
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<TermsAcceptanceRecord>
    if (!parsed || typeof parsed !== 'object') return null
    if (typeof parsed.accepted !== 'boolean' || typeof parsed.version !== 'string' || typeof parsed.acceptedAt !== 'string') {
      return null
    }
    return parsed as TermsAcceptanceRecord
  } catch {
    return null
  }
}

export function hasAcceptedCurrentTerms(userId: string): boolean {
  const rec = getTermsAcceptance(userId)
  return !!rec && rec.accepted === true && rec.version === TERMS_VERSION
}

export function setTermsAccepted(userId: string, version = TERMS_VERSION): void {
  const record: TermsAcceptanceRecord = {
    accepted: true,
    version,
    acceptedAt: new Date().toISOString()
  }
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify(record))
    // Optional cookie mirror (readable on server/CDN if ever needed)
    const exp = new Date()
    exp.setFullYear(exp.getFullYear() + 1)
    document.cookie = `${encodeURIComponent(storageKey(userId))}=${encodeURIComponent(record.version)}; expires=${exp.toUTCString()}; path=/`;
  } catch {
    // ignore
  }
}




