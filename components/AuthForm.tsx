"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

interface AuthFormProps {
  mode: 'signin' | 'signup';
}

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  const isSignIn = mode === 'signin';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (isSignIn) {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      } else {
        router.push('/');
        router.refresh(); 
      }
    } else { // Sign Up
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        setError(error.message);
      } else {
        setMessage('Sign up successful! Please check your email to confirm your account.');
        // Clear form on successful sign up
        setEmail('');
        setPassword('');
        setFullName('');
      }
    }
    setLoading(false);
  };

  const handleSocialLogin = async (provider: 'google' | 'github') => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({ 
        provider,
        options: {
            redirectTo: window.location.origin,
        }
    });
    if (error) {
        setError(error.message);
        setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    setResetError(null);
    setResetMessage(null);
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: window.location.origin + '/auth/reset',
    });
    if (error) {
      setResetError(error.message);
    } else {
      setResetMessage('If this email is registered, a password reset link has been sent.');
    }
    setResetLoading(false);
  };

  return (
    <>
      <div className="auth-form-header">
        <h1>{isSignIn ? 'Welcome Back!' : 'Create an Account'}</h1>
        <p>
          {isSignIn ? "Don't have an account?" : 'Already have an account?'}{' '}
          <Link href={isSignIn ? '/auth/signup' : '/auth/signin'}>
            {isSignIn ? 'Sign Up' : 'Sign In'}
          </Link>
        </p>
      </div>

      {error && <p style={{ color: 'var(--danger)', textAlign: 'center', marginBottom: '1rem' }}>{error}</p>}
      {message && <p style={{ color: 'var(--success)', textAlign: 'center', marginBottom: '1rem' }}>{message}</p>}

      <form onSubmit={handleSubmit} className="auth-form">
        {!isSignIn && (
          <div className="form-group">
            <label htmlFor="fullName">Full Name</label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              className="form-input"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              placeholder="John Doe"
              disabled={loading}
            />
          </div>
        )}
        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            name="email"
            type="email"
            className="form-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
            disabled={loading}
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            className="form-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            disabled={loading}
            minLength={6}
          />
          {isSignIn && (
            <button
              type="button"
              className="forgot-password-link"
              style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', marginTop: '0.5rem', textAlign: 'right', float: 'right', fontSize: '0.95rem' }}
              onClick={() => setShowResetModal(true)}
              tabIndex={0}
            >
              Forgot Password?
            </button>
          )}
        </div>

        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? 'Processing...' : (isSignIn ? 'Sign In' : 'Create Account')}
        </button>
      </form>

      <div className="auth-divider">OR</div>

      <div className="social-login-buttons">
        <button className="social-button" onClick={() => handleSocialLogin('google')} disabled={loading}>
          <img src="/google-icon.svg" alt="Google" width={20} height={20} />
          <span>Continue with Google</span>
        </button>
        <button className="social-button" onClick={() => handleSocialLogin('github')} disabled={loading}>
          <img src="/github-icon.svg" alt="GitHub" className="social-icon" width={20} height={20} style={{filter: 'var(--github-icon-filter)'}} />
          <span>Continue with GitHub</span>
        </button>
      </div>

      {/* Forgot Password Modal */}
      {showResetModal && (
        <div className="modal-overlay" style={{zIndex: 2000}}>
          <div className="modal-content" style={{maxWidth: 400, padding: '2rem 1.5rem'}}>
            <div className="modal-header" style={{marginBottom: '1rem'}}>
              <h2 style={{fontSize: '1.3rem', margin: 0}}>Reset Password</h2>
              <button onClick={() => setShowResetModal(false)} className="close-button" style={{fontSize: '1.5rem'}}>&times;</button>
            </div>
            <form onSubmit={handleResetPassword} className="auth-form">
              <div className="form-group">
                <label htmlFor="resetEmail">Email Address</label>
                <input
                  id="resetEmail"
                  name="resetEmail"
                  type="email"
                  className="form-input"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  disabled={resetLoading}
                />
              </div>
              <button type="submit" className="submit-button" disabled={resetLoading}>
                {resetLoading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
            {resetError && <p style={{ color: 'var(--danger)', textAlign: 'center', marginTop: '1rem' }}>{resetError}</p>}
            {resetMessage && <p style={{ color: 'var(--success)', textAlign: 'center', marginTop: '1rem' }}>{resetMessage}</p>}
          </div>
        </div>
      )}
    </>
  );
}
