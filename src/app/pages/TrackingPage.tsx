import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Package, MapPin, Clock, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';

export default function TrackingPage() {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingData, setTrackingData] = useState<any>(null);

  const handleTrack = () => {
    // Mock tracking data
    setTrackingData({
      trackingNumber,
      status: 'in_transit',
      updates: [
        { date: '2024-12-20 10:00', status: 'Order Placed', location: 'TANA HQ' },
        { date: '2024-12-20 14:30', status: 'Processed', location: 'TANA HQ' },
        { date: '2024-12-20 18:00', status: 'Shipped', location: 'Distribution Center' },
        { date: '2024-12-21 08:00', status: 'In Transit', location: 'Local Facility' }
      ]
    });
  };

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Track Your Order
          </h1>
          <p className="text-gray-400 text-lg">
            Enter your TANA tracking number to see your order status
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6 bg-slate-800/50 border-cyan-500/20 mb-8">
            <div className="flex gap-4">
              <Input
                placeholder="Enter tracking number (e.g., TANA-20241220-0001)"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                className="bg-slate-700/50 border-cyan-500/30 text-white"
              />
              <Button
                onClick={handleTrack}
                className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500"
              >
                <Search className="w-5 h-5 mr-2" />
                Track
              </Button>
            </div>
          </Card>
        </motion.div>

        {trackingData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="p-6 bg-slate-800/50 border-cyan-500/20">
              <div className="flex items-center gap-3 mb-6">
                <Package className="w-8 h-8 text-cyan-400" />
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    Tracking: {trackingData.trackingNumber}
                  </h2>
                  <p className="text-cyan-400">Your order is on the way!</p>
                </div>
              </div>

              <div className="space-y-4">
                {trackingData.updates.map((update: any, i: number) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-4"
                  >
                    <div className="p-2 bg-cyan-500/20 rounded-full">
                      {i === trackingData.updates.length - 1 ? (
                        <Clock className="w-5 h-5 text-cyan-400" />
                      ) : (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-white font-semibold">{update.status}</h3>
                          <p className="text-gray-400 text-sm flex items-center gap-2 mt-1">
                            <MapPin className="w-4 h-4" />
                            {update.location}
                          </p>
                        </div>
                        <span className="text-gray-500 text-sm">{update.date}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
