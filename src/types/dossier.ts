import type { Content } from '@/lib/supabase';

export type DossierStatus = 'w-toku' | 'nowa-aktualizacja' | 'w-sadzie' | 'zakonczona';

export interface DossierLatestUpdate {
  date: string;
  title: string;
  summary: string;
}

export interface DossierSummary {
  about: string;
  findings: string[];
  unknowns: string[];
  keyEntities?: string[];
}

export interface DossierUpdate {
  id: string;
  date: string;
  tag?: string;
  title: string;
  body: string;
  linkUrl?: string;
  linkLabel?: string;
}

export interface DossierTimelineEvent {
  id: string;
  date: string;
  title: string;
  description?: string;
}

export type DossierDocType = 'akta' | 'wyrok' | 'oswiadczenie' | 'publikacja' | 'nagranie' | 'inny';

export interface DossierDocument {
  id: string;
  docType: DossierDocType;
  title: string;
  source?: string;
  date?: string;
  note?: string;
  url?: string;
}

export type DossierStatementStatus = 'odpowiedz' | 'odmowa' | 'brak-odpowiedzi' | 'sprostowanie';

export interface DossierStatement {
  id: string;
  who: string;
  role?: string;
  date?: string;
  status: DossierStatementStatus;
  body: string;
  url?: string;
}

export interface DossierData {
  caseStatus: DossierStatus;
  caseCode?: string;
  startedAt?: string;
  updatedLabel?: string;
  latestUpdate?: DossierLatestUpdate;
  summary: DossierSummary;
  updates: DossierUpdate[];
  timeline: DossierTimelineEvent[];
  documents: DossierDocument[];
  statements: DossierStatement[];
}

const STATUS_SET = new Set<DossierStatus>(['w-toku', 'nowa-aktualizacja', 'w-sadzie', 'zakonczona']);
const DOC_TYPES = new Set<DossierDocType>(['akta', 'wyrok', 'oswiadczenie', 'publikacja', 'nagranie', 'inny']);
const STATEMENT_STATUSES = new Set<DossierStatementStatus>(['odpowiedz', 'odmowa', 'brak-odpowiedzi', 'sprostowanie']);

function asRecord(v: unknown): Record<string, unknown> {
  return v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : {};
}
function str(v: unknown): string {
  return typeof v === 'string' ? v.trim() : typeof v === 'number' ? String(v) : '';
}
function strArr(v: unknown): string[] {
  if (Array.isArray(v)) return v.map(str).filter(Boolean);
  if (typeof v === 'string') return v.split(/\r?\n|,/).map((s) => s.trim()).filter(Boolean);
  return [];
}
function id(v: unknown, fallback: string): string {
  const s = str(v);
  return s || fallback;
}

export function emptyDossier(): DossierData {
  return {
    caseStatus: 'w-toku',
    caseCode: '',
    startedAt: '',
    updatedLabel: '',
    latestUpdate: undefined,
    summary: { about: '', findings: [], unknowns: [], keyEntities: [] },
    updates: [],
    timeline: [],
    documents: [],
    statements: [],
  };
}

