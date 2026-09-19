import type { SVGProps } from 'react';

export function GoogleLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden='true' viewBox='0 0 48 48' {...props}>
      <path
        d='M43.6 20H42V20H24v8h11.3c-1.1 3.1-3.3 5.5-6.1 7.1l.1.1 6.2 5.2C39.6 37 44 31.1 44 24c0-1.3-.1-2.7-.4-4z'
        fill='#4285F4'
      />
      <path
        d='M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3 0 5.7 1.1 7.8 3l5.7-5.7C34 6.1 29.2 4 24 4c-7.7 0-14.4 4.4-17.7 10.7z'
        fill='#EA4335'
      />
      <path
        d='M24 44c5.1 0 9.8-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.3 0-9.7-3.3-11.3-7.9l-6.5 5C9.5 39.5 16.2 44 24 44z'
        fill='#34A853'
      />
      <path
        d='M6.3 33.1l6.5-5C12.3 26.8 12 25.4 12 24s.3-2.8.8-4.1l-6.6-4.8C4.8 17.8 4 20.8 4 24s.8 6.2 2.3 9.1z'
        fill='#FBBC05'
      />
    </svg>
  );
}
