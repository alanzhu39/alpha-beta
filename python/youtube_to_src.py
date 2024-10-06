import sys
from instaloader import *

def eprint(*args, **kwargs):
  print(*args, file=sys.stderr, **kwargs)

def main(shortcode):
  # TODO: implement
  pass
  # L = Instaloader(
  #   save_metadata=False,
  #   download_pictures=False,
  #   download_videos=False,
  #   download_video_thumbnails=False,
  #   max_connection_attempts=2
  # )
  # post = Post.from_shortcode(L.context, shortcode)
  # if post.video_url:
  #   return post.video_url
  
  # sidecar_nodes = post.get_sidecar_nodes()
  # for node in sidecar_nodes:
  #   if node.video_url:
  #     return node.video_url
  
  # return None

if __name__ == '__main__':
  pass
  # Get shortcode from args
  # shortcode = sys.argv[1]
  # if not shortcode:
  #   sys.exit(1)
  
  # video_url = main(shortcode)
  # if not video_url:
  #   sys.exit(1)
  
  # print(video_url, end='')
