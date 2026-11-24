import { useEffect, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { Card } from '@/components/ui/Card';

interface LatestYouTube {
  videoId: string;
  title: string;
  url?: string;
  published?: string;
  thumbnail?: string;
  fetchedAt?: string;
}

const YT_FALLBACK: LatestYouTube = {
  videoId: 'TSSf8OBXykA',
  title: 'Co naprawdę zrobiła Julie K. Brown w sprawie Epsteina?',
  url: 'https://www.youtube.com/watch?v=TSSf8OBXykA',
  published: '',
  thumbnail: 'https://i.ytimg.com/vi/TSSf8OBXykA/hqdefault.jpg',
};

export function LatestYouTubeSection() {
  const [latest, setLatest] = useState<LatestYouTube>(YT_FALLBACK);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch('/latest-youtube.json', { cache: 'no-store' });
        if (!res.ok) return;
        const data = (await res.json()) as LatestYouTube;
        if (!cancelled && data?.videoId) setLatest({ ...YT_FALLBACK, ...data });
      } catch {
        /* fallback */
      }
    };
    void load();
    return () => { cancelled = true; };
  }, []);

  const href = latest.url || `https://www.youtube.com/watch?v=${latest.videoId}`;
  const thumb = latest.thumbnail || `https://i.ytimg.com/vi/${latest.videoId}/hqdefault.jpg`;

  return (
    <section className="container">
      <Card className="overflow-hidden p-0">
        <div className="grid gap-0 md:grid-cols-12">
          <a href={href} target="_blank" rel="noopener noreferrer" className="group relative block aspect-video md:col-span-7 md:aspect-auto md:min-h-[320px]">
            <img src={thumb} alt={latest.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-bg/70 via-transparent to-transparent md:bg-gradient-to-r" />
            <div className="absolute bottom-4 left-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent text-white shadow-lg">
              <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            </div>
          </a>
          <div className="flex flex-col justify-center p-6 md:col-span-5 md:p-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-accent">Najnowszy odcinek na YouTube</p>
            <h2 className="mt-3 text-2xl font-display font-bold text-ink md:text-3xl">{latest.title}</h2>
            <p className="mt-3 text-sm text-muted">
              Automatycznie aktualizowany odcinek z kanału Piotra Krysiaka. Oglądaj na YouTube lub wróć do archiwum spraw na Bez Maski.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <a href={href} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                Obejrzyj na YouTube <ExternalLink className="h-4 w-4" />
              </a>
              <a href="https://youtube.com/@piotr_krysiak" target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
                Subskrybuj kanał
              </a>
            </div>
          </div>
        </div>
      </Card>
    </section>
  );
}
