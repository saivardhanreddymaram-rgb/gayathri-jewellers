import { ChevronLeft, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';

interface PaginationProps {
  page: number;
  total: number;
  pageSize: number;
  onChange: (page: number) => void;
}

export function Pagination({ page, total, pageSize, onChange }: PaginationProps) {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const visible = pages.filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1
  );

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-1 mt-10">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        aria-label="Previous page"
        className={clsx(
          'p-2 rounded-lg border transition-colors duration-150',
          'disabled:opacity-40 disabled:cursor-not-allowed',
          'hover:bg-espresso-100 border-espresso-100 text-espresso'
        )}
      >
        <ChevronLeft size={16} />
      </button>

      {visible.map((p, idx) => {
        const prev = visible[idx - 1];
        const showEllipsis = prev !== undefined && p - prev > 1;
        return (
          <span key={p} className="flex items-center gap-1">
            {showEllipsis && <span className="px-1 text-espresso-400 text-sm">…</span>}
            <button
              onClick={() => onChange(p)}
              aria-label={`Page ${p}`}
              aria-current={p === page ? 'page' : undefined}
              className={clsx(
                'w-9 h-9 rounded-lg text-sm font-medium transition-colors duration-150',
                p === page
                  ? 'bg-espresso text-ivory'
                  : 'hover:bg-espresso-100 text-espresso border border-espresso-100'
              )}
            >
              {p}
            </button>
          </span>
        );
      })}

      <button
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        aria-label="Next page"
        className={clsx(
          'p-2 rounded-lg border transition-colors duration-150',
          'disabled:opacity-40 disabled:cursor-not-allowed',
          'hover:bg-espresso-100 border-espresso-100 text-espresso'
        )}
      >
        <ChevronRight size={16} />
      </button>
    </nav>
  );
}
