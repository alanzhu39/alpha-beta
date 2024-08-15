import { error } from '@sveltejs/kit';
import { execSync } from 'child_process';

/**
 * GET /api/instagram?shortcode=<shortcode>
 *
 * Returns the video source URL for the post with the given shortcode
 */
export async function GET({ url }: { url: URL }) {
  const shortcode = url.searchParams.get('shortcode');
  if (!shortcode) {
    return new Response('Missing shortcode', { status: 400 });
  }

  // Sanitize shortcode input to remove any characters that are not in [a-zA-Z-]
  const sanitizedShortcode = shortcode.replace(/[^a-zA-Z-_]/g, '');

  // Call Python script
  try {
    const videoUrl = execSync(`python3 python/post_to_src.py ${sanitizedShortcode}`);
    return new Response(videoUrl);
  } catch (err) {
    if (err instanceof Error) {
      error(500, err.message);
    } else {
      error(500, 'Failed to retrieve video URL');
    }
  }
}
