import React from 'react';
import './RoleSwitcher.css';

const RoleSwitcher = ({ currentRole, onRoleChange }) => {
  return (
    <div className="role-switcher">
      <button
        className={`role-btn ${currentRole === 'volunteer' ? 'active' : ''}`}
        onClick={() => onRoleChange('volunteer')}
      >
        Volunteer View
      </button>
      <button
        className={`role-btn ${currentRole === 'nonprofit' ? 'active' : ''}`}
        onClick={() => onRoleChange('nonprofit')}
      >
        Nonprofit View
      </button>
    </div>
  );
};

export default RoleSwitcher;
