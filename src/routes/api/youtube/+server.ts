import { error } from '@sveltejs/kit';
import { execSync } from 'child_process';

/**
 * GET /api/youtube?id=<id>
 *
 * Returns the video source URL for the Youtube video with the given video ID
 */
export async function GET({ url }: { url: URL }) {
  const videoId = url.searchParams.get('id');
  if (!videoId) {
    return new Response('Missing video ID', { status: 400 });
  }

  // Sanitize id input to remove any characters that are not in [a-zA-Z0-9-_]
  const sanitizedId = videoId.replace(/[^a-zA-Z0-9-_]/g, '');

  // Call Python script
  try {
    const videoUrl = execSync(`python3 python/youtube_to_src.py ${sanitizedId}`);
    return new Response(videoUrl);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error(err.stdout.toString());
    console.error(err.stderr.toString());
    console.error(err.ouput.map(toString));
    error(500, err.message);
  }
}