export function parseDossierMeta(meta: Content['meta'] | unknown): DossierData {
  const root = asRecord(meta);
  const d = asRecord(root.dossier ?? root);
  const base = emptyDossier();

  const statusRaw = str(d.caseStatus || d.status).toLowerCase() as DossierStatus;
  base.caseStatus = STATUS_SET.has(statusRaw) ? statusRaw : 'w-toku';
  base.caseCode = str(d.caseCode || d.code);
  base.startedAt = str(d.startedAt || d.startDate);
  base.updatedLabel = str(d.updatedLabel || d.updatedAt);

  const lu = asRecord(d.latestUpdate);
  const luTitle = str(lu.title);
  const luSummary = str(lu.summary || lu.body);
  const luDate = str(lu.date);
  if (luTitle || luSummary || luDate) {
    base.latestUpdate = { date: luDate, title: luTitle, summary: luSummary };
  }

  const summary = asRecord(d.summary);
  base.summary = {
    about: str(summary.about || d.about),
    findings: strArr(summary.findings || d.findings),
    unknowns: strArr(summary.unknowns || d.unknowns),
    keyEntities: strArr(summary.keyEntities || summary.entities || d.keyEntities),
  };

  if (Array.isArray(d.updates)) {
    base.updates = d.updates.map((u, i) => {
      const r = asRecord(u);
      return {
        id: id(r.id, `u-${i}`),
        date: str(r.date),
        tag: str(r.tag) || undefined,
        title: str(r.title),
        body: str(r.body || r.summary),
        linkUrl: str(r.linkUrl || r.url) || undefined,
        linkLabel: str(r.linkLabel) || undefined,
      } as DossierUpdate;
    }).filter((u) => u.title || u.body || u.date);
  }

  if (Array.isArray(d.timeline)) {
    base.timeline = d.timeline.map((t, i) => {
      const r = asRecord(t);
      return {
        id: id(r.id, `t-${i}`),
        date: str(r.date),
        title: str(r.title),
        description: str(r.description || r.body) || undefined,
      } as DossierTimelineEvent;
    }).filter((t) => t.title || t.date);
  }

  if (Array.isArray(d.documents)) {
    base.documents = d.documents.map((doc, i) => {
      const r = asRecord(doc);
      const dt = str(r.docType || r.type).toLowerCase() as DossierDocType;
      return {
        id: id(r.id, `d-${i}`),
        docType: DOC_TYPES.has(dt) ? dt : 'inny',
        title: str(r.title),
        source: str(r.source) || undefined,
        date: str(r.date) || undefined,
        note: str(r.note || r.description) || undefined,
        url: str(r.url || r.linkUrl) || undefined,
      } as DossierDocument;
    }).filter((doc) => doc.title);
  }

  if (Array.isArray(d.statements)) {
    base.statements = d.statements.map((s, i) => {
      const r = asRecord(s);
      const st = str(r.status).toLowerCase() as DossierStatementStatus;
      return {
        id: id(r.id, `s-${i}`),
        who: str(r.who || r.author),
        role: str(r.role || r.institution) || undefined,
        date: str(r.date) || undefined,
        status: STATEMENT_STATUSES.has(st) ? st : 'odpowiedz',
        body: str(r.body || r.content),
        url: str(r.url || r.linkUrl) || undefined,
      } as DossierStatement;
    }).filter((s) => s.who || s.body);
  }

  if (!base.latestUpdate && base.updates.length > 0) {
    const u = base.updates[0];
    base.latestUpdate = { date: u.date, title: u.title, summary: u.body.slice(0, 220) };
  }

  return base;
}

export function isDossierContent(content: Pick<Content, 'meta'>): boolean {
  const meta = asRecord(content.meta);
  return str(meta.preset).toLowerCase() === 'teczka-sprawy' || !!meta.dossier;
}

export const DOSSIER_STATUS_LABELS: Record<DossierStatus, string> = {
  'w-toku': 'W toku',
  'nowa-aktualizacja': 'Nowa aktualizacja',
  'w-sadzie': 'W sądzie',
  'zakonczona': 'Zakończona',
};

export const DOC_TYPE_LABELS: Record<DossierDocType, string> = {
  akta: 'Akta',
  wyrok: 'Wyrok',
  oswiadczenie: 'Oświadczenie',
  publikacja: 'Publikacja',
  nagranie: 'Nagranie',
  inny: 'Dokument',
};

export const STATEMENT_STATUS_LABELS: Record<DossierStatementStatus, string> = {
  odpowiedz: 'Odpowiedź',
  odmowa: 'Odmowa komentarza',
  'brak-odpowiedzi': 'Brak odpowiedzi',
  sprostowanie: 'Sprostowanie',
};
