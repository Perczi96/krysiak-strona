#!/usr/bin/env python3
"""Fetch latest full YouTube episode for @piotr_krysiak and write public/latest-youtube.json.

Stdlib only. No API key required.
"""

from __future__ import annotations

import json
import re
import sys
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from pathlib import Path

CHANNEL_HANDLE_URL = "https://www.youtube.com/@piotr_krysiak"
# Fallback channel id for @piotr_krysiak if HTML extraction fails.
FALLBACK_CHANNEL_ID = "UC9k_5bwk7aV4X7Yf3YgK8lA"  # replaced at runtime if extraction finds a different value
OUT_PATH = Path(__file__).resolve().parent.parent / "public" / "latest-youtube.json"

NS = {
    "atom": "http://www.w3.org/2005/Atom",
    "yt": "http://www.youtube.com/xml/schemas/2015",
    "media": "http://search.yahoo.com/mrss/",
}


def fetch_text(url: str, timeout: int = 30) -> str:
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": "Mozilla/5.0 (compatible; BezMaskiBot/1.0; +https://bezmaski.pl)",
            "Accept-Language": "pl-PL,pl;q=0.9,en;q=0.8",
        },
    )
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        charset = resp.headers.get_content_charset() or "utf-8"
        return resp.read().decode(charset, errors="replace")


def extract_channel_id(html: str) -> str | None:
    patterns = [
        r'"channelId":"(UC[\w-]{22})"',
        r'"externalId":"(UC[\w-]{22})"',
        r'<meta itemprop="channelId" content="(UC[\w-]{22})"',
        r'/channel/(UC[\w-]{22})',
        r'"browseId":"(UC[\w-]{22})"',
    ]
    for pat in patterns:
        m = re.search(pat, html)
        if m:
            return m.group(1)
    return None


def parse_feed(xml_text: str) -> list[dict]:
    root = ET.fromstring(xml_text)
    entries: list[dict] = []
    for entry in root.findall("atom:entry", NS):
        video_id = (entry.findtext("yt:videoId", default="", namespaces=NS) or "").strip()
        title = (entry.findtext("atom:title", default="", namespaces=NS) or "").strip()
        published = (entry.findtext("atom:published", default="", namespaces=NS) or "").strip()
        link_el = entry.find("atom:link[@rel='alternate']", NS)
        url = (link_el.get("href") if link_el is not None else "") or (
            f"https://www.youtube.com/watch?v={video_id}" if video_id else ""
        )
        thumb = f"https://i.ytimg.com/vi/{video_id}/hqdefault.jpg" if video_id else ""
        if video_id and title:
            entries.append(
                {
                    "videoId": video_id,
                    "title": title,
                    "url": url,
                    "published": published,
                    "thumbnail": thumb,
                }
            )
    return entries


def pick_latest(entries: list[dict]) -> dict | None:
    if not entries:
        return None
    # Atom feeds are usually newest-first, but sort defensively.
    def key(e: dict) -> str:
        return e.get("published") or ""

    return sorted(entries, key=key, reverse=True)[0]


def main() -> int:
    channel_id = None
    try:
        html = fetch_text(CHANNEL_HANDLE_URL)
        channel_id = extract_channel_id(html)
        if channel_id:
            print(f"Detected channelId: {channel_id}")
        else:
            print("Could not extract channelId from channel page; using fallback.")
    except Exception as e:
        print(f"Warning: failed to fetch channel page: {e}")

    if not channel_id:
        channel_id = FALLBACK_CHANNEL_ID

    if not channel_id.startswith("UC") or len(channel_id) < 3:
        print(f"Invalid channelId: {channel_id}", file=sys.stderr)
        return 1

    playlist_id = "UULF" + channel_id[2:]
    feed_urls = [
        f"https://www.youtube.com/feeds/videos.xml?playlist_id={playlist_id}",
        f"https://www.youtube.com/feeds/videos.xml?channel_id={channel_id}",
    ]

    latest = None
    for feed_url in feed_urls:
        try:
            print(f"Fetching feed: {feed_url}")
            xml_text = fetch_text(feed_url)
            entries = parse_feed(xml_text)
            latest = pick_latest(entries)
            if latest:
                print(f"Found latest from feed: {latest['title']}")
                break
        except Exception as e:
            print(f"Warning: feed failed {feed_url}: {e}")

    if not latest:
        print("No entry found from feeds; keeping existing file if present.", file=sys.stderr)
        if OUT_PATH.exists():
            print(f"Existing file preserved: {OUT_PATH}")
            return 0
        latest = {
            "videoId": "TSSf8OBXykA",
            "title": "Co naprawdę zrobiła Julie K. Brown w sprawie Epsteina?",
            "url": "https://www.youtube.com/watch?v=TSSf8OBXykA",
            "published": "",
            "thumbnail": "https://i.ytimg.com/vi/TSSf8OBXykA/hqdefault.jpg",
        }

    payload = {
        "videoId": latest["videoId"],
        "title": latest["title"],
        "url": latest.get("url") or f"https://www.youtube.com/watch?v={latest['videoId']}",
        "published": latest.get("published") or "",
        "thumbnail": latest.get("thumbnail") or f"https://i.ytimg.com/vi/{latest['videoId']}/hqdefault.jpg",
        "fetchedAt": datetime.now(timezone.utc).isoformat(),
    }

    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUT_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {OUT_PATH}")
    print(json.dumps(payload, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
