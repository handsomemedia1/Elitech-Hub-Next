import sanitizeHtml from 'sanitize-html';

/**
 * Cleans writer-submitted article HTML before it is rendered with
 * dangerouslySetInnerHTML. Articles come from external contributors, so
 * anything that can run script (script/style tags, on* handlers,
 * javascript: URLs, arbitrary iframes) must be stripped.
 *
 * The allowlist covers every tag the existing articles use, plus a few
 * common editor tags. Server-side only.
 */
const OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    'p', 'br', 'hr', 'div', 'span',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'strong', 'b', 'em', 'i', 'u', 's', 'sub', 'sup', 'mark', 'small',
    'a', 'img', 'figure', 'figcaption',
    'ul', 'ol', 'li', 'blockquote', 'pre', 'code',
    'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption', 'colgroup', 'col',
    'iframe',
  ],
  allowedAttributes: {
    '*': ['class', 'style', 'id'],
    a: ['href', 'target', 'rel', 'title'],
    img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
    iframe: ['src', 'width', 'height', 'title', 'allow', 'allowfullscreen', 'frameborder'],
    th: ['colspan', 'rowspan', 'scope'],
    td: ['colspan', 'rowspan'],
    ol: ['start', 'type'],
  },
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  allowedSchemesByTag: { img: ['http', 'https', 'data'] },
  allowProtocolRelative: false,
  // Only video embeds from these hosts survive; any other iframe is removed.
  allowedIframeHostnames: ['www.youtube.com', 'www.youtube-nocookie.com', 'player.vimeo.com'],
  transformTags: {
    // The article page already renders the title as the only <h1>; headings
    // pasted into the body would create a second one, so demote them.
    h1: 'h2',
    // Links that open a new tab must not get a handle on window.opener.
    a: (tagName, attribs) => {
      if (attribs.target === '_blank') {
        const rel = new Set((attribs.rel || '').split(/\s+/).filter(Boolean));
        rel.add('noopener');
        rel.add('noreferrer');
        attribs.rel = Array.from(rel).join(' ');
      }
      return { tagName, attribs };
    },
  },
};

export function sanitizeArticleHtml(html: string | null | undefined): string {
  if (!html) return '';
  return sanitizeHtml(html, OPTIONS);
}
