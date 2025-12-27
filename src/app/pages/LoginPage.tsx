import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Card } from '../components/ui/card';
import LoginForm from '../components/LoginForm';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen flex items-center justify-center py-12">
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/10 to-transparent" />
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative max-w-md w-full mx-4"
      >
        <Card className="p-8 bg-slate-800/80 backdrop-blur-xl border-cyan-500/20">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-gray-400">
              {isLogin ? 'Sign in to your account' : 'Start your journey with TANA'}
            </p>
          </div>

          <LoginForm initialMode={isLogin ? 'login' : 'register'} />
        </Card>
      </motion.div>
    </div>
  );
}
