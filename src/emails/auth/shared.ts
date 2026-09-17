import envConfig from '../../../env.config';

export function authURL(pathname: string, token: string) {
  const url = new URL(pathname, envConfig.NEXT_PUBLIC_SERVER_URL);
  url.searchParams.set('token', token);
  return url.toString();
}

export function escapeHTML(value: string) {
  return value.replace(/[&<>'"]/g, (character) => {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[character]!;
  });
}

export function authEmailDocument({
  actionLabel,
  body,
  heading,
  url
}: {
  actionLabel: string;
  body: string;
  heading: string;
  url: string;
}) {
  return `<!doctype html>
<html lang="ro">
  <body style="margin:0;background:#f6f6f6;color:#1f2937;font-family:Arial,sans-serif">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding:32px 16px">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#fff;border-radius:8px"><tr><td style="padding:36px">
        <h1 style="margin:0 0 20px;font-size:24px">${heading}</h1>
        ${body}
        <p style="margin:28px 0"><a href="${url}" style="display:inline-block;border-radius:6px;background:#111827;padding:12px 20px;color:#fff;text-decoration:none;font-weight:600">${actionLabel}</a></p>
      </td></tr></table>
    </td></tr></table>
  </body>
</html>`;
}
