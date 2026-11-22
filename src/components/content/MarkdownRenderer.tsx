import ReactMarkdown from 'react-markdown';
import gfm from 'remark-gfm';

const components = {
  h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1 {...props} className="text-3xl font-serif font-bold text-ink mt-8 mb-4" />
  ),
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 {...props} className="text-2xl font-serif font-bold text-ink mt-8 mb-4" />
  ),
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 {...props} className="text-xl font-serif font-bold text-ink mt-6 mb-3" />
  ),
  h4: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h4 {...props} className="text-lg font-serif font-bold text-ink mt-4 mb-2" />
  ),
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p {...props} className="text-muted leading-relaxed mb-4" />
  ),
  a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a
      {...props}
      className="text-gold hover:text-gold-light underline underline-offset-2"
      target={props.href?.startsWith('http') ? '_blank' : undefined}
      rel={props.href?.startsWith('http') ? 'noopener noreferrer' : undefined}
    />
  ),
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul {...props} className="list-disc list-inside mb-4 space-y-2" />
  ),
  ol: (props: React.HTMLAttributes<HTMLOListElement>) => (
    <ol {...props} className="list-decimal list-inside mb-4 space-y-2" />
  ),
  li: (props: React.HTMLAttributes<HTMLLIElement>) => (
    <li {...props} className="text-muted leading-relaxed" />
  ),
  blockquote: (props: React.QuoteHTMLAttributes<HTMLQuoteElement>) => (
    <blockquote {...props} className="border-l-4 border-gold pl-4 italic text-muted/80 my-4" />
  ),
  code: (props: React.HTMLAttributes<HTMLElement>) => (
    <code {...props} className="bg-panel-hover px-1.5 py-0.5 rounded text-sm font-mono text-gold" />
  ),
  pre: (props: React.HTMLAttributes<HTMLPreElement>) => (
    <pre {...props} className="bg-panel p-4 rounded-lg overflow-x-auto mb-4">
      <code className="text-sm font-mono text-ink" />
    </pre>
  ),
  img: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <img {...props} className="rounded-xl my-4 max-w-full h-auto" loading="lazy" />
  ),
  hr: () => <hr className="border-line my-8" />,
  table: (props: React.TableHTMLAttributes<HTMLTableElement>) => (
    <div className="overflow-x-auto my-4">
      <table {...props} className="w-full border-collapse" />
    </div>
  ),
  th: (props: React.ThHTMLAttributes<HTMLTableCellElement>) => (
    <th {...props} className="border border-line px-3 py-2 bg-panel-hover font-semibold text-ink text-left" />
  ),
  td: (props: React.TdHTMLAttributes<HTMLTableCellElement>) => (
    <td {...props} className="border border-line px-3 py-2 text-muted" />
  ),
  strong: (props: React.HTMLAttributes<HTMLElement>) => (
    <strong {...props} className="font-semibold text-ink" />
  ),
  em: (props: React.HTMLAttributes<HTMLElement>) => (
    <em {...props} className="italic text-muted" />
  ),
};

export function MarkdownRenderer({ content }: { content: string }) {
  return (
    <div className="prose max-w-none">
      <ReactMarkdown remarkPlugins={[gfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}