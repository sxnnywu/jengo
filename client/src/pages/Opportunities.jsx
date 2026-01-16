import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import OpportunityCard from '../components/OpportunityCard';
import { mockOpportunities } from '../utils/mockData';
import './Opportunities.css';

const Opportunities = () => {
  const [opportunities, setOpportunities] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    setOpportunities(mockOpportunities);
  }, []);

  return (
    <div className="opportunities-page">
      <div className="opportunities-header">
        <div className="container">
          <h1>Volunteer Opportunities</h1>
          <p>Discover meaningful ways to make an impact in your community</p>
        </div>
      </div>
      <div className="opportunities-content">
        <div className="container">
          {opportunities.length === 0 ? (
            <div className="empty-state">
              <h3>No opportunities available</h3>
              <p>Check back soon for new volunteer opportunities!</p>
            </div>
          ) : (
            <div className="opportunities-grid">
              {opportunities.map((opp) => (
                <OpportunityCard key={opp.id} opportunity={opp} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Opportunities;
