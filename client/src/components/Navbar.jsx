import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';
import jengoLogo from '../assets/jengologo.png';

const Navbar = () => {
  const navigate = useNavigate();
  const isAuthenticated = localStorage.getItem('isAuthenticated');

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('currentUser');
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" aria-label="Jengo">
          <img className="hero-logo" src={jengoLogo} alt="Jengo" />
        </Link>
        
        <div className="navbar-menu">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="navbar-link">
                Dashboard
              </Link>
              <button onClick={handleLogout} className="navbar-link btn-logout">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/opportunities" className="navbar-link">
                Opportunities
              </Link>
              <Link to="/login" className="navbar-link">
                Sign In
              </Link>
              <Link to="/register" className="navbar-link btn-signup">
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
