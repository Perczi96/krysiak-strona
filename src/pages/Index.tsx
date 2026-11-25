import { useEffect, useState } from 'react';
import { Link, useLoaderData } from '@tanstack/react-router';
import { useAuth } from '@/features/auth/useAuth';
import { getContentList, type Content } from '@/lib/supabase';
import { Card } from '@/components/ui/Card';
import { SocialBar } from '@/components/home/SocialBar';
import { DailyBriefingSection } from '@/components/home/DailyBriefingSection';
import { FeaturedHeroSection } from '@/components/home/FeaturedHeroSection';
import { ActiveDossiersSection } from '@/components/home/ActiveDossiersSection';
import { CaseUpdatesSection } from '@/components/home/CaseUpdatesSection';
import { AuthorNoteSection } from '@/components/home/AuthorNoteSection';
import { LatestKulisySection } from '@/components/home/LatestKulisySection';
import { ContentFeedSection } from '@/components/home/ContentFeedSection';
import { LatestYouTubeSection } from '@/components/home/LatestYouTubeSection';
import { ClubBannerSection } from '@/components/home/ClubBannerSection';

export interface IndexLoaderData {
  featured: Content | undefined;
  latest: Content[];
  videos: Content[];
  posts: Content[];
  supporter: Content[];
}

export async function loader(): Promise<IndexLoaderData> {
  const [featured, latest, videos, posts, supporter] = await Promise.all([
    getContentList({ featured: true, limit: 1 }).then((r) => r[0]),
    getContentList({ limit: 12 }),
    getContentList({ type: 'video', limit: 6 }),
    getContentList({ type: 'post', limit: 6 }),
    getContentList({ visibility: 'supporter', limit: 6 }),
  ]);
  return { featured, latest, videos, posts, supporter };
}

export function IndexPage() {
  const { featured, latest, supporter } = useLoaderData({ strict: false }) as unknown as IndexLoaderData;
  const { profile, isLoading: authLoading } = useAuth();
  const isSupporter = profile?.role === 'supporter' && profile?.subscription_status === 'active';
  const [allRecent, setAllRecent] = useState<Content[]>(latest || []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const data = await getContentList({ limit: 60, orderBy: 'published_at' });
      if (!cancelled && data.length > 0) setAllRecent(data);
    };
    void load();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="space-y-12 md:space-y-16 pb-16">
      <SocialBar />
      <DailyBriefingSection contents={allRecent} />
      <FeaturedHeroSection featured={featured} />
      <ActiveDossiersSection />
      <CaseUpdatesSection contents={allRecent} />
      <AuthorNoteSection contents={allRecent} />
      <LatestKulisySection contents={allRecent} />
      <ContentFeedSection initial={latest || []} />
      <LatestYouTubeSection />
      <ClubBannerSection isSupporter={isSupporter} supporterItems={supporter || []} />

      {(authLoading || !profile) && (
        <section className="container">
          <Card className="bg-surface-hover border-border px-6 py-12 text-center">
            <h2 className="mb-2 text-xl font-display font-bold text-ink">Dołącz do społeczności</h2>
            <p className="mx-auto mb-6 max-w-md text-muted">
              Zaloguj się, aby otrzymywać powiadomienia o nowych materiałach, komentować i zapisywać swoje ulubione treści.
            </p>
            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              <Link to="/auth" className="btn btn-primary">Zaloguj się</Link>
              <a href="/auth?mode=register" className="btn btn-secondary">Zarejestruj się</a>
            </div>
          </Card>
        </section>
      )}
    </div>
  );
}
