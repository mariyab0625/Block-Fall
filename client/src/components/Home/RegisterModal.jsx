import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { register as registerApi, login as loginApi } from '../../utils/api';
import NeonButton from '../Shared/NeonButton';
import AnimatedEmoji from '../Shared/AnimatedEmoji';
import Modal from '../Shared/Modal';
import './AuthModal.css';

export default function RegisterModal({ onClose, onSwitchToLogin }) {
  const { login } = useAuth();
  const [form,      setForm]      = useState({ username: '', email: '', password: '' });
  const [error,     setError]     = useState('');
  const [loading,   setLoading]   = useState(false);
  const [success,   setSuccess]   = useState(false);
  const [pwFocused, setPwFocused] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await registerApi(form);
      const res = await loginApi({ username: form.username, password: form.password });
      login(res.data.token, res.data.user);
      setSuccess(true);
      setTimeout(onClose, 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const emojiExpression = success   ? 'excited'
    : pwFocused ? 'peek'
    : error     ? 'thinking'
    : 'normal';

  return (
    <Modal onClose={onClose} className="auth-modal">
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
        <AnimatedEmoji
          size={80}
          expression={emojiExpression}
          bob={true}
          followCursor={!pwFocused && !success}
        />
      </div>

      {success ? (
        <div className="auth-modal__success">WELCOME, PLAYER ✓</div>
      ) : (
        <>
          <h2 className="auth-modal__title">═══ NEW PLAYER ═══</h2>
          <form onSubmit={handleSubmit} className="auth-modal__form">

            <label className="auth-modal__label">Username</label>
            <input className="neon-input" type="text" placeholder="Choose a username"
              value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })}
              required />

            <label className="auth-modal__label">Email</label>
            <input className="neon-input" type="email" placeholder="your@email.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required />

            <label className="auth-modal__label">Password</label>
            <input className="neon-input" type="password" placeholder="Choose a password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              onFocus={() => setPwFocused(true)}
              onBlur={() => setPwFocused(false)}
              required />

            {error && <p className="auth-modal__error">{error}</p>}

            <NeonButton color="purple" size="md" style={{ width: '100%', marginTop: 8 }} disabled={loading}>
              {loading ? 'REGISTERING...' : 'CREATE ACCOUNT'}
            </NeonButton>
          </form>

          <div className="auth-modal__divider">── already have an account? ──</div>
          <NeonButton color="cyan" size="sm" style={{ width: '100%' }} onClick={onSwitchToLogin}>
            LOG IN
          </NeonButton>
        </>
      )}
    </Modal>
  );
}
