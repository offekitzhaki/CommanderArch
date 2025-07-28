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
    </>
  );
}
