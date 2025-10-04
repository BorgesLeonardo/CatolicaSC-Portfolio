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


