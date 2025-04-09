
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Column<T> {
    header: string;
    accessorKey: string;
    cell?: (row: T) => React.ReactNode;
    className?: string;
}

interface DataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    searchable?: boolean;
    searchPlaceholder?: string;
    className?: string;
}

export function DataTable<T>({
                                 data,
                                 columns,
                                 searchable = false,
                                 searchPlaceholder = "Search...",
                                 className,
                             }: DataTableProps<T>) {
    const [searchQuery, setSearchQuery] = React.useState('');

    const filteredData = React.useMemo(() => {
        if (!searchQuery) return data;

        return data.filter((item) => {
            return Object.values(item as Record<string, any>).some((value) => {
                if (typeof value === 'string') {
                    return value.toLowerCase().includes(searchQuery.toLowerCase());
                }
                if (typeof value === 'number') {
                    return value.toString().includes(searchQuery);
                }
                return false;
            });
        });
    }, [data, searchQuery]);

    return (
        <div className={cn("space-y-4", className)}>
            {searchable && (
                <div className="flex justify-between">
                    <Input
                        placeholder={searchPlaceholder}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="max-w-sm"
                    />
                </div>
            )}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {columns.map((column) => (
                                <TableHead key={column.accessorKey} className={column.className}>
                                    {column.header}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredData.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No results.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredData.map((row, i) => (
                                <TableRow key={i}>
                                    {columns.map((column) => (
                                        <TableCell key={column.accessorKey} className={column.className}>
                                            {column.cell
                                                ? column.cell(row)
                                                : (row as Record<string, any>)[column.accessorKey]}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

export function StatusBadge({ status }: { status: string }) {
    let variant:
        | "default"
        | "secondary"
        | "destructive"
        | "outline" = "default";

    switch (status) {
        case 'completed':
            variant = "default";
            break;
        case 'in_progress':
            variant = "secondary";
            break;
        case 'pending':
            variant = "outline";
            break;
        case 'overdue':
            variant = "destructive";
            break;
        default:
            variant = "outline";
    }

    return (
        <Badge variant={variant} className="capitalize">
            {status.replace('_', ' ')}
        </Badge>
    );
}

export function ProgressBadge({ value }: { value: number | string }) {
    const numValue = typeof value === 'string' ? parseInt(value, 10) : value;

    let variant:
        | "default"
        | "secondary"
        | "destructive"
        | "outline" = "default";

    if (numValue >= 90) {
        variant = "default";
    } else if (numValue >= 70) {
        variant = "secondary";
    } else if (numValue >= 50) {
        variant = "outline";
    } else {
        variant = "destructive";
    }

    return (
        <Badge variant={variant} className="capitalize">
            {typeof value === 'string' ? value : `${value}%`}
        </Badge>
    );
}
