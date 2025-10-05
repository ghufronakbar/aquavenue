import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useSearchPagination } from './search-pagination-provider';

function range(from: number, to: number) {
    return Array.from(
        { length: Math.max(0, to - from + 1) },
        (_, i) => from + i,
    );
}

export default function PaginationNav() {
    const { page, setPage, totalPages, prev, next, totalItems } =
        useSearchPagination<unknown>();
    if (totalItems === 0) return null;

    // tampilkan maksimal 5 tombol nomor
    const windowSize = 5;
    const half = Math.floor(windowSize / 2);

    let start = Math.max(1, page - half);
    const end = Math.min(totalPages, start + windowSize - 1);
    start = Math.max(1, Math.min(start, Math.max(1, end - windowSize + 1)));

    const pages = range(start, end);

    return (
        <div className="flex items-center gap-2">
            <Button
                variant="outline"
                size="sm"
                onClick={prev}
                disabled={page === 1}
            >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Prev
            </Button>

            {start > 1 && (
                <>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(1)}
                    >
                        1
                    </Button>
                    {start > 2 && <span className="px-1">…</span>}
                </>
            )}

            {pages.map((p) => (
                <Button
                    key={p}
                    variant={p === page ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPage(p)}
                >
                    {p}
                </Button>
            ))}

            {end < totalPages && (
                <>
                    {end < totalPages - 1 && <span className="px-1">…</span>}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(totalPages)}
                    >
                        {totalPages}
                    </Button>
                </>
            )}

            <Button
                variant="outline"
                size="sm"
                onClick={next}
                disabled={page === totalPages}
            >
                Next
                <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
        </div>
    );
}
