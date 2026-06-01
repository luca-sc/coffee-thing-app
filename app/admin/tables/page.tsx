"use client";

import { TablesOverview } from '@/components/admin/tables-overview';

export default function AdminTablesPage() {
  return (
    <div className="p-6 lg:p-8">
      <h1 className="font-serif text-3xl font-bold text-foreground mb-4">Tables</h1>
      <TablesOverview />
    </div>
  );
}
