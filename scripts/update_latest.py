import json, os, re, urllib.parse, urllib.request

KEY = os.environ["YT_API_KEY"]
API = "https://www.googleapis.com/youtube/v3/"

def get(endpoint, **params):
    params["key"] = KEY
    url = API + endpoint + "?" + urllib.parse.urlencode(params)
    with urllib.request.urlopen(url, timeout=30) as r:
        return json.load(r)

ch = get("channels", part="contentDetails", forHandle="@Piotr_Krysiak")
uploads = ch["items"][0]["contentDetails"]["relatedPlaylists"]["uploads"]

pl = get("playlistItems", part="snippet", playlistId=uploads, maxResults=1)
item = pl["items"][0]["snippet"]
video_id = item["resourceId"]["videoId"]
title = item["title"]

v = get("videos", part="contentDetails", id=video_id)
iso = v["items"][0]["contentDetails"]["duration"]
h, m, s = (int(x) if x else 0 for x in re.fullmatch(r"PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?", iso).groups())
duration = f"{h}:{m:02d}:{s:02d}" if h else f"{m}:{s:02d}"

data = {"videoId": video_id, "title": title, "duration": duration}
with open("latest.json", "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
print("Najnowszy:", data)
