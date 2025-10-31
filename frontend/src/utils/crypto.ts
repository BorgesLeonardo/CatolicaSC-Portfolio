export function cryptoRandomUuid(): string {
  const c = (globalThis as unknown as { crypto?: Crypto }).crypto
  try {
    if (c && typeof c.randomUUID === 'function') {
      return c.randomUUID.call(c)
    }
    if (c && typeof c.getRandomValues === 'function') {
      const bytes = new Uint8Array(16)
      c.getRandomValues(bytes)
      // Per RFC 4122 section 4.4, set version and variant bits
      bytes[6] = (bytes[6] & 0x0f) | 0x40
      bytes[8] = (bytes[8] & 0x3f) | 0x80
      const toHex = (n: number) => n.toString(16).padStart(2, '0')
      const b = Array.from(bytes, toHex).join('')
      return `${b.slice(0,8)}-${b.slice(8,12)}-${b.slice(12,16)}-${b.slice(16,20)}-${b.slice(20)}`
    }
  } catch {
    // ignore and use fallback
  }
  // Minimal non-crypto fallback for very old runtimes; avoids Math.random
  let now = Date.now()
  const template = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
  let out = ''
  for (let i = 0; i < template.length; i++) {
    const ch = template[i]
    if (ch === 'x' || ch === 'y') {
      now = (now + 1) % 16
      const v = ch === 'x' ? now : ((now & 0x3) | 0x8)
      out += v.toString(16)
    } else {
      out += ch
    }
  }
  return out
}


