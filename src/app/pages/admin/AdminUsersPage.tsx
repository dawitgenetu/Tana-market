import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { usersAPI } from '../../../services/api';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Search } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => { 
    load(); 
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredUsers(users);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = users.filter(user => 
        user.name?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query) ||
        user.role?.toLowerCase().includes(query)
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery, users]);

  const load = async () => {
    try {
      const res = await usersAPI.getAll();
      const usersList = Array.isArray(res) ? res : res.data || res || [];
      setUsers(usersList);
      setFilteredUsers(usersList);
    } catch (err: any) { 
      console.error(err);
      toast.error(err.message || 'Failed to load users');
    } finally { 
      setLoading(false); 
    }
  };

  const handlePromote = async (id: string) => {
    if (!id) {
      toast.error('Invalid user ID');
      return;
    }
    
    if (!confirm('Are you sure you want to promote this user to manager?')) {
      return;
    }

    try {
      await usersAPI.promoteToManager(id);
      toast.success('User promoted to manager successfully');
      load();
    } catch (err: any) { 
      toast.error(err.message || 'Failed to promote user');
      console.error('Promote error:', err);
    }
  };

  const handleDemote = async (id: string) => {
    if (!id) {
      toast.error('Invalid user ID');
      return;
    }

    if (!confirm('Are you sure you want to demote this manager to customer?')) {
      return;
    }

    try {
      await usersAPI.demoteToCustomer(id);
      toast.success('User demoted to customer successfully');
      load();
    } catch (err: any) { 
      toast.error(err.message || 'Failed to demote user');
      console.error('Demote error:', err);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6 bg-gradient-to-br from-gray-50 via-white to-blue-50/20 min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 bg-gradient-to-br from-gray-50 via-white to-blue-50/20 min-h-screen">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">Manage Managers & Customers</h2>
          
          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="search"
              placeholder="Search by name, email, or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
        </div>

        {filteredUsers.length === 0 ? (
          <Card className="p-12 bg-white border-gray-200 text-center">
            <p className="text-gray-600">
              {searchQuery ? 'No users found matching your search' : 'No users found'}
            </p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredUsers.map(u => {
              const userId = u._id || u.id;
              return (
                <Card key={userId} className="p-6 bg-white border-gray-200 shadow-sm hover:shadow-md transition-all">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                    <div>
                      <div className="font-bold text-gray-900 mb-1">
                        {u.name} <span className="text-sm font-normal text-gray-500">({u.role})</span>
                      </div>
                      <div className="text-sm text-gray-600">{u.email}</div>
                    </div>
                    <div className="flex gap-2">
                      {u.role !== 'manager' && u.role !== 'admin' && (
                        <Button 
                          onClick={() => handlePromote(userId)} 
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                          disabled={!userId}
                        >
                          Promote to Manager
                        </Button>
                      )}
                      {u.role === 'manager' && (
                        <Button 
                          onClick={() => handleDemote(userId)} 
                          variant="outline" 
                          className="border-gray-300 text-gray-700 hover:bg-gray-50"
                          disabled={!userId}
                        >
                          Demote to Customer
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
