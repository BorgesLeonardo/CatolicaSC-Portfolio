import sanitizeHtmlLib from 'sanitize-html';

export function sanitizeHtml(input: string): string {
  return sanitizeHtmlLib(input, {
    allowedTags: ['b', 'i', 'em', 'strong', 'a', 'ul', 'ol', 'li', 'p', 'br'],
    allowedAttributes: {
      a: ['href', 'name', 'target', 'rel'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    transformTags: {
      a: sanitizeHtmlLib.simpleTransform('a', { rel: 'noopener noreferrer nofollow' }),
    },
    disallowedTagsMode: 'discard',
    enforceHtmlBoundary: true,
  });
}

export function maskEmail(email: string): string {
  if (!email || typeof email !== 'string' || !email.includes('@')) return email;
  const [user, domain] = email.split('@');
  const visible = user.slice(0, 1);
  const maskedUser = visible + '*'.repeat(Math.max(0, user.length - 1));
  return `${maskedUser}@${domain}`;
}

export function maskCpfCnpj(value: string): string {
  if (!value || typeof value !== 'string') return value;
  const digits = value.replace(/\D+/g, '');
  if (digits.length === 11) {
    // CPF: XXX.XXX.XXX-XX -> mask middle
    return `${digits.slice(0,3)}.***.***-${digits.slice(9,11)}`;
  }
  if (digits.length === 14) {
    // CNPJ: XX.XXX.XXX/0001-XX -> mask middle
    return `${digits.slice(0,2)}.***.***/${digits.slice(8,12)}-${digits.slice(12,14)}`;
  }
  // Fallback: mask middle
  if (digits.length > 4) {
    return `${digits.slice(0,2)}***${digits.slice(-2)}`;
  }
  return value;
}


