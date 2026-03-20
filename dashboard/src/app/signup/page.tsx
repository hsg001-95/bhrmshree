'use client';

import React, { useState } from 'react';
import { Shield, Mail, Lock, User, ArrowRight, Loader } from 'lucide-react';
import { createClient } from '../../lib/supabase';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } }
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
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
          <h1>Create your account</h1>
          <p className="auth-subtitle">Start securing your applications today</p>

          {error && <div className="auth-error">{error}</div>}
          {success && (
            <div className="auth-success">
              Account created! Check your email to confirm, then <a href="/login">log in</a>.
            </div>
          )}

          {!success && (
            <form onSubmit={handleSignup}>
              <div className="input-group">
                <User size={16} className="input-icon" />
                <input
                  type="text"
                  placeholder="Full name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
              </div>
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
                  placeholder="Password (min 6 characters)"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  minLength={6}
                  required
                />
              </div>
              <button type="submit" className="btn-primary-auth" disabled={loading}>
                {loading ? <Loader size={16} className="spin" /> : <><ArrowRight size={16} /> Create Account</>}
              </button>
            </form>
          )}

          <p className="auth-footer">
            Already have an account? <a href="/login">Sign in</a>
          </p>
        </div>
      </div>
    </main>
  );
}
