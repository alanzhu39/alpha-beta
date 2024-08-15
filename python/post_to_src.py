import sys
from instaloader import *

def eprint(*args, **kwargs):
  print(*args, file=sys.stderr, **kwargs)

def main(shortcode):
  L = Instaloader(
    save_metadata=False,
    download_pictures=False,
    download_videos=False,
    download_video_thumbnails=False,
    max_connection_attempts=2
  )
  post = Post.from_shortcode(L.context, shortcode)
  return post.video_url

if __name__ == '__main__':
  # Get shortcode from args
  shortcode = sys.argv[1]
  if not shortcode:
    sys.exit(1)
  
  video_url = main(shortcode)
  if not video_url:
    sys.exit(1)
  
  print(video_url, end='')
