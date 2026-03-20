'use client';

import React, { useState } from 'react';
import { Shield, Mail, Lock, ArrowRight, Loader } from 'lucide-react';
import { createClient } from '../../lib/supabase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      window.location.href = '/dashboard';
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-container">
        <a href="/" className="auth-logo">
          <div className="brand-icon"><Shield size={20} color="white" /></div>
          <span className="brand-name">Bhrmshree</span>
        </a>

        <div className="auth-card">
          <h1>Welcome back</h1>
          <p className="auth-subtitle">Sign in to your account to continue</p>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleLogin}>
            <div className="input-group">
              <Mail size={16} className="input-icon" />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <Lock size={16} className="input-icon" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn-primary-auth" disabled={loading}>
              {loading ? <Loader size={16} className="spin" /> : <><ArrowRight size={16} /> Sign In</>}
            </button>
          </form>

          <p className="auth-footer">
            Don't have an account? <a href="/signup">Sign up</a>
          </p>
        </div>
      </div>
    </main>
  );
}
