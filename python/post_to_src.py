import sys
import requests
from instaloader import *

def use_requests(shortcode):
  try:
    url = f'https://www.instagram.com/p/{shortcode}/?__a=1&__d=1'
    # url = f'https://www.instagram.com/p/{shortcode}/?__a=1&__d=dis'
    response = requests.get(url)
    print(response.json())
    return response.json()['items'][0]['video_versions'][0]['url']
  except Exception as e:
    return None

def use_instaloader(shortcode):
  try:
    L = Instaloader(
      save_metadata=False,
      download_pictures=False,
      download_videos=False,
      download_video_thumbnails=False,
      max_connection_attempts=2
    )
    post = Post.from_shortcode(L.context, shortcode)
    return post.video_url
  except Exception as e:
    return None

def main(shortcode):
  video_url = use_instaloader(shortcode)
  if video_url: return video_url

  # video_url = use_requests(shortcode)
  # if video_url: return video_url

  print('Video URL not found')
  return None

if __name__ == '__main__':
  # Get shortcode from args
  shortcode = sys.argv[1]
  if not shortcode:
    print('Missing shortcode')
    sys.exit(1)
  
  video_url = main(shortcode)
  if not video_url:
    sys.exit(1)
  
  video_url
