import { sanitizeHtml, maskEmail, maskCpfCnpj } from '../../../utils/sanitize'

describe('sanitize utils', () => {
  it('sanitizeHtml should remove disallowed tags and attributes', () => {
    const input = '<script>alert(1)</script><a href="http://example.com" onclick="hack()">link</a>'
    const out = sanitizeHtml(input)
    expect(out).toContain('<a href="http://example.com"')
    expect(out).not.toContain('onclick=')
    expect(out).not.toContain('<script>')
  })

  it('maskEmail should mask all but first char of user', () => {
    expect(maskEmail('u@example.com')).toBe('u@example.com')
    expect(maskEmail('john.doe@example.com')).toBe('j*******@example.com')
    expect(maskEmail('invalid')).toBe('invalid')
  })

  it('maskCpfCnpj should mask cpf/cnpj and generic digits', () => {
    expect(maskCpfCnpj('123.456.789-01')).toBe('123.***.***-01')
    expect(maskCpfCnpj('12.345.678/0001-90')).toBe('12.***.***/0001-90')
    expect(maskCpfCnpj('123456')).toBe('12***56')
    expect(maskCpfCnpj('')).toBe('')
  })
})


