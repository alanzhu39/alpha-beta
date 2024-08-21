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
  const sanitizedShortcode = shortcode.replace(/[^a-zA-Z0-9-_]/g, '');

  // Call Python script
  try {
    const videoUrl = execSync(`python3 python/post_to_src.py ${sanitizedShortcode}`);
    return new Response(videoUrl);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error(err.stdout.toString());
    console.error(err.stderr.toString());
    console.error(err.ouput.map(toString));
    error(500, err.message);
  }
}
