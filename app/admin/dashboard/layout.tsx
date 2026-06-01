export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  // The global admin layout (`app/admin/layout.tsx`) renders the sidebar
  // and applies authentication. Here we only provide the content wrapper
  // for dashboard routes to avoid rendering the sidebar twice.
  return (
    <div className="flex-1 overflow-auto">
      {children}
    </div>
  );
}
