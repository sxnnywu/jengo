// Mock data for the prototype

export const mockOpportunities = [
  {
    id: '1',
    title: 'Grant Writing Assistant',
    company: 'Community Health Foundation',
    location: 'San Francisco, CA',
    workMode: 'Hybrid',
    postedTime: 'Today',
    deadline: 'January 30, 2024',
    description: 'We are seeking a motivated volunteer to assist with grant writing and research. You will work closely with our development team to identify funding opportunities and draft compelling grant proposals.',
    skillsRequired: ['Grant Writing', 'Research', 'Writing', 'Nonprofit', 'Communication'],
    estimatedHours: 20,
    category: 'Grant Writing',
    logo: null,
    nonprofitId: 'np1',
    status: 'open'
  },
  {
    id: '2',
    title: 'Social Media Content Creator',
    company: 'Youth Empowerment Network',
    location: 'New York, NY',
    workMode: 'In person',
    postedTime: 'Today',
    deadline: 'February 5, 2024',
    description: 'Help us amplify our message! We need creative volunteers to develop engaging social media content, manage our online presence, and help grow our community.',
    skillsRequired: ['Social Media', 'Content Creation', 'Marketing', 'Design', 'Communication'],
    estimatedHours: 15,
    category: 'Social Media',
    logo: null,
    nonprofitId: 'np2',
    status: 'open'
  },
  {
    id: '3',
    title: 'Community Outreach Coordinator',
    company: 'Green Earth Initiative',
    location: 'Portland, OR',
    workMode: 'In person',
    postedTime: '2 days ago',
    deadline: 'February 10, 2024',
    description: 'Join our team in connecting with local communities to promote environmental awareness. You will organize events, engage with volunteers, and help spread our mission.',
    skillsRequired: ['Outreach', 'Event Planning', 'Public Speaking', 'Community Engagement', 'Organization'],
    estimatedHours: 25,
    category: 'Outreach',
    logo: null,
    nonprofitId: 'np3',
    status: 'open'
  },
  {
    id: '4',
    title: 'Website Development Volunteer',
    company: 'Tech for Good',
    location: 'Remote',
    workMode: 'Remote',
    postedTime: '3 days ago',
    deadline: 'February 15, 2024',
    description: 'We need tech-savvy volunteers to help redesign and maintain our website. Experience with web development, design, or content management is preferred.',
    skillsRequired: ['Web Development', 'HTML/CSS', 'JavaScript', 'WordPress', 'Design'],
    estimatedHours: 30,
    category: 'Administrative',
    logo: null,
    nonprofitId: 'np4',
    status: 'open'
  },
  {
    id: '5',
    title: 'Fundraising Event Assistant',
    company: 'Arts & Culture Alliance',
    location: 'Chicago, IL',
    workMode: 'Hybrid',
    postedTime: '4 days ago',
    deadline: 'February 20, 2024',
    description: 'Help us organize our annual fundraising gala! You will assist with event planning, vendor coordination, and day-of event management.',
    skillsRequired: ['Event Planning', 'Fundraising', 'Project Management', 'Organization', 'Networking'],
    estimatedHours: 20,
    category: 'Fundraising',
    logo: null,
    nonprofitId: 'np5',
    status: 'open'
  },
  {
    id: '6',
    title: 'Data Analysis Volunteer',
    company: 'Education Access Foundation',
    location: 'Boston, MA',
    workMode: 'Remote',
    postedTime: '5 days ago',
    deadline: 'February 25, 2024',
    description: 'Support our research team by analyzing program data and creating reports. This is a great opportunity to gain experience in data analysis and nonprofit evaluation.',
    skillsRequired: ['Data Analysis', 'Excel', 'Research', 'Analytics', 'Reporting'],
    estimatedHours: 18,
    category: 'Administrative',
    logo: null,
    nonprofitId: 'np6',
    status: 'open'
  }
];

export const mockApplications = [
  {
    id: 'app1',
    opportunityId: '1',
    volunteerId: 'vol1',
    volunteerName: 'Sarah Johnson',
    volunteerEmail: 'sarah@example.com',
    volunteerSchool: 'Lincoln High School',
    volunteerSkills: ['Writing', 'Research', 'Communication'],
    volunteerResume: 'https://example.com/resume-sarah.pdf',
    volunteerForm: 'https://example.com/volunteer-form-sarah.pdf',
    status: 'applied',
    appliedAt: '2024-01-15T10:00:00Z',
    opportunityTitle: 'Grant Writing Assistant'
  },
  {
    id: 'app2',
    opportunityId: '1',
    volunteerId: 'vol2',
    volunteerName: 'Michael Chen',
    volunteerEmail: 'michael@example.com',
    volunteerSchool: 'Riverside University',
    volunteerSkills: ['Grant Writing', 'Research', 'Nonprofit'],
    volunteerResume: 'https://example.com/resume-michael.pdf',
    volunteerForm: 'https://example.com/volunteer-form-michael.pdf',
    status: 'applied',
    appliedAt: '2024-01-14T14:30:00Z',
    opportunityTitle: 'Grant Writing Assistant'
  },
  {
    id: 'app3',
    opportunityId: '2',
    volunteerId: 'vol3',
    volunteerName: 'Emily Rodriguez',
    volunteerEmail: 'emily@example.com',
    volunteerSchool: 'City College',
    volunteerSkills: ['Social Media', 'Content Creation', 'Design'],
    volunteerResume: 'https://example.com/resume-emily.pdf',
    volunteerForm: 'https://example.com/volunteer-form-emily.pdf',
    status: 'accepted',
    appliedAt: '2024-01-13T09:15:00Z',
    reviewedAt: '2024-01-14T16:00:00Z',
    opportunityTitle: 'Social Media Content Creator'
  }
];

export const mockUser = {
  id: '1',
  name: 'Demo User',
  username: 'demouser',
  email: 'demo@example.com',
  role: 'volunteer',
  credits: 179,
  location: 'San Francisco, CA',
  profilePhoto: '',
  school: '',
  skills: [],
  resume: '',
  volunteerForm: ''
};

export const mockNonprofit = {
  id: 'np1',
  name: 'Community Health Foundation',
  username: 'communityhealth',
  email: 'info@communityhealth.org',
  role: 'nonprofit',
  location: 'San Francisco, CA',
  organizationDescription: 'Dedicated to improving community health through education and outreach programs.',
  website: 'https://communityhealth.org',
  socialLinks: ['https://linkedin.com/company/communityhealth'],
  typicalVolunteerHours: '10-20 hours per week',
  logo: null
};
