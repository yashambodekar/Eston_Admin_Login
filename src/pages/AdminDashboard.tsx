import { Navigate, Route, Routes } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import PredictivePage from "./predictive-page";
import RawMaterialPage from "./raw-material-page";
import FinishedGoodsPage from "./finished-goods-page";
import ProductionPage from "./production-page";
import ProfilePage from "./profile-page";

const pageTitles: Record<string, string> = {
  "/dashboard/predictive": "Predictive Analytics",
  "/dashboard/raw-material": "Raw Material Inventory",
  "/dashboard/finished-goods": "Finished Goods",
  "/dashboard/production": "Production Workers",
  "/dashboard/profile": "Admin Profile",
};

const AdminDashboard = () => {
  const currentPath = window.location.pathname;
  const pageTitle = pageTitles[currentPath] || "Factory Admin Dashboard";

  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar />
      
      <div className="flex-1 ml-64">
        <Topbar title={pageTitle} />
        
        <main className="p-6">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard/predictive" replace />} />
            <Route path="/predictive" element={<PredictivePage />} />
            <Route path="/raw-material" element={<RawMaterialPage />} />
            <Route path="/finished-goods" element={<FinishedGoodsPage />} />
            <Route path="/production" element={<ProductionPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
