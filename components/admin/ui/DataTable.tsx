import React, { useState, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/Table';
import { Checkbox } from '../../ui/Checkbox';
import Dropdown from '../../ui/Dropdown';

// Type definitions for props
interface ColumnDef<T> {
    accessorKey: string;
    header: string;
    cell?: (props: { value: any }) => React.ReactNode;
}

interface BulkAction<T> {
    label: string;
    action: (selected: T[]) => void;
    isDestructive?: boolean;
}

interface DataTableProps<T> {
    data: T[];
    columns: ColumnDef<T>[];
    bulkActions?: BulkAction<T>[];
    renderRowActions?: (item: T) => React.ReactNode;
}

// Helper to access nested properties like 'users.name'
const getNestedValue = (obj: any, path: string): any => {
    return path.split('.').reduce((acc, part) => acc && acc[part] !== undefined && acc[part] !== null ? acc[part] : undefined, obj);
};

// Generic DataTable component
function DataTable<T extends { id: any }>({ data, columns, bulkActions, renderRowActions }: DataTableProps<T>) {
    const [selectedRowIds, setSelectedRowIds] = useState<Set<any>>(new Set());

    const isAllSelected = selectedRowIds.size === data.length && data.length > 0;

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedRowIds(new Set(data.map(row => row.id)));
        } else {
            setSelectedRowIds(new Set());
        }
    };

    const handleSelectRow = (id: any, checked: boolean) => {
        const newSelectedRowIds = new Set(selectedRowIds);
        if (checked) {
            newSelectedRowIds.add(id);
        } else {
            newSelectedRowIds.delete(id);
        }
        setSelectedRowIds(newSelectedRowIds);
    };

    const selectedData = useMemo(() => {
        return data.filter(row => selectedRowIds.has(row.id));
    }, [data, selectedRowIds]);
    
    const dropdownItems = bulkActions?.map(action => ({
        label: action.label,
        action: () => {
            action.action(selectedData);
            setSelectedRowIds(new Set()); // Clear selection after action
        },
        isDestructive: action.isDestructive
    }));

    return (
        <div className="space-y-4">
            {bulkActions && selectedRowIds.size > 0 && (
                <div className="flex items-center gap-4">
                    <p className="text-sm text-muted-foreground">
                        {selectedRowIds.size} من {data.length} صفوف محددة.
                    </p>
                    {dropdownItems && <Dropdown trigger="إجراءات مجمعة" items={dropdownItems} />}
                </div>
            )}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {bulkActions && (
                                <TableHead className="w-12">
                                    <Checkbox
                                        checked={isAllSelected}
                                        onCheckedChange={handleSelectAll}
                                        aria-label="Select all"
                                    />
                                </TableHead>
                            )}
                            {columns.map(column => (
                                <TableHead key={column.accessorKey}>{column.header}</TableHead>
                            ))}
                             {renderRowActions && <TableHead>إجراءات</TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.length > 0 ? (
                            data.map((row, rowIndex) => (
                                <TableRow key={(row as any).id ?? rowIndex}>
                                    {bulkActions && (
                                        <TableCell>
                                            <Checkbox
                                                checked={selectedRowIds.has((row as any).id)}
                                                onCheckedChange={(checked) => handleSelectRow((row as any).id, !!checked)}
                                                aria-label={`Select row ${rowIndex + 1}`}
                                            />
                                        </TableCell>
                                    )}
                                    {columns.map(column => {
                                        const value = getNestedValue(row, column.accessorKey);
                                        return (
                                            <TableCell key={column.accessorKey}>
                                                {column.cell ? column.cell({ value }) : (value ?? 'N/A')}
                                            </TableCell>
                                        );
                                    })}
                                     {renderRowActions && (
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                {renderRowActions(row)}
                                            </div>
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))
                        ) : (
                             <TableRow>
                                <TableCell colSpan={columns.length + (bulkActions ? 1 : 0) + (renderRowActions ? 1 : 0)} className="h-24 text-center">
                                    لا توجد بيانات لعرضها.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

export default DataTable;