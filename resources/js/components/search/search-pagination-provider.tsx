import React, {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';

type Predicate<T> = (item: T, query: string) => boolean;

export type SearchConfig<T> = {
    keys?: (keyof T)[]; // kolom yang di-search (opsional, alternatif dari predicate)
    predicate?: Predicate<T>; // custom filter (meng-override keys)
    placeholder?: string; // placeholder input search
    pageSize?: number; // default 10
    initialQuery?: string; // default ""
};

type CtxValue<T> = {
    data: T[];
    filtered: T[];
    items: T[];

    query: string;
    setQuery: (v: string) => void;

    page: number; // 1-based
    setPage: (p: number) => void;
    pageSize: number;
    setPageSize: (n: number) => void;
    totalPages: number;
    totalItems: number;

    next: () => void;
    prev: () => void;

    placeholder: string;
};

const SearchPaginationContext = createContext<CtxValue<unknown> | null>(null);

function defaultPredicate<T>(keys: (keyof T)[]): Predicate<T> {
    return (item: T, query: string) => {
        const q = query.trim().toLowerCase();
        if (!q) return true;
        return keys.some((k) =>
            String(item[k] ?? '')
                .toLowerCase()
                .includes(q),
        );
    };
}

export function SearchPaginationProvider<T>({
    data,
    config,
    children,
}: {
    data: T[];
    config?: SearchConfig<T>;
    children: React.ReactNode;
}) {
    const {
        keys,
        predicate,
        pageSize: initialPageSize = 10,
        initialQuery = '',
        placeholder = 'Cari...',
    } = config ?? {};

    const [query, setQuery] = useState(initialQuery);
    const [pageSize, setPageSize] = useState(initialPageSize);
    const [page, setPage] = useState(1);

    // reset ke page 1 saat query/data berubah
    useEffect(() => {
        setPage(1);
    }, [query, data]);

    const filterFn: Predicate<T> = useMemo(() => {
        if (predicate) return predicate;
        if (keys?.length) return defaultPredicate<T>(keys);
        return () => true;
    }, [predicate, keys]);

    const filtered = useMemo(() => {
        if (!data?.length) return [];
        if (!query.trim()) return data;
        return data.filter((d) => filterFn(d, query));
    }, [data, query, filterFn]);

    const totalItems = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const safePage = Math.min(page, totalPages);

    const items = useMemo(() => {
        const start = (safePage - 1) * pageSize;
        return filtered.slice(start, start + pageSize);
    }, [filtered, safePage, pageSize]);

    const next = () => setPage((p) => Math.min(p + 1, totalPages));
    const prev = () => setPage((p) => Math.max(p - 1, 1));

    const value: CtxValue<T> = {
        data,
        filtered,
        items,
        query,
        setQuery,
        page: safePage,
        setPage,
        pageSize,
        setPageSize,
        totalPages,
        totalItems,
        next,
        prev,
        placeholder,
    };

    return (
        <SearchPaginationContext.Provider value={value}>
            {children}
        </SearchPaginationContext.Provider>
    );
}

export function useSearchPagination<T>() {
    const ctx = useContext(SearchPaginationContext);
    if (!ctx)
        throw new Error(
            'useSearchPagination must be used within SearchPaginationProvider',
        );
    return ctx as CtxValue<T>;
}
