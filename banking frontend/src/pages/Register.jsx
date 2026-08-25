import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const Register = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        username: '',
        email: '',
        password: ''
    });
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [loading, setLoading] = useState(false);
    
    const { register, token } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (token) {
            navigate('/');
        }
    }, [token, navigate]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setLoading(true);
        try {
            await register(formData);
            setSuccess('Registration successful! Redirecting to PIN setup...');
            setTimeout(() => {
                navigate('/pin-setup', { state: { username: formData.username, password: formData.password } });
            }, 1500);
        } catch (err) {
            if (err.code === 'ERR_NETWORK') {
                setError('Cannot connect to server. Please make sure the backend is running on port 8080.');
            } else {
                const msg = err.response?.data;
                setError(typeof msg === 'string' ? msg : (msg?.message || 'Registration failed. Please try again.'));
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-bg">
                <div className="auth-orb auth-orb-1"></div>
                <div className="auth-orb auth-orb-2"></div>
                <div className="auth-orb auth-orb-3"></div>
            </div>
            <motion.div 
                className="auth-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="auth-logo">
                    <div className="auth-logo-icon"><i className="bi bi-bank"></i></div>
                    <div className="auth-logo-text">NexusBank</div>
                </div>
                <h1 className="auth-title">Create Account</h1>
                <p className="auth-subtitle">Start your banking journey</p>

                {error && <div className="alert alert-danger">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <input 
                            type="text" 
                            name="fullName"
                            className="form-input" 
                            value={formData.fullName}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-row">
                        <div className="form-group w-full">
                            <label className="form-label">Username</label>
                            <input 
                                type="text" 
                                name="username"
                                className="form-input" 
                                value={formData.username}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group w-full">
                            <label className="form-label">Email</label>
                            <input 
                                type="email" 
                                name="email"
                                className="form-input" 
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input 
                            type="password" 
                            name="password"
                            className="form-input" 
                            value={formData.password}
                            onChange={handleChange}
                            minLength={6}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary w-full mt-lg" disabled={loading}>
                        {loading ? <span className="spinner"></span> : 'Register'}
                    </button>
                </form>

                <div className="auth-footer mt-md">
                    <p className="text-muted">Already have an account? <Link to="/login" className="gradient-text">Sign In</Link></p>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;
