/* eslint-disable */
// @ts-nocheck
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { useState, useEffect } from 'react';

import './LoginPage.css';

const ROLE_REDIRECTS = {
  trainee:    '/trainee',
  instructor: '/instructor',
  director:   '/directorate',
  pending:    '/trainee',
};

const redirectByRole = (role, navigate) => {
  const target = ROLE_REDIRECTS[role] || '/trainee';
  navigate(target);
};

const LoginPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  // Prevent logged-in users from seeing the login page
  useEffect(() => {
    let mounted = true;
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user && mounted) {
        setLoading(true);
        let role = session.user.user_metadata?.user_type || session.user.user_metadata?.role;
        if (!role) {
          const em = (session.user.email || '').toLowerCase();
          if (em.includes('director') || em.includes('admin')) role = 'director';
          else if (em.includes('instructor') || em.includes('teacher') || em.includes('nssta')) role = 'instructor';
          else role = 'trainee';
        }
        localStorage.setItem('cachedUserRole', role);
        redirectByRole(role, navigate);
      }
    });

    return () => { mounted = false; };
  }, [navigate]);


  // Email/Password Handler
  const handleEmailAuth = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setAuthError('Please enter both email and password.');
      return;
    }
    setLoading(true);
    setAuthError('');
    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (data?.user) {
          let role = data.user.user_metadata?.user_type || 'trainee';
          localStorage.setItem('cachedUserRole', role);
          redirectByRole(role, navigate);
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data?.user) {
          let role = data.user.user_metadata?.user_type || data.user.user_metadata?.role;
          if (!role) {
            const em = (data.user.email || '').toLowerCase();
            if (em.includes('director') || em.includes('admin')) role = 'director';
            else if (em.includes('instructor') || em.includes('teacher') || em.includes('nssta')) role = 'instructor';
            else role = 'trainee';
          }
          localStorage.setItem('cachedUserRole', role);
          redirectByRole(role, navigate);
        }
      }
    } catch (error) {
      console.error('Email Auth Error:', error);
      setAuthError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card liquid-glass">
        <h1 className="login-title">StatCap</h1>
        <p className="login-subtitle">
          Sign in to your portal
        </p>

        {authError && <div className="liquid-error">{authError}</div>}

        <form onSubmit={handleEmailAuth} className="email-login-form">
          <input 
            type="email" 
            placeholder="Official Email" 
            className="liquid-input" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input 
            type="password" 
            placeholder="Password" 
            className="liquid-input" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button 
            type="submit" 
            className="liquid-btn primary-btn" 
            disabled={loading}
            style={{
              height: '52px',
              minHeight: '52px',
              borderRadius: '16px',
              border: 'none',
              background: '#ffffff',
              color: '#000000',
              fontWeight: 700,
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: loading ? 'not-allowed' : 'pointer',
              width: '100%',
              marginTop: '8px',
              boxShadow: '0 4px 15px rgba(255, 255, 255, 0.2)',
            }}
          >
            {loading ? 'Authenticating...' : (isSignUp ? 'Create Account' : 'Sign In')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;

