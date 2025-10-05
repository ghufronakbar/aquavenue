import { useSearchPagination } from './search-pagination-provider';

export default function ResultsInfo() {
    const { page, pageSize, totalItems, items } =
        useSearchPagination<unknown>();
    if (totalItems === 0)
        return <p className="text-sm text-muted-foreground">Tidak ada data.</p>;

    const from = (page - 1) * pageSize + 1;
    const to = from + items.length - 1;

    return (
        <p className="text-sm text-muted-foreground">
            Menampilkan <span className="font-medium">{from}</span>
            {'–'}
            <span className="font-medium">{to}</span> dari{' '}
            <span className="font-medium">{totalItems}</span> data
        </p>
    );
}
