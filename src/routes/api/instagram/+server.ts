import { exec } from 'child_process';

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
  const sanitizedShortcode = shortcode.replace(/[^a-zA-Z-]/g, '');

  // Call Python script
  exec(`python3 instaloader.py ${sanitizedShortcode}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`);
      return;
    }

    return new Response(stdout);
  });
}
