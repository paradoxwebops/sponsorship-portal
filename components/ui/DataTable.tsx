"use client";

import React from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp, Trash } from "lucide-react"; // Ensure this is at the top

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
    accordionMode?: boolean;
    renderAccordionContent?: (row: T) => React.ReactNode;

    // ✅ NEW
    deleteMode?: boolean;
    onDelete?: (row: T) => void;
}

export function DataTable<T>({
                                 data,
                                 columns,
                                 searchable = false,
                                 searchPlaceholder = "Search...",
                                 className,
                                 accordionMode = false,
                                 renderAccordionContent,
                                 deleteMode = false,
                                 onDelete,
                             }: DataTableProps<T>) {
    const [searchQuery, setSearchQuery] = React.useState("");
    const [openRowIndex, setOpenRowIndex] = React.useState<number | null>(null);

    const filteredData = React.useMemo(() => {
        if (!searchQuery) return data;

        return data.filter((item) => {
            return Object.values(item as Record<string, any>).some((value) => {
                if (typeof value === "string") {
                    return value.toLowerCase().includes(searchQuery.toLowerCase());
                }
                if (typeof value === "number") {
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
                            {(accordionMode || deleteMode) && (
                                <TableHead className="w-[160px]">Actions</TableHead>
                            )}
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {filteredData.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length + (accordionMode || deleteMode ? 1 : 0)}
                                    className="h-24 text-center"
                                >
                                    No results.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredData.map((row, i) => {
                                const isOpen = openRowIndex === i;

                                return (
                                    <React.Fragment key={i}>
                                        <TableRow>
                                            {columns.map((column, colIndex) => (
                                                <TableCell key={colIndex} className={column.className}>
                                                    {column.cell
                                                        ? column.cell(row)
                                                        : (row as Record<string, any>)[column.accessorKey]}
                                                </TableCell>
                                            ))}

                                            {(accordionMode || deleteMode) && (
                                                <TableCell className="flex flex-end">
                                                    <div className="flex justify-center items-center gap-2">
                                                        {accordionMode && (
                                                            <Button
                                                                size="icon"
                                                                variant="outline"
                                                                onClick={() => setOpenRowIndex(isOpen ? null : i)}
                                                                title={isOpen ? "Collapse" : "Expand"}
                                                            >
                                                                {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                                            </Button>
                                                        )}
                                                        {deleteMode && (
                                                            <Button
                                                                size="icon"
                                                                variant="destructive"
                                                                onClick={() => onDelete?.(row)}
                                                                title="Delete"
                                                            >
                                                                <Trash className="w-4 h-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            )}
                                        </TableRow>

                                        {accordionMode && isOpen && (
                                            <TableRow>
                                                <TableCell colSpan={columns.length + 1}>
                                                    {renderAccordionContent
                                                        ? renderAccordionContent(row)
                                                        : null}
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </React.Fragment>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

export function StatusBadge({ status }: { status: string }) {
    let variant: "default" | "secondary" | "destructive" | "outline" = "default";

    switch (status) {
        case "completed":
            variant = "default";
            break;
        case "in_progress":
            variant = "secondary";
            break;
        case "pending":
            variant = "outline";
            break;
        case "overdue":
            variant = "destructive";
            break;
        default:
            variant = "outline";
    }

    return (
        <Badge variant={variant} className="capitalize">
            {status.replace("_", " ")}
        </Badge>
    );
}

export function ProgressBadge({ value }: { value: number | string }) {
    const numValue = typeof value === "string" ? parseInt(value, 10) : value;

    let variant: "default" | "secondary" | "destructive" | "outline" = "default";

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
            {typeof value === "string" ? value : `${value}%`}
        </Badge>
    );
}
