export type SocialPlatform =
  | 'instagram'
  | 'tiktok'
  | 'facebook'
  | 'twitter'
  | 'youtube'
  | 'yelp'
  | 'google'
  | 'website'
  | 'unknown';

export interface SocialLinkMetadata {
  platform: SocialPlatform;
  displayText: string;
  url: string;
}

export function detectPlatform(url: string): SocialPlatform {
  if (!url) return 'unknown';

  const lowerUrl = url.toLowerCase();

  if (lowerUrl.includes('instagram.com') || lowerUrl.includes('instagr.am')) {
    return 'instagram';
  }
  if (lowerUrl.includes('tiktok.com')) {
    return 'tiktok';
  }
  if (lowerUrl.includes('facebook.com') || lowerUrl.includes('fb.com')) {
    return 'facebook';
  }
  if (lowerUrl.includes('twitter.com') || lowerUrl.includes('x.com')) {
    return 'twitter';
  }
  if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) {
    return 'youtube';
  }
  if (lowerUrl.includes('yelp.com')) {
    return 'yelp';
  }
  if (
    lowerUrl.includes('google.com/maps') ||
    lowerUrl.includes('goo.gl/maps') ||
    lowerUrl.includes('maps.app.goo.gl')
  ) {
    return 'google';
  }

  return 'website';
}

export function extractMetadata(url: string): SocialLinkMetadata {
  const platform = detectPlatform(url);
  let displayText = url;

  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;

    switch (platform) {
      case 'instagram':
        {
          const match = pathname.match(/\/@?([^\/]+)/);
          if (match) {
            displayText = `@${match[1]}`;
          }
        }
        break;

      case 'tiktok':
        {
          const match = pathname.match(/\/@([^\/]+)/);
          if (match) {
            displayText = `@${match[1]}`;
          }
        }
        break;

      case 'facebook':
        {
          const match = pathname.match(/\/([^\/]+)/);
          if (match && match[1] !== 'profile.php') {
            displayText = match[1];
          } else {
            displayText = 'Facebook Page';
          }
        }
        break;

      case 'twitter':
        {
          const match = pathname.match(/\/([^\/]+)/);
          if (match) {
            displayText = `@${match[1]}`;
          }
        }
        break;

      case 'youtube':
        {
          if (pathname.includes('/channel/') || pathname.includes('/c/') || pathname.includes('/@')) {
            const match = pathname.match(/\/(channel|c|\@)\/([^\/]+)/);
            if (match) {
              displayText = match[2].startsWith('@') ? match[2] : `@${match[2]}`;
            }
          } else {
            displayText = 'YouTube';
          }
        }
        break;

      case 'yelp':
        {
          const match = pathname.match(/\/biz\/([^\/\?]+)/);
          if (match) {
            displayText = match[1].replace(/-/g, ' ');
          } else {
            displayText = 'Yelp Page';
          }
        }
        break;

      case 'google':
        displayText = 'Google Maps';
        break;

      case 'website':
        displayText = urlObj.hostname.replace(/^www\./, '');
        break;

      default:
        displayText = urlObj.hostname.replace(/^www\./, '');
    }
  } catch {
    displayText = url;
  }

  return {
    platform,
    displayText,
    url,
  };
}
