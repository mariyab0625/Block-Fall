import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { login as loginApi } from '../../utils/api';
import NeonButton from '../Shared/NeonButton';
import AnimatedEmoji from '../Shared/AnimatedEmoji';
import Modal from '../Shared/Modal';
import './AuthModal.css';

export default function LoginModal({ onClose, onSwitchToRegister }) {
  const { login } = useAuth();
  const [form,      setForm]      = useState({ username: '', password: '' });
  const [error,     setError]     = useState('');
  const [loading,   setLoading]   = useState(false);
  const [success,   setSuccess]   = useState(false);
  const [pwFocused, setPwFocused] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await loginApi(form);
      login(res.data.token, res.data.user);
      setSuccess(true);
      setTimeout(onClose, 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Emoji expression: success → excited | pw focused → peek | error → thinking | default → normal
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
        <div className="auth-modal__success">IDENTITY CONFIRMED ✓</div>
      ) : (
        <>
          <h2 className="auth-modal__title">═══ PLAYER IDENTIFICATION ═══</h2>
          <form onSubmit={handleSubmit} className="auth-modal__form">

            <label className="auth-modal__label">Username</label>
            <input
              className="neon-input"
              type="text"
              placeholder="Enter username"
              value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })}
              required
            />

            <label className="auth-modal__label">Password</label>
            <input
              className="neon-input"
              type="password"
              placeholder="Enter password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              onFocus={() => setPwFocused(true)}
              onBlur={() => setPwFocused(false)}
              required
            />

            {error && <p className="auth-modal__error">{error}</p>}

            <NeonButton color="cyan" size="md" style={{ width: '100%', marginTop: 8 }} disabled={loading}>
              {loading ? 'LOGGING IN...' : 'LOG IN'}
            </NeonButton>
          </form>

          <div className="auth-modal__divider">── or ──</div>
          <NeonButton color="purple" size="sm" style={{ width: '100%' }} onClick={onSwitchToRegister}>
            CREATE ACCOUNT
          </NeonButton>
          <p className="auth-modal__guest" onClick={onClose}>Continue as Guest</p>
        </>
      )}
    </Modal>
  );
}
