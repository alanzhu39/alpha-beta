import sys
from instaloader import *

# Get shortcode from args
shortcode = sys.argv[1]
if not shortcode:
  print("Missing shortcode")
  sys.exit(1)

L = Instaloader(
  save_metadata=False,
  download_pictures=False,
  download_videos=False,
  download_video_thumbnails=False,
  max_connection_attempts=2
)
post = Post.from_shortcode(L.context, shortcode)
if not post or not post.video_url:
  print("Video URL not found")
  sys.exit(1)

post.video_url
