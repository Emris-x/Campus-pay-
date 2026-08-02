import { Routes, Route, Navigate } from "react-router-dom";
import AdminProtectedRoute from "../../components/AdminProtectedRoute";
import AdminLayout from "../../admin/components/AdminLayout";
import AdminDashboard from "./AdminDashboard";
import AdminUsers from "./AdminUsers";
import AdminTransactions from "./AdminTransactions";
import AdminPayments from "./AdminPayments";
import AdminWallet from "./AdminWallet";
import AdminAnalytics from "./AdminAnalytics";
import AdminNotifications from "./AdminNotifications";
import AdminAdmins from "./AdminAdmins";
import AdminAuditLogs from "./AdminAuditLogs";
import AdminSettings from "./AdminSettings";

export default function AdminRoutes() {
  return (
    <AdminProtectedRoute>
      <AdminLayout>
        <Routes>
          <Route path="" element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="transactions" element={<AdminTransactions />} />
          <Route path="payments" element={<AdminPayments />} />
          <Route path="wallet" element={<AdminWallet />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="notifications" element={<AdminNotifications />} />
          <Route path="admins" element={<AdminAdmins />} />
          <Route path="audit-logs" element={<AdminAuditLogs />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </AdminLayout>
    </AdminProtectedRoute>
  );
}
