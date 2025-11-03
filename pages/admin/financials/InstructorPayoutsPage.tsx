import React, { useMemo, useState } from 'react';
import { useInstructorFinancials } from '../../../hooks/queries/admin/useFinancialsQueries';
import PageLoader from '../../../components/ui/PageLoader';
import ErrorState from '../../../components/ui/ErrorState';
import { DollarSign, History } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/Table';
import { Button } from '../../../components/ui/Button';
import PayoutModal from '../../../components/admin/PayoutModal';
import PayoutDetailsModal from '../../../components/admin/PayoutDetailsModal';
import SortableTableHead from '../../../components/admin/ui/SortableTableHead';

const InstructorPayoutsPage: React.FC = () => {
    const { data: instructorFinancials = [], isLoading, error, refetch } = useInstructorFinancials();
    const [payoutModalOpen, setPayoutModalOpen] = useState(false);
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [selectedInstructor, setSelectedInstructor] = useState<{ id: number; name: string; amount: number; payouts: any[] } | null>(null);
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>({ key: 'outstandingBalance', direction: 'desc' });
    
    const sortedInstructorFinancials = useMemo(() => {
        let sortableItems = [...instructorFinancials];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                const aVal = a[sortConfig.key as keyof typeof a];
                const bVal = b[sortConfig.key as keyof typeof b];
                if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return sortableItems;
    }, [instructorFinancials, sortConfig]);

    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const handleOpenPayoutModal = (instructor: any) => {
        setSelectedInstructor({ id: instructor.id, name: instructor.name, amount: instructor.outstandingBalance, payouts: instructor.payouts });
        setPayoutModalOpen(true);
    };
    
     const handleOpenDetailsModal = (instructor: any) => {
        setSelectedInstructor({ id: instructor.id, name: instructor.name, amount: instructor.outstandingBalance, payouts: instructor.payouts });
        setDetailsModalOpen(true);
    };


    if (isLoading) return <PageLoader />;
    if (error) return <ErrorState message={(error as Error).message} onRetry={refetch} />;

    return (
        <>
            {selectedInstructor && <PayoutModal isOpen={payoutModalOpen} onClose={() => setPayoutModalOpen(false)} instructor={selectedInstructor} amount={selectedInstructor.amount} />}
            {selectedInstructor && <PayoutDetailsModal isOpen={detailsModalOpen} onClose={() => setDetailsModalOpen(false)} instructorName={selectedInstructor.name} payouts={selectedInstructor.payouts} />}
            <Card>
                <CardHeader>
                    <CardTitle>مستحقات المدربين</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <SortableTableHead sortKey="name" label="المدرب" sortConfig={sortConfig} onSort={handleSort} />
                                    <SortableTableHead sortKey="totalEarnings" label="إجمالي الأرباح" sortConfig={sortConfig} onSort={handleSort} />
                                    <SortableTableHead sortKey="totalPaid" label="إجمالي المدفوع" sortConfig={sortConfig} onSort={handleSort} />
                                    <SortableTableHead sortKey="outstandingBalance" label="الرصيد المستحق" sortConfig={sortConfig} onSort={handleSort} />
                                    <TableHead>إجراءات</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sortedInstructorFinancials.map(inst => (
                                    <TableRow key={inst.id}>
                                        <TableCell className="font-semibold">{inst.name}</TableCell>
                                        <TableCell>{inst.totalEarnings.toLocaleString()} ج.م</TableCell>
                                        <TableCell>{inst.totalPaid.toLocaleString()} ج.م</TableCell>
                                        <TableCell className="font-bold text-lg">{inst.outstandingBalance.toLocaleString()} ج.م</TableCell>
                                        <TableCell className="flex items-center gap-2">
                                            <Button size="sm" onClick={() => handleOpenPayoutModal(inst)} icon={<DollarSign size={16} />} disabled={inst.outstandingBalance <= 0}>
                                                تسجيل دفعة
                                            </Button>
                                            <Button size="sm" variant="outline" onClick={() => handleOpenDetailsModal(inst)} icon={<History size={16} />}>
                                                السجل
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </>
    );
};

export default InstructorPayoutsPage;
