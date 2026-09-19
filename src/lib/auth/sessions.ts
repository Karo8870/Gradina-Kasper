export function formatSessionDevice(userAgent: string | null | undefined) {
  if (!userAgent) return 'Browser necunoscut';

  const browser = userAgent.includes('Edg/')
    ? 'Microsoft Edge'
    : userAgent.includes('Firefox/')
      ? 'Firefox'
      : userAgent.includes('CriOS/') || userAgent.includes('Chrome/')
        ? 'Google Chrome'
        : userAgent.includes('Safari/')
          ? 'Safari'
          : 'Browser necunoscut';
  const platform = userAgent.includes('iPhone')
    ? 'iPhone'
    : userAgent.includes('iPad')
      ? 'iPad'
      : userAgent.includes('Android')
        ? 'Android'
        : userAgent.includes('Windows')
          ? 'Windows'
          : userAgent.includes('Macintosh')
            ? 'macOS'
            : userAgent.includes('Linux')
              ? 'Linux'
              : undefined;

  return platform ? `${browser} pe ${platform}` : browser;
}
