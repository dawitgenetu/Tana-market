import React, { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { Card } from '../../components/ui/card';
import { HelpCircle, ChevronDown, ChevronUp, Mail, MessageSquare, Book } from 'lucide-react';
import { Button } from '../../components/ui/button';

interface FAQ {
  id: string;
  question: string;
  answer: string;
}

export default function HelpPage() {
  const [openFAQ, setOpenFAQ] = useState<string | null>(null);

  const faqs: FAQ[] = [
    {
      id: '1',
      question: 'How do I create a new product?',
      answer: 'Go to the Products page in the Admin Tools section, then click the "Add New Product" button. Fill in all the required fields including name, description, price, and stock quantity.',
    },
    {
      id: '2',
      question: 'How do I manage orders?',
      answer: 'Navigate to the Orders page in the Admin Tools section. Here you can view all orders, approve or reject them, update order status, and generate shipping labels.',
    },
    {
      id: '3',
      question: 'How do I track sales and analytics?',
      answer: 'Visit the Reports page in the Admin Tools section to view detailed analytics including sales reports, top products, customer statistics, and generate daily reports.',
    },
    {
      id: '4',
      question: 'How do I manage user roles?',
      answer: 'Go to the Users page in the Admin Tools section. Here you can view all users, promote customers to managers, or demote managers back to customers.',
    },
    {
      id: '5',
      question: 'How do I respond to customer comments?',
      answer: 'Navigate to the Messages page in Admin Tools (or Comments page) to view and approve customer comments. You can reply to comments directly from there.',
    },
    {
      id: '6',
      question: 'How do I change my password?',
      answer: 'Go to Settings from the dashboard menu, then click on "Change Password" section. Enter your current password and new password to update it.',
    },
  ];

  const toggleFAQ = (id: string) => {
    setOpenFAQ(openFAQ === id ? null : id);
  };

  return (
    <DashboardLayout>
      <div className="p-6 bg-gradient-to-br from-gray-50 via-white to-blue-50/20 min-h-screen">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Help & Support</h2>
          <p className="text-gray-600">Find answers to common questions and get support</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* <Card className="p-6 bg-white border-gray-200 text-center hover:shadow-md transition-all">
            <Book className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">Documentation</h3>
            <p className="text-sm text-gray-600 mb-4">Browse our comprehensive documentation</p>
            <Button variant="outline" className="w-full border-gray-300 text-gray-700 hover:bg-gray-50">
              View Docs
            </Button>
          </Card>

          <Card className="p-6 bg-white border-gray-200 text-center hover:shadow-md transition-all">
            <MessageSquare className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">Live Chat</h3>
            <p className="text-sm text-gray-600 mb-4">Chat with our support team</p>
            <Button variant="outline" className="w-full border-gray-300 text-gray-700 hover:bg-gray-50">
              Start Chat
            </Button>
          </Card> */}

          <Card className="p-6 bg-white border-gray-200 text-center hover:shadow-md transition-all">
            <Mail className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">Email Support</h3>
            <p className="text-sm text-gray-600 mb-4">Send us an email</p>
            <Button variant="outline" className="w-full border-gray-300 text-gray-700 hover:bg-gray-50">
              Contact Us
            </Button>
          </Card>
          
        </div>

        {/* FAQ Section */}
        <Card className="p-6 bg-white border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <HelpCircle className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-bold text-gray-900">Frequently Asked Questions</h3>
          </div>
          <div className="space-y-3">
            {faqs.map((faq) => (
              <div
                key={faq.id}
                className="border border-gray-200 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => toggleFAQ(faq.id)}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-900">{faq.question}</span>
                  {openFAQ === faq.id ? (
                    <ChevronUp className="w-5 h-5 text-gray-600" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-600" />
                  )}
                </button>
                {openFAQ === faq.id && (
                  <div className="p-4 bg-gray-50 border-t border-gray-200">
                    <p className="text-gray-700">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}

