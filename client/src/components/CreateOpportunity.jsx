import React, { useState } from 'react';
import './CreateOpportunity.css';

const CreateOpportunity = ({ onOpportunityCreated }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    skillsRequired: [],
    estimatedHours: '',
    deadline: '',
    location: ''
  });
  const [currentSkill, setCurrentSkill] = useState('');

  const categories = [
    'Grant Writing',
    'Social Media',
    'Outreach',
    'Event Planning',
    'Administrative',
    'Marketing',
    'Fundraising',
    'Other'
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (currentSkill.trim() && !formData.skillsRequired.includes(currentSkill.trim())) {
      setFormData({
        ...formData,
        skillsRequired: [...formData.skillsRequired, currentSkill.trim()]
      });
      setCurrentSkill('');
    }
  };

  const handleRemoveSkill = (skill) => {
    setFormData({
      ...formData,
      skillsRequired: formData.skillsRequired.filter(s => s !== skill)
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newOpportunity = {
      id: Date.now().toString(),
      ...formData,
      estimatedHours: parseInt(formData.estimatedHours),
      company: JSON.parse(localStorage.getItem('currentUser'))?.name || 'Your Organization',
      postedTime: 'Just now',
      logo: '🏢',
      nonprofitId: JSON.parse(localStorage.getItem('currentUser'))?.id || 'np1',
      status: 'open'
    };
    
    // Store in localStorage for demo
    const existing = JSON.parse(localStorage.getItem('myOpportunities') || '[]');
    existing.push(newOpportunity);
    localStorage.setItem('myOpportunities', JSON.stringify(existing));
    
    alert('Opportunity created successfully!');
    onOpportunityCreated(newOpportunity);
    
    // Reset form
    setFormData({
      title: '',
      description: '',
      category: '',
      skillsRequired: [],
      estimatedHours: '',
      deadline: '',
      location: ''
    });
  };

  return (
    <div className="create-opportunity">
      <h2>Create New Opportunity</h2>
      <form onSubmit={handleSubmit} className="opportunity-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Grant Writing Assistant"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="category">Category *</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="">Select category</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="description">Description *</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe the volunteer opportunity..."
            rows="5"
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="location">Location *</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g., San Francisco, CA or Remote"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="estimatedHours">Estimated Hours *</label>
            <input
              type="number"
              id="estimatedHours"
              name="estimatedHours"
              value={formData.estimatedHours}
              onChange={handleChange}
              placeholder="e.g., 20"
              min="1"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="deadline">Application Deadline *</label>
            <input
              type="date"
              id="deadline"
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="skills">Required Skills</label>
          <div className="skills-input-group">
            <input
              type="text"
              id="skills"
              value={currentSkill}
              onChange={(e) => setCurrentSkill(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddSkill(e)}
              placeholder="Add a skill and press Enter"
            />
            <button type="button" onClick={handleAddSkill} className="btn-add-skill">
              Add
            </button>
          </div>
          <div className="skills-tags">
            {formData.skillsRequired.map((skill, index) => (
              <span key={index} className="skill-tag">
                {skill}
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="remove-skill"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            Create Opportunity
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateOpportunity;
