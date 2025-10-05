import { CardContent, CardFooter } from '../ui/card';
import PaginationNav from './pagination-nav';
import ResultsInfo from './result-info';
import SearchBox from './search-box';
import { SearchPaginationProvider } from './search-pagination-provider';

interface ShowTableProps<T> {
    table: React.ReactNode;
    data: T[];
    keys: (keyof T)[];
    placeholder: string;
    pageSize: number;
    predicate?: (row: T, q: string) => boolean;
}

export function ShowTable<T>({
    table,
    data,
    keys,
    placeholder,
    pageSize,
    predicate,
}: ShowTableProps<T>) {
    return (
        <SearchPaginationProvider<T>
            data={data}
            config={{
                pageSize: pageSize,
                placeholder: placeholder,
                keys: keys,
                predicate: predicate,
            }}
        >
            <div className="flex w-full flex-row flex-wrap items-center justify-between gap-3">
                <SearchBox />
                <ResultsInfo />
            </div>

            {/* Table area */}
            <CardContent className="flex-1 px-0">{table}</CardContent>

            {/* Footer pagination */}
            <CardFooter className="flex items-center justify-end gap-3">
                <PaginationNav />
            </CardFooter>
        </SearchPaginationProvider>
    );
}
