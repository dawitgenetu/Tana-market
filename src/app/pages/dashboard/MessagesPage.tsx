import React, { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { MessageSquare, Send, Search } from 'lucide-react';
import { Input } from '../../components/ui/input';

interface Message {
  id: string;
  from: string;
  subject: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      from: 'customer@example.com',
      subject: 'Order Inquiry',
      message: 'I would like to know the status of my order #12345',
      timestamp: '2024-01-15T10:30:00',
      read: false,
    },
    {
      id: '2',
      from: 'support@example.com',
      subject: 'Product Feedback',
      message: 'Thank you for your recent purchase. We would love to hear your feedback!',
      timestamp: '2024-01-14T15:20:00',
      read: true,
    },
  ]);

  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredMessages = messages.filter(
    (msg) =>
      msg.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.from.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const unreadCount = messages.filter((m) => !m.read).length;

  return (
    <DashboardLayout>
      <div className="p-6 bg-gradient-to-br from-gray-50 via-white to-blue-50/20 min-h-screen">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Messages</h2>
          <p className="text-gray-600">Manage your customer communications</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Messages List */}
          <div className="lg:col-span-1">
            <Card className="p-4 bg-white border-gray-200">
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search messages..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {filteredMessages.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>No messages found</p>
                  </div>
                ) : (
                  filteredMessages.map((message) => (
                    <div
                      key={message.id}
                      onClick={() => setSelectedMessage(message)}
                      className={`p-4 rounded-lg cursor-pointer transition-all ${
                        selectedMessage?.id === message.id
                          ? 'bg-blue-50 border-2 border-blue-200'
                          : message.read
                          ? 'bg-gray-50 hover:bg-gray-100'
                          : 'bg-white border-2 border-blue-200 hover:bg-blue-50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <p className="font-semibold text-gray-900 text-sm">{message.from}</p>
                        {!message.read && (
                          <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                        )}
                      </div>
                      <p className="text-sm font-medium text-gray-900 mb-1">{message.subject}</p>
                      <p className="text-xs text-gray-500 truncate">{message.message}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(message.timestamp).toLocaleString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>

          {/* Message Detail */}
          <div className="lg:col-span-2">
            {selectedMessage ? (
              <Card className="p-6 bg-white border-gray-200">
                <div className="mb-4 pb-4 border-b border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{selectedMessage.subject}</h3>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">From: {selectedMessage.from}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(selectedMessage.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="mb-6">
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedMessage.message}</p>
                </div>
                <div className="flex gap-2">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Send className="w-4 h-4 mr-2" />
                    Reply
                  </Button>
                  <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                    Forward
                  </Button>
                </div>
              </Card>
            ) : (
              <Card className="p-12 bg-white border-gray-200 text-center">
                <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a message</h3>
                <p className="text-gray-600">Choose a message from the list to view its details</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

