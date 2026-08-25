import React from 'react';
import { Link } from 'react-router-dom';

export default function TopBar({ onMenuClick, user }) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const firstName = user?.fullName?.split(' ')[0] || 'User';

  return (
    <div className="topbar">
      <div className="topbar-left">
        <button className="mobile-menu-btn" onClick={onMenuClick}>
          <i className="bi bi-list"></i>
        </button>
        <div className="topbar-title">
          {getGreeting()}, <span className="gradient-text">{firstName}</span>
        </div>
      </div>
      
      <div className="topbar-right">
        <Link to="/notifications" className="topbar-icon-btn">
          <i className="bi bi-bell"></i>
          <span className="topbar-badge"></span>
        </Link>
        <Link to="/profile" className="sidebar-avatar" style={{ textDecoration: 'none', width: '36px', height: '36px', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {firstName.charAt(0).toUpperCase()}
        </Link>
      </div>
    </div>
  );
}
