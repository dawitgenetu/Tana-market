import React, { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

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

      <aside className="main-sidebar sidebar-dark-primary elevation-4">
        <a href="/admin" className="brand-link">
          <span className="brand-text font-weight-light">Tana Market</span>
        </a>

        <div className="sidebar">
          <nav className="mt-2">
            <ul className="nav nav-pills nav-sidebar flex-column" data-widget="treeview" role="menu">
              <li className="nav-item">
                <a href="/admin" className="nav-link">
                  <i className="nav-icon bi bi-speedometer2"></i>
                  <p>Dashboard</p>
                </a>
              </li>
              <li className="nav-item">
                <a href="/products" className="nav-link">
                  <i className="nav-icon bi bi-box-seam"></i>
                  <p>Products</p>
                </a>
              </li>
              <li className="nav-item">
                <a href="/orders" className="nav-link">
                  <i className="nav-icon bi bi-cart-check"></i>
                  <p>Orders</p>
                </a>
              </li>
              {user?.role === 'admin' && (
                <>
                  <li className="nav-item">
                    <a href="/admin/users" className="nav-link">
                      <i className="nav-icon bi bi-people"></i>
                      <p>Users</p>
                    </a>
                  </li>
                  <li className="nav-item">
                    <a href="/admin/reports" className="nav-link">
                      <i className="nav-icon bi bi-graph-up"></i>
                      <p>Reports</p>
                    </a>
                  </li>
                </>
              )}
            </ul>
          </nav>
        </div>
      </aside>

      <div className="content-wrapper">
        {children}
      </div>

      <footer className="main-footer">
        <strong>Copyright &copy; 2024 Tana Market.</strong> All rights reserved.
      </footer>
    </div>
  );
}

