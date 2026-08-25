import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function Sidebar({ open, onClose, user }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitial = (name) => name ? name.charAt(0).toUpperCase() : '?';

  return (
    <>
      <div className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <span className="sidebar-brand-icon">🏦</span>
          <span className="sidebar-brand-text">NexusBank</span>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section-title">MAIN</div>
          <NavLink to="/" className="sidebar-link" onClick={onClose} end>
            <i className="bi bi-grid-1x2-fill"></i> Dashboard
          </NavLink>
          <NavLink to="/transfer" className="sidebar-link" onClick={onClose}>
            <i className="bi bi-send-fill"></i> Transfer
          </NavLink>
          <NavLink to="/pay-bill" className="sidebar-link" onClick={onClose}>
            <i className="bi bi-receipt"></i> Pay Bills
          </NavLink>

          <div className="sidebar-section-title">ACCOUNTS</div>
          <NavLink to="/cards" className="sidebar-link" onClick={onClose}>
            <i className="bi bi-credit-card-fill"></i> My Cards
          </NavLink>
          <NavLink to="/transactions" className="sidebar-link" onClick={onClose}>
            <i className="bi bi-clock-history"></i> Transactions
          </NavLink>
          <NavLink to="/loan" className="sidebar-link" onClick={onClose}>
            <i className="bi bi-cash-coin"></i> Apply Loan
          </NavLink>

          <div className="sidebar-section-title">SETTINGS</div>
          <NavLink to="/notifications" className="sidebar-link" onClick={onClose}>
            <i className="bi bi-bell-fill"></i> Notifications
          </NavLink>
          <NavLink to="/profile" className="sidebar-link" onClick={onClose}>
            <i className="bi bi-person-fill"></i> Profile
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">{getInitial(user?.fullName)}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.fullName || 'User'}</div>
              <div className="sidebar-user-email">{user?.email || ''}</div>
            </div>
          </div>
          <button className="btn btn-outline btn-block mt-md" onClick={handleLogout}>
            <i className="bi bi-box-arrow-right"></i> Logout
          </button>
        </div>
      </div>
      {open && <div className="modal-overlay" onClick={onClose} style={{ zIndex: 998 }}></div>}
    </>
  );
}
