import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';
import { useSearchPagination } from './search-pagination-provider';

export default function SearchBox() {
    const { query, setQuery, placeholder } = useSearchPagination<unknown>();

    return (
        <div className="flex w-full max-w-sm items-center gap-2">
            <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={placeholder}
                aria-label="Search"
            />
            {query && (
                <Button
                    variant="outline"
                    size="icon"
                    type="button"
                    onClick={() => setQuery('')}
                    aria-label="Clear search"
                >
                    <X className="h-4 w-4" />
                </Button>
            )}
        </div>
    );
}
