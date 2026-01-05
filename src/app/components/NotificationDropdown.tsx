import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, ShoppingCart, MessageSquare, UserPlus, X } from 'lucide-react';
import { ordersAPI, commentsAPI, usersAPI } from '../../services/api';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { useAuth } from '../context/AuthContext';

interface Notification {
  id: string;
  type: 'order' | 'comment' | 'user';
  message: string;
  link: string;
  timestamp: Date;
  read: boolean;
}

export default function NotificationDropdown() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user && (user.role === 'admin' || user.role === 'manager')) {
      loadNotifications();
      const interval = setInterval(loadNotifications, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [user]);

  const loadNotifications = async () => {
    try {
      const newNotifications: Notification[] = [];

      // Get pending orders
      const orders = await ordersAPI.getAll();
      const ordersList = Array.isArray(orders) ? orders : orders.data || [];
      const pendingOrders = ordersList.filter((o: any) => o.status === 'pending' || o.status === 'processing');
      pendingOrders.forEach((order: any) => {
        newNotifications.push({
          id: `order-${order._id}`,
          type: 'order',
          message: `New pending order #${order._id?.slice(-6)}`,
          link: `/dashboard/orders`,
          timestamp: new Date(order.createdAt || order.date),
          read: false,
        });
      });

      // Get unapproved comments
      const comments = await commentsAPI.getAll();
      const commentsList = Array.isArray(comments) ? comments : comments.data || [];
      const unapprovedComments = commentsList.filter((c: any) => !c.isApproved);
      unapprovedComments.forEach((comment: any) => {
        newNotifications.push({
          id: `comment-${comment._id}`,
          type: 'comment',
          message: `New comment from customer on product`,
          link: `/dashboard/comments`,
          timestamp: new Date(comment.createdAt || comment.date),
          read: false,
        });
      });

      // Get new customers (last 24 hours)
      const allUsers = await usersAPI.getAll();
      const usersList = Array.isArray(allUsers) ? allUsers : allUsers.data || [];
      const recentCustomers = usersList.filter((u: any) => {
        if (u.role !== 'customer') return false;
        const userDate = new Date(u.createdAt || u.date);
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);
        return userDate > oneDayAgo;
      });
      recentCustomers.forEach((customer: any) => {
        newNotifications.push({
          id: `user-${customer._id}`,
          type: 'user',
          message: `New customer signed up: ${customer.name || customer.email}`,
          link: `/dashboard/users`,
          timestamp: new Date(customer.createdAt || customer.date),
          read: false,
        });
      });

      // Sort by timestamp (newest first)
      newNotifications.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      
      // Limit to 10 most recent
      setNotifications(newNotifications.slice(0, 10));
      setUnreadCount(newNotifications.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <ShoppingCart className="w-4 h-4" />;
      case 'comment':
        return <MessageSquare className="w-4 h-4" />;
      case 'user':
        return <UserPlus className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'order':
        return 'bg-blue-100 text-blue-600';
      case 'comment':
        return 'bg-green-100 text-green-600';
      case 'user':
        return 'bg-yellow-100 text-yellow-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  if (!user || (user.role !== 'admin' && user.role !== 'manager')) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
        )}
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 min-w-[18px] flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <Card className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto z-50 bg-white border-gray-200 shadow-lg">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Notifications</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="divide-y divide-gray-200">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">
                  No new notifications
                </div>
              ) : (
                notifications.map((notification) => (
                  <Link
                    key={notification.id}
                    to={notification.link}
                    onClick={() => {
                      markAsRead(notification.id);
                      setIsOpen(false);
                    }}
                    className={`block p-4 hover:bg-gray-50 transition-colors ${
                      !notification.read ? 'bg-blue-50/50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${getNotificationColor(notification.type)}`}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {notification.timestamp.toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                      )}
                    </div>
                  </Link>
                ))
              )}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

