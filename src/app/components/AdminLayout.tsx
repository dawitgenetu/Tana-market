import React, { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="wrapper">
      <nav className="main-header navbar navbar-expand navbar-white navbar-light">
        <ul className="navbar-nav">
          <li className="nav-item">
            <a className="nav-link" data-widget="pushmenu" href="#" role="button">
              <i className="bi bi-list"></i>
            </a>
          </li>
        </ul>

        <ul className="navbar-nav ms-auto">
          <li className="nav-item dropdown">
            <a className="nav-link" data-bs-toggle="dropdown" href="#">
              <i className="bi bi-person-circle"></i>
              <span className="d-none d-md-inline ms-2">{user?.name}</span>
            </a>
            <div className="dropdown-menu dropdown-menu-end">
              <a href="#" className="dropdown-item">
                <i className="bi bi-person me-2"></i> Profile
              </a>
              <div className="dropdown-divider"></div>
              <a href="#" className="dropdown-item" onClick={handleLogout}>
                <i className="bi bi-box-arrow-right me-2"></i> Logout
              </a>
            </div>
          </li>
        </ul>
      </nav>

      <aside className="main-sidebar sidebar-dark-primary elevation-4 fixed left-0 top-0 bottom-0 w-64 bg-slate-900/90 overflow-y-auto z-40">
        <a href="/admin" className="brand-link">
          <span className="brand-text font-weight-light">Tana Market</span>
        </a>

        <div className="sidebar p-4">
          <nav className="mt-2">
            <ul className="nav nav-pills nav-sidebar flex-column space-y-2" data-widget="treeview" role="menu">
                  <li className="nav-item">
                    <Link to="/admin" className="nav-link">
                      <i className="nav-icon bi bi-speedometer2"></i>
                      <p>Dashboard</p>
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/products" className="nav-link">
                      <i className="nav-icon bi bi-box-seam"></i>
                      <p>Products</p>
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/orders" className="nav-link">
                      <i className="nav-icon bi bi-cart-check"></i>
                      <p>Orders</p>
                    </Link>
                  </li>
                  {user?.role === 'admin' && (
                    <>
                      <li className="nav-item">
                        <Link to="/admin/users" className="nav-link">
                          <i className="nav-icon bi bi-people"></i>
                          <p>Manage Managers & Customers</p>
                        </Link>
                      </li>
                      <li className="nav-item">
                        <Link to="/admin/products" className="nav-link">
                          <i className="nav-icon bi bi-box-seam"></i>
                          <p>CRUD Products</p>
                        </Link>
                      </li>
                      <li className="nav-item">
                        <Link to="/admin/orders" className="nav-link">
                          <i className="nav-icon bi bi-cart-check"></i>
                          <p>Approve / Reject Orders</p>
                        </Link>
                      </li>
                      <li className="nav-item">
                        <Link to="/admin/reports" className="nav-link">
                          <i className="nav-icon bi bi-graph-up"></i>
                          <p>Reports & Analytics</p>
                        </Link>
                      </li>
                      <li className="nav-item">
                        <Link to="/admin/comments" className="nav-link">
                          <i className="nav-icon bi bi-chat-left-text"></i>
                          <p>Manage Comments</p>
                        </Link>
                      </li>
                      <li className="nav-item">
                        <Link to="/admin/activity" className="nav-link">
                          <i className="nav-icon bi bi-list-check"></i>
                          <p>Activity Logs</p>
                        </Link>
                      </li>
                      <li className="nav-item">
                        <Link to="/admin/reports/generate-daily" className="nav-link">
                          <i className="nav-icon bi bi-calendar-event"></i>
                          <p>Generate Daily Report</p>
                        </Link>
                      </li>
                    </>
                  )}
                </ul>
          </nav>
        </div>
      </aside>

      <div className="content-wrapper min-h-screen ml-64 p-8 bg-slate-950/60">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </div>

      <footer className="main-footer">
        <strong>Copyright &copy; 2024 Tana Market.</strong> All rights reserved.
      </footer>
    </div>
  );
}

