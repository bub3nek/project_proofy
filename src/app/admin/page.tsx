import { AdminDashboard } from '@/components/Admin/AdminDashboard';
import { ProtectedRoute } from '@/components/Admin/ProtectedRoute';

export default function AdminPage() {
    return (
        <ProtectedRoute>
            <AdminDashboard />
        </ProtectedRoute>
    );
}
