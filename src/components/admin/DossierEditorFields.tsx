import { useState } from 'react';
import { ChevronDown, Plus, Trash2, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { DOSSIER_STATUS_LABELS, DOC_TYPE_LABELS, STATEMENT_STATUS_LABELS, type DossierData, type DossierStatus } from '@/types/dossier';

const field = 'input text-base';
const area = 'input text-base min-h-[90px] py-3';

function uid(prefix: string) { return `${prefix}-${Math.random().toString(36).slice(2, 9)}`; }

function Section({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border border-border bg-bg/20">
      <button type="button" onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between px-4 py-3 text-left">
        <span className="font-semibold text-ink">{title}</span>
        <ChevronDown className={cn('h-4 w-4 text-muted transition-transform', open && 'rotate-180')} />
      </button>
      {open && <div className="space-y-4 border-t border-border px-4 py-4">{children}</div>}
    </div>
  );
}

const sampleDossier = (): DossierData => ({
  caseStatus: 'w-toku',
  caseCode: 'TECZKA #01',
  startedAt: '2026-01-15',
  updatedLabel: '2026-11-20',
  latestUpdate: { date: '2026-11-20', title: '[SZABLON] Nowy dokument w sprawie', summary: 'To jest przykładowe podsumowanie najnowszej aktualizacji. Zastąp je prawdziwym opisem po weryfikacji faktów.' },
  summary: {
    about: '[SZABLON] Krótki opis sprawy. Wyjaśnij, czego dotyczy teczka, kto jest zaangażowany i dlaczego sprawa ma znaczenie publiczne.',
    findings: ['[SZABLON] Ustalenie nr 1 — opis potwierdzonego faktu.', '[SZABLON] Ustalenie nr 2 — opis potwierdzonego faktu.'],
    unknowns: ['[SZABLON] Pytanie otwarte nr 1 — czego jeszcze nie potwierdzono.', '[SZABLON] Pytanie otwarte nr 2.'],
    keyEntities: ['Instytucja A', 'Dokument B', 'Wątek C'],
  },
  updates: [
    { id: uid('u'), date: '2026-11-20', tag: 'Nowy dowód', title: '[SZABLON] Tytuł aktualizacji', body: 'Opis aktualizacji. Co się zmieniło, skąd informacja i co to oznacza dla sprawy.', linkUrl: '', linkLabel: '' },
  ],
  timeline: [
    { id: uid('t'), date: '2026-01-15', title: '[SZABLON] Początek sprawy', description: 'Krótki opis pierwszego wydarzenia.' },
    { id: uid('t'), date: '2026-11-20', title: '[SZABLON] Najnowsze wydarzenie', description: 'Krótki opis najnowszego kamienia milowego.' },
  ],
  documents: [
    { id: uid('d'), docType: 'publikacja', title: '[SZABLON] Nazwa dokumentu lub źródła', source: 'Nazwa źródła', date: '2026-11-20', note: 'Co wynika z tego dokumentu — krótka, rzeczowa notatka.', url: '' },
  ],
  statements: [
    { id: uid('s'), who: '[SZABLON] Nazwa instytucji / osoby', role: 'Rzecznik / pełnomocnik', date: '2026-11-20', status: 'brak-odpowiedzi', body: 'Treść stanowiska albo informacja o braku odpowiedzi na pytania redakcji.', url: '' },
  ],
});

export function DossierEditorFields({ value, onChange, onFillSample }: { value: DossierData; onChange: (next: DossierData) => void; onFillSample?: () => void }) {
  const d = value;
  const set = <K extends keyof DossierData>(k: K, v: DossierData[K]) => onChange({ ...d, [k]: v });

  const updateItem = <T,>(arr: T[], idx: number, patch: Partial<T>) => arr.map((it, i) => (i === idx ? { ...it, ...patch } : it));

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-xl border border-gold/20 bg-gold-dim/10 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold text-ink">Edytor teczki sprawy</p>
          <p className="text-sm text-muted">Wypełnij sekcje poniżej. Puste sekcje nie będą wyglądać źle na stronie.</p>
        </div>
        <Button type="button" variant="secondary" size="sm" onClick={() => { onChange(sampleDossier()); onFillSample?.(); }} leftIcon={<Wand2 className="h-4 w-4" />}>Wypełnij przykładowym szablonem (do podglądu)</Button>
      </div>

      <Section title="Podstawy i „Najnowsze w sprawie”" defaultOpen>
        <div>
          <label className="mb-2 block text-sm font-medium text-muted">Status sprawy</label>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(DOSSIER_STATUS_LABELS) as DossierStatus[]).map((s) => (
              <button key={s} type="button" onClick={() => set('caseStatus', s)} className={cn('filter-pill', d.caseStatus === s && 'active')}>{DOSSIER_STATUS_LABELS[s]}</button>
            ))}
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="mb-2 block text-sm font-medium text-muted">Kod teczki (opcjonalnie)</label><input className={field} value={d.caseCode || ''} onChange={(e) => set('caseCode', e.target.value)} placeholder="np. TECZKA #01" /></div>
          <div><label className="mb-2 block text-sm font-medium text-muted">Data rozpoczęcia</label><input className={field} value={d.startedAt || ''} onChange={(e) => set('startedAt', e.target.value)} placeholder="np. 2026-01-15" /></div>
        </div>
        <div><label className="mb-2 block text-sm font-medium text-muted">Etykieta ostatniej aktualizacji (opcjonalnie)</label><input className={field} value={d.updatedLabel || ''} onChange={(e) => set('updatedLabel', e.target.value)} placeholder="np. 2026-11-20" /></div>
        <div className="rounded-lg border border-border p-4">
          <p className="mb-3 text-sm font-medium text-ink">Najnowsze w sprawie (przypięty blok)</p>
          <div className="space-y-3">
            <input className={field} value={d.latestUpdate?.date || ''} onChange={(e) => set('latestUpdate', { date: e.target.value, title: d.latestUpdate?.title || '', summary: d.latestUpdate?.summary || '' })} placeholder="Data" />
            <input className={field} value={d.latestUpdate?.title || ''} onChange={(e) => set('latestUpdate', { date: d.latestUpdate?.date || '', title: e.target.value, summary: d.latestUpdate?.summary || '' })} placeholder="Nagłówek" />
            <textarea className={area} value={d.latestUpdate?.summary || ''} onChange={(e) => set('latestUpdate', { date: d.latestUpdate?.date || '', title: d.latestUpdate?.title || '', summary: e.target.value })} placeholder="Krótkie podsumowanie" />
          </div>
        </div>
      </Section>

      <Section title="W skrócie">
        <div><label className="mb-2 block text-sm font-medium text-muted">O co chodzi</label><textarea className={area} value={d.summary.about} onChange={(e) => set('summary', { ...d.summary, about: e.target.value })} /></div>
        <div><label className="mb-2 block text-sm font-medium text-muted">Co ustaliliśmy (każdy punkt w nowej linii)</label><textarea className={area} value={d.summary.findings.join('\n')} onChange={(e) => set('summary', { ...d.summary, findings: e.target.value.split(/\r?\n/).map(s => s.trim()).filter(Boolean) })} /></div>
        <div><label className="mb-2 block text-sm font-medium text-muted">Czego jeszcze nie wiemy (każdy punkt w nowej linii)</label><textarea className={area} value={d.summary.unknowns.join('\n')} onChange={(e) => set('summary', { ...d.summary, unknowns: e.target.value.split(/\r?\n/).map(s => s.trim()).filter(Boolean) })} /></div>
        <div><label className="mb-2 block text-sm font-medium text-muted">Kluczowe wątki / podmioty (po przecinku)</label><input className={field} value={(d.summary.keyEntities || []).join(', ')} onChange={(e) => set('summary', { ...d.summary, keyEntities: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} /></div>
      </Section>

      <Section title="Aktualizacje">
        {d.updates.map((u, i) => (
          <div key={u.id} className="space-y-3 rounded-lg border border-border p-3">
            <div className="flex items-center justify-between"><span className="text-sm font-medium text-ink">Aktualizacja {i + 1}</span><button type="button" onClick={() => set('updates', d.updates.filter((_, idx) => idx !== i))} className="text-muted hover:text-accent"><Trash2 className="h-4 w-4" /></button></div>
            <div className="grid gap-3 sm:grid-cols-2"><input className={field} value={u.date} onChange={(e) => set('updates', updateItem(d.updates, i, { date: e.target.value }))} placeholder="Data" /><input className={field} value={u.tag || ''} onChange={(e) => set('updates', updateItem(d.updates, i, { tag: e.target.value }))} placeholder="Tag (np. Nowy dowód)" /></div>
            <input className={field} value={u.title} onChange={(e) => set('updates', updateItem(d.updates, i, { title: e.target.value }))} placeholder="Tytuł" />
            <textarea className={area} value={u.body} onChange={(e) => set('updates', updateItem(d.updates, i, { body: e.target.value }))} placeholder="Treść aktualizacji" />
            <div className="grid gap-3 sm:grid-cols-2"><input className={field} value={u.linkUrl || ''} onChange={(e) => set('updates', updateItem(d.updates, i, { linkUrl: e.target.value }))} placeholder="Link (opcjonalnie)" /><input className={field} value={u.linkLabel || ''} onChange={(e) => set('updates', updateItem(d.updates, i, { linkLabel: e.target.value }))} placeholder="Etykieta linku" /></div>
          </div>
        ))}
        <Button type="button" variant="secondary" size="sm" onClick={() => set('updates', [...d.updates, { id: uid('u'), date: '', tag: '', title: '', body: '', linkUrl: '', linkLabel: '' }])} leftIcon={<Plus className="h-4 w-4" />}>Dodaj aktualizację</Button>
      </Section>

      <Section title="Oś czasu">
        {d.timeline.map((t, i) => (
          <div key={t.id} className="space-y-3 rounded-lg border border-border p-3">
            <div className="flex items-center justify-between"><span className="text-sm font-medium text-ink">Punkt {i + 1}</span><button type="button" onClick={() => set('timeline', d.timeline.filter((_, idx) => idx !== i))} className="text-muted hover:text-accent"><Trash2 className="h-4 w-4" /></button></div>
            <input className={field} value={t.date} onChange={(e) => set('timeline', updateItem(d.timeline, i, { date: e.target.value }))} placeholder="Data" />
            <input className={field} value={t.title} onChange={(e) => set('timeline', updateItem(d.timeline, i, { title: e.target.value }))} placeholder="Tytuł wydarzenia" />
            <textarea className={area} value={t.description || ''} onChange={(e) => set('timeline', updateItem(d.timeline, i, { description: e.target.value }))} placeholder="Krótki opis" />
          </div>
        ))}
        <Button type="button" variant="secondary" size="sm" onClick={() => set('timeline', [...d.timeline, { id: uid('t'), date: '', title: '', description: '' }])} leftIcon={<Plus className="h-4 w-4" />}>Dodaj punkt</Button>
      </Section>

      <Section title="Dokumenty i źródła">
        {d.documents.map((doc, i) => (
          <div key={doc.id} className="space-y-3 rounded-lg border border-border p-3">
            <div className="flex items-center justify-between"><span className="text-sm font-medium text-ink">Dokument {i + 1}</span><button type="button" onClick={() => set('documents', d.documents.filter((_, idx) => idx !== i))} className="text-muted hover:text-accent"><Trash2 className="h-4 w-4" /></button></div>
            <select className={field} value={doc.docType} onChange={(e) => set('documents', updateItem(d.documents, i, { docType: e.target.value as any }))}>{Object.entries(DOC_TYPE_LABELS).map(([k, label]) => <option key={k} value={k}>{label}</option>)}</select>
            <input className={field} value={doc.title} onChange={(e) => set('documents', updateItem(d.documents, i, { title: e.target.value }))} placeholder="Tytuł dokumentu" />
            <div className="grid gap-3 sm:grid-cols-2"><input className={field} value={doc.source || ''} onChange={(e) => set('documents', updateItem(d.documents, i, { source: e.target.value }))} placeholder="Źródło" /><input className={field} value={doc.date || ''} onChange={(e) => set('documents', updateItem(d.documents, i, { date: e.target.value }))} placeholder="Data" /></div>
            <textarea className={area} value={doc.note || ''} onChange={(e) => set('documents', updateItem(d.documents, i, { note: e.target.value }))} placeholder="Co wynika z dokumentu" />
            <input className={field} value={doc.url || ''} onChange={(e) => set('documents', updateItem(d.documents, i, { url: e.target.value }))} placeholder="Link URL (opcjonalnie)" />
          </div>
        ))}
        <Button type="button" variant="secondary" size="sm" onClick={() => set('documents', [...d.documents, { id: uid('d'), docType: 'inny', title: '', source: '', date: '', note: '', url: '' }])} leftIcon={<Plus className="h-4 w-4" />}>Dodaj dokument</Button>
      </Section>

      <Section title="Stanowiska i odpowiedzi (zawsze publiczne)">
        <p className="text-xs text-muted">Te dane są publiczne w teczce nawet przy ograniczonym dostępie do pozostałych zakładek.</p>
        {d.statements.map((s, i) => (
          <div key={s.id} className="space-y-3 rounded-lg border border-border p-3">
            <div className="flex items-center justify-between"><span className="text-sm font-medium text-ink">Stanowisko {i + 1}</span><button type="button" onClick={() => set('statements', d.statements.filter((_, idx) => idx !== i))} className="text-muted hover:text-accent"><Trash2 className="h-4 w-4" /></button></div>
            <div className="grid gap-3 sm:grid-cols-2"><input className={field} value={s.who} onChange={(e) => set('statements', updateItem(d.statements, i, { who: e.target.value }))} placeholder="Kto odpowiada" /><input className={field} value={s.role || ''} onChange={(e) => set('statements', updateItem(d.statements, i, { role: e.target.value }))} placeholder="Funkcja / instytucja" /></div>
            <div className="grid gap-3 sm:grid-cols-2"><input className={field} value={s.date || ''} onChange={(e) => set('statements', updateItem(d.statements, i, { date: e.target.value }))} placeholder="Data" /><select className={field} value={s.status} onChange={(e) => set('statements', updateItem(d.statements, i, { status: e.target.value as any }))}>{Object.entries(STATEMENT_STATUS_LABELS).map(([k, label]) => <option key={k} value={k}>{label}</option>)}</select></div>
            <textarea className={area} value={s.body} onChange={(e) => set('statements', updateItem(d.statements, i, { body: e.target.value }))} placeholder="Treść stanowiska" />
            <input className={field} value={s.url || ''} onChange={(e) => set('statements', updateItem(d.statements, i, { url: e.target.value }))} placeholder="Link do pełnego pisma (opcjonalnie)" />
          </div>
        ))}
        <Button type="button" variant="secondary" size="sm" onClick={() => set('statements', [...d.statements, { id: uid('s'), who: '', role: '', date: '', status: 'brak-odpowiedzi', body: '', url: '' }])} leftIcon={<Plus className="h-4 w-4" />}>Dodaj stanowisko</Button>
      </Section>
    </div>
  );
}
