import { useEffect, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { ArrowRight, FolderSearch } from 'lucide-react';
import { getContentList, type Content } from '@/lib/supabase';
import { isDossierContent } from '@/types/dossier';
import { DossierFolderCard } from '@/components/dossier/DossierFolderCard';

export function ActiveDossiersSection() {
  const [dossiers, setDossiers] = useState<Content[]>([]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const data = await getContentList({ limit: 60, orderBy: 'published_at' });
      if (cancelled) return;
      const items = data.filter(isDossierContent).slice(0, 3);
      setDossiers(items);
    };
    void load();
    return () => { cancelled = true; };
  }, []);

  if (dossiers.length === 0) return null;

  return (
    <section className="container">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold-dim px-3 py-1 font-mono text-[11px] uppercase tracking-[0.18em] text-gold">
            <FolderSearch className="h-3.5 w-3.5" /> Teczki spraw
          </div>
          <h2 className="text-2xl font-display font-bold text-ink md:text-3xl">Aktywne teczki</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted md:text-base">Dokumenty, ustalenia, osie czasu i stanowiska w jednym miejscu</p>
        </div>
        <Link to="/sprawy" className="inline-flex items-center gap-2 text-sm font-semibold text-gold hover:text-gold-light">
          Wszystkie sprawy <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {dossiers.map((c) => <DossierFolderCard key={c.id} content={c} />)}
      </div>
    </section>
  );
}
