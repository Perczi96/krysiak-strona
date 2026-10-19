import json, urllib.request
import xml.etree.ElementTree as ET

CHANNEL_ID = "UCxvlqDrUSBomr0I5kHe20ug"
FEED = f"https://www.youtube.com/feeds/videos.xml?channel_id={CHANNEL_ID}"
NS = {"a": "http://www.w3.org/2005/Atom", "yt": "http://www.youtube.com/xml/schemas/2015"}

req = urllib.request.Request(FEED, headers={"User-Agent": "Mozilla/5.0"})
with urllib.request.urlopen(req, timeout=30) as r:
    root = ET.fromstring(r.read())

entry = root.find("a:entry", NS)
data = {
    "videoId": entry.find("yt:videoId", NS).text,
    "title": entry.find("a:title", NS).text,
}
with open("latest.json", "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
print("Najnowszy:", data)
