import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import './Sidebar.css';
import '../styles/dashboard.css';

const LayoutDashboard = () => {
  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <Sidebar />
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default LayoutDashboard;

