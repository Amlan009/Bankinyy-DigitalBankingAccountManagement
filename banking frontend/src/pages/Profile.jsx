import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';

const Profile = () => {
  const { user, refreshUser, logout } = useAuth();
  
  // Profile state
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    dateOfBirth: '',
    address: '',
    nomineeName: ''
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileAlert, setProfileAlert] = useState(null);

  // Password state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordAlert, setPasswordAlert] = useState(null);

  // Deactivate state
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [deactivatePassword, setDeactivatePassword] = useState('');
  const [deactivateLoading, setDeactivateLoading] = useState(false);
  const [deactivateAlert, setDeactivateAlert] = useState(null);

  useEffect(() => {
    if (user) {
      setProfileData({
        fullName: user.fullName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        dateOfBirth: user.dateOfBirth || '',
        address: user.address || '',
        nomineeName: user.nomineeName || ''
      });
    }
  }, [user]);

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileAlert(null);
    try {
      await api.put('/account/profile', {
        ...profileData,
        dateOfBirth: profileData.dateOfBirth || null
      });
      setProfileAlert({ type: 'success', message: 'Profile updated successfully' });
      await refreshUser();
    } catch (err) {
      const msg = err.response?.data; setProfileAlert({ type: 'danger', message: typeof msg === 'string' ? msg : (msg?.message || 'Failed to update profile') });
    } finally {
      setProfileLoading(false);
    }
  };

  const updatePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordAlert({ type: 'danger', message: 'New passwords do not match' });
      return;
    }
    setPasswordLoading(true);
    setPasswordAlert(null);
    try {
      await api.post('/account/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setPasswordAlert({ type: 'success', message: 'Password changed successfully' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      const msg = err.response?.data; setPasswordAlert({ type: 'danger', message: typeof msg === 'string' ? msg : (msg?.message || 'Failed to change password') });
    } finally {
      setPasswordLoading(false);
    }
  };

  const deactivateAccount = async () => {
    setDeactivateLoading(true);
    setDeactivateAlert(null);
    try {
      await api.post('/account/user/deactivate', { password: deactivatePassword });
      logout();
    } catch (err) {
      const msg = err.response?.data; setDeactivateAlert({ type: 'danger', message: typeof msg === 'string' ? msg : (msg?.message || 'Failed to deactivate account') });
      setDeactivateLoading(false);
    }
  };

  if (!user) return <div className="loading-page"><div className="spinner"></div></div>;

  const initials = user.fullName ? user.fullName.split(' ').map(n => n[0]).join('').substring(0,2) : 'US';

  return (
    <motion.div 
      className="page-content"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div className="page-header text-center flex flex-col items-center mb-lg">
        <div style={{ width: 100, height: 100, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 'bold', color: 'white', marginBottom: '1rem', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
          {initials}
        </div>
        <h1 className="page-title gradient-text m-0">{user.fullName}</h1>
        <p className="page-subtitle m-0 mt-sm">@{user.username} | {user.email}</p>
      </div>

      <div className="dashboard-grid">
        <div className="glass-card">
          <div className="glass-card-header">
            <h3 className="glass-card-title"><i className="bi bi-person-lines-fill mr-sm"></i> Edit Profile</h3>
          </div>
          {profileAlert && <div className={`alert alert-${profileAlert.type}`}>{profileAlert.message}</div>}
          <form onSubmit={updateProfile}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input type="text" className="form-input" name="fullName" value={profileData.fullName} onChange={handleProfileChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" className="form-input" name="email" value={profileData.email} onChange={handleProfileChange} required />
            </div>
            <div className="form-row">
              <div className="form-group w-full">
                <label className="form-label">Phone Number</label>
                <input type="text" className="form-input" name="phoneNumber" value={profileData.phoneNumber} onChange={handleProfileChange} />
              </div>
              <div className="form-group w-full">
                <label className="form-label">Date of Birth</label>
                <input type="date" className="form-input" name="dateOfBirth" value={profileData.dateOfBirth} onChange={handleProfileChange} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Address</label>
              <textarea className="form-input" name="address" rows="2" value={profileData.address} onChange={handleProfileChange}></textarea>
            </div>
            <div className="form-group">
              <label className="form-label">Nominee Name</label>
              <input type="text" className="form-input" name="nomineeName" value={profileData.nomineeName} onChange={handleProfileChange} />
            </div>
            <button type="submit" className="btn btn-primary btn-block" disabled={profileLoading}>
              {profileLoading ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        </div>

        <div className="flex flex-col gap-lg">
          <div className="glass-card">
            <div className="glass-card-header">
              <h3 className="glass-card-title"><i className="bi bi-shield-lock-fill mr-sm"></i> Change Password</h3>
            </div>
            {passwordAlert && <div className={`alert alert-${passwordAlert.type}`}>{passwordAlert.message}</div>}
            <form onSubmit={updatePassword}>
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input type="password" className="form-input" name="currentPassword" value={passwordData.currentPassword} onChange={handlePasswordChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input type="password" className="form-input" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input type="password" className="form-input" name="confirmPassword" value={passwordData.confirmPassword} onChange={handlePasswordChange} required />
              </div>
              <button type="submit" className="btn btn-secondary btn-block" disabled={passwordLoading}>
                {passwordLoading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>

          <div className="glass-card" style={{ border: '1px solid rgba(255, 50, 50, 0.3)' }}>
            <div className="glass-card-header">
              <h3 className="glass-card-title text-danger"><i className="bi bi-exclamation-triangle-fill mr-sm"></i> Danger Zone</h3>
            </div>
            <p className="text-muted mb-md">Once you deactivate your account, there is no going back. Please be certain.</p>
            <button type="button" className="btn btn-danger btn-block" onClick={() => setShowDeactivateModal(true)}>
              Deactivate Account
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showDeactivateModal && (
          <motion.div 
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="modal-content"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
            >
              <div className="modal-header">
                <h3 className="modal-title text-danger">Confirm Deactivation</h3>
                <button className="modal-close" onClick={() => setShowDeactivateModal(false)}><i className="bi bi-x-lg"></i></button>
              </div>
              <div className="p-md">
                {deactivateAlert && <div className={`alert alert-${deactivateAlert.type}`}>{deactivateAlert.message}</div>}
                <p className="mb-md text-muted">Please enter your password to confirm account deactivation.</p>
                <div className="form-group">
                  <input 
                    type="password" 
                    className="form-input" 
                    placeholder="Enter your password" 
                    value={deactivatePassword} 
                    onChange={(e) => setDeactivatePassword(e.target.value)} 
                  />
                </div>
                <div className="flex gap-md mt-lg">
                  <button className="btn btn-outline w-full" onClick={() => setShowDeactivateModal(false)}>Cancel</button>
                  <button className="btn btn-danger w-full" onClick={deactivateAccount} disabled={!deactivatePassword || deactivateLoading}>
                    {deactivateLoading ? 'Deactivating...' : 'Confirm'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Profile;
