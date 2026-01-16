import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Auth.css';

const Register = () => {
  // Get role from URL params if present
  const urlParams = new URLSearchParams(window.location.search);
  const roleFromUrl = urlParams.get('role');
  
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    role: roleFromUrl === 'nonprofit' ? 'nonprofit' : 'volunteer'
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Mock registration - store in localStorage
    const userData = {
      ...formData,
      id: Date.now().toString()
    };
    localStorage.setItem('currentUser', JSON.stringify(userData));
    localStorage.setItem('isAuthenticated', 'true');
    navigate('/dashboard');
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1>Create Your Account</h1>
          <p>Join Jengo and start making an impact today</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              placeholder="Choose a username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength="8"
            />
          </div>

          <div className="form-group">
            <label>I am a...</label>
            <div className="role-selection">
              <button
                type="button"
                className={`role-option ${formData.role === 'volunteer' ? 'active' : ''}`}
                onClick={() => setFormData({ ...formData, role: 'volunteer' })}
              >
                <span className="role-icon">👤</span>
                <div className="role-text">
                  <strong>Volunteer</strong>
                  <span>Browse and apply to opportunities</span>
                </div>
              </button>
              <button
                type="button"
                className={`role-option ${formData.role === 'nonprofit' ? 'active' : ''}`}
                onClick={() => setFormData({ ...formData, role: 'nonprofit' })}
              >
                <span className="role-icon">🏢</span>
                <div className="role-text">
                  <strong>Nonprofit</strong>
                  <span>Post opportunities and manage volunteers</span>
                </div>
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-full">
            Create Account
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
