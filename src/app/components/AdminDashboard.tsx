import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ordersAPI, reportsAPI, productsAPI, usersAPI } from '../../services/api';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load sales stats
      const salesData = await reportsAPI.getSales();
      
      // Load products count
      const products = await productsAPI.getAll();
      
      // Load users count
      const users = await usersAPI.getAll();
      
      // Load orders
      const orders = await ordersAPI.getAll();

      setStats({
        totalSales: salesData.totalSales || 0,
        totalOrders: salesData.totalOrders || 0,
        totalCustomers: users.filter((u: any) => u.role === 'customer').length,
        totalProducts: products.length,
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="content-wrapper">
      <div className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1 className="m-0">Dashboard</h1>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-end">
                <li className="breadcrumb-item"><a href="#">Home</a></li>
                <li className="breadcrumb-item active">Dashboard</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      <section className="content">
        <div className="container-fluid">
          <div className="row">
            <div className="col-lg-3 col-6">
              <div className="small-box bg-info">
                <div className="inner">
                  <h3>{stats.totalSales.toLocaleString('en-US', { style: 'currency', currency: 'ETB' })}</h3>
                  <p>Total Sales</p>
                </div>
                <div className="icon">
                  <i className="bi bi-currency-dollar"></i>
                </div>
                <a href="#" className="small-box-footer">
                  More info <i className="bi bi-arrow-right-circle"></i>
                </a>
              </div>
            </div>

            <div className="col-lg-3 col-6">
              <div className="small-box bg-success">
                <div className="inner">
                  <h3>{stats.totalOrders}</h3>
                  <p>Total Orders</p>
                </div>
                <div className="icon">
                  <i className="bi bi-cart-check"></i>
                </div>
                <a href="#" className="small-box-footer">
                  More info <i className="bi bi-arrow-right-circle"></i>
                </a>
              </div>
            </div>

            <div className="col-lg-3 col-6">
              <div className="small-box bg-warning">
                <div className="inner">
                  <h3>{stats.totalCustomers}</h3>
                  <p>Total Customers</p>
                </div>
                <div className="icon">
                  <i className="bi bi-people"></i>
                </div>
                <a href="#" className="small-box-footer">
                  More info <i className="bi bi-arrow-right-circle"></i>
                </a>
              </div>
            </div>

            <div className="col-lg-3 col-6">
              <div className="small-box bg-danger">
                <div className="inner">
                  <h3>{stats.totalProducts}</h3>
                  <p>Total Products</p>
                </div>
                <div className="icon">
                  <i className="bi bi-box-seam"></i>
                </div>
                <a href="#" className="small-box-footer">
                  More info <i className="bi bi-arrow-right-circle"></i>
                </a>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-12">
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Welcome, {user?.name}!</h3>
                </div>
                <div className="card-body">
                  <p>This is your admin dashboard. Use the sidebar to navigate to different sections.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

