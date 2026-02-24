import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/auth-context';
import TagInput from '../components/TagInput';
import './Auth.css';

const VOLUNTEER_SKILL_SUGGESTIONS = [
  'Communication',
  'Project Management',
  'Social Media',
  'Content Writing',
  'Graphic Design',
  'UI/UX',
  'Web Development',
  'Mobile Development',
  'Data Analysis',
  'Research',
  'Fundraising',
  'Event Planning',
  'Tutoring',
  'Mentorship',
  'Translation',
  'Video Editing',
  'Photography',
  'Public Speaking',
  'Customer Support'
];

const INTEREST_SUGGESTIONS = [
  'Education',
  'Environment',
  'Healthcare',
  'Mental Health',
  'Animal Welfare',
  'Arts & Culture',
  'Technology',
  'Community',
  'Youth',
  'Seniors',
  'Food Security',
  'Human Rights',
  'Disaster Relief'
];

function passwordChecks(pw) {
  const v = pw || '';
  return {
    length: v.length >= 8,
    upper: /[A-Z]/.test(v),
    lower: /[a-z]/.test(v),
    number: /\d/.test(v),
    special: /[^A-Za-z0-9]/.test(v)
  };
}

const Register = () => {
  // Get role from URL params if present
  const urlParams = new URLSearchParams(window.location.search);
  const roleFromUrl = urlParams.get('role');
  
  const { register } = useAuth();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const formRef = useRef(null);
  const paneRefs = useRef([]);
  const [viewportHeight, setViewportHeight] = useState(undefined);
  const [completing, setCompleting] = useState(false);
  const [completePct, setCompletePct] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);
  const completionIntervalRef = useRef(null);
  const completionFadeTimeoutRef = useRef(null);

  const [formData, setFormData] = useState({
    role: roleFromUrl === 'nonprofit' ? 'nonprofit' : 'volunteer',

    // volunteer identity
    firstName: '',
    middleName: '',
    lastName: '',
    pronouns: '',

    // nonprofit identity
    orgName: '',

    username: '',
    email: '',

    location: '',
    age: '',

    // volunteer
    skills: [],
    interests: [],

    // nonprofit
    neededSkills: [],
    neededInterests: [],
    organizationDescription: '',
    website: '',

    password: '',
    confirmPassword: ''
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const steps = useMemo(() => {
    const flow = [{ key: 'role', label: 'Role' }];

    if (formData.role === 'nonprofit') {
      flow.push({ key: 'orgName', label: 'Organization' });
    } else {
      flow.push({ key: 'fullName', label: 'Name' });
    }

    flow.push(
      { key: 'username', label: 'Username' },
      { key: 'email', label: 'Email' },
      { key: 'password', label: 'Password' },
      { key: 'confirmPassword', label: 'Confirm' },
      { key: 'location', label: 'Location' }
    );

    if (formData.role === 'volunteer') {
      flow.push({ key: 'age', label: 'Age' });
      flow.push({ key: 'skills', label: 'Skills' });
      flow.push({ key: 'interests', label: 'Interests' });
    } else {
      flow.push({ key: 'website', label: 'Website' });
      flow.push({ key: 'orgDescription', label: 'Description' });
      flow.push({ key: 'neededSkills', label: 'Skills needed' });
      flow.push({ key: 'neededInterests', label: 'Focus areas' });
    }

    return flow;
  }, [formData.role]);

  const checks = useMemo(() => passwordChecks(formData.password), [formData.password]);
  const progressPct = useMemo(() => {
    const denom = Math.max(steps.length - 1, 1);
    return Math.round((step / denom) * 100);
  }, [step, steps.length]);

  useEffect(() => {
    setStep((s) => Math.min(s, Math.max(steps.length - 1, 0)));
  }, [steps.length]);

  const validateStep = (idx) => {
    const errors = {};
    const key = steps[idx]?.key;

    if (key === 'role') {
      if (!['volunteer', 'nonprofit'].includes(formData.role)) errors.role = 'Please select a role.';
    }

    if (key === 'fullName') {
      if (!formData.firstName.trim()) errors.firstName = 'First name is required.';
      if (!formData.lastName.trim()) errors.lastName = 'Last name is required.';
    }

    if (key === 'orgName') {
      if (!formData.orgName.trim()) errors.orgName = 'Organization name is required.';
    }

    if (key === 'username') {
      if (!formData.username.trim()) errors.username = 'Username is required.';
    }

    if (key === 'email') {
      if (!formData.email.trim()) errors.email = 'Email is required.';
    }

    if (key === 'location') {
      if (formData.location && formData.location.trim().length < 2) errors.location = 'Please enter a valid location.';
    }

    if (key === 'age') {
      const age = formData.age ? Number(formData.age) : null;
      if (formData.age && (!Number.isFinite(age) || age < 13 || age > 120)) {
        errors.age = 'Please enter a valid age.';
      }
    }

    if (key === 'website') {
      if (formData.website && !/^https?:\/\//i.test(formData.website.trim())) {
        errors.website = 'Website must start with http:// or https://';
      }
    }

    if (key === 'skills') {
      if (formData.skills.length === 0) errors.skills = 'Add at least one skill.';
    }

    if (key === 'interests') {
      if (formData.interests.length === 0) errors.interests = 'Add at least one interest.';
    }

    if (key === 'neededSkills') {
      if (formData.neededSkills.length === 0) errors.neededSkills = 'Add at least one skill you need.';
    }

    if (key === 'neededInterests') {
      if (formData.neededInterests.length === 0) errors.neededInterests = 'Add at least one task/focus area.';
    }

    if (key === 'password') {
      const allOk = Object.values(checks).every(Boolean);
      if (!allOk) errors.password = 'Password does not meet the requirements.';
    }

    if (key === 'confirmPassword') {
      if (!formData.confirmPassword) errors.confirmPassword = 'Please confirm your password.';
      else if (formData.password !== formData.confirmPassword) errors.confirmPassword = 'Passwords do not match.';
    }

    return errors;
  };

  const [stepErrors, setStepErrors] = useState({});

  const goNext = () => {
    if (submitting || completing) return;
    const errors = validateStep(step);
    setStepErrors(errors);
    if (Object.keys(errors).length > 0) {
      requestAnimationFrame(() => {
        const root = formRef.current;
        if (!root) return;
        const firstKey = Object.keys(errors)[0];

        let el =
          root.querySelector(`[name="${firstKey}"]`) ||
          root.querySelector(`#${CSS.escape(firstKey)}`) ||
          null;

        if (!el && firstKey === 'role') {
          el = root.querySelector('.role-option');
        }

        if (!el && (firstKey === 'skills' || firstKey === 'interests' || firstKey === 'neededSkills' || firstKey === 'neededInterests')) {
          el = root.querySelector('.tag-input input') || root.querySelector('.tag-input');
        }

        if (el?.scrollIntoView) el.scrollIntoView({ block: 'center', behavior: 'smooth' });
        if (el?.focus) el.focus();
      });
      return;
    }
    setStep((s) => Math.min(s + 1, steps.length - 1));
  };

  const goBack = () => {
    if (submitting || completing) return;
    setSubmitError('');
    setStepErrors({});
    setStep((s) => Math.max(s - 1, 0));
  };

  useEffect(() => {
    return () => {
      if (completionIntervalRef.current) window.clearInterval(completionIntervalRef.current);
      if (completionFadeTimeoutRef.current) window.clearTimeout(completionFadeTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    const el = paneRefs.current[step];
    if (!el) return;

    const measure = () => {
      const panel = el.querySelector('.wizard-panel');
      // Measure the content (not the stretched flex item) to avoid feedback loops that grow the viewport.
      const next = Math.ceil((panel?.scrollHeight ?? el.scrollHeight)) + 8;
      setViewportHeight(next);
    };

    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [step, formData.role]);

  const startCompletionTransition = () => {
    const FILL_MS = 1600;
    const FADE_MS = 320;

    if (completionIntervalRef.current) window.clearInterval(completionIntervalRef.current);
    if (completionFadeTimeoutRef.current) window.clearTimeout(completionFadeTimeoutRef.current);

    setCompleting(true);
    setFadeOut(false);
    setCompletePct(0);

    const startedAt = Date.now();
    completionIntervalRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const pct = Math.min(100, Math.round((elapsed / FILL_MS) * 100));
      setCompletePct(pct);
      if (pct >= 100) {
        if (completionIntervalRef.current) window.clearInterval(completionIntervalRef.current);
        completionIntervalRef.current = null;

        setFadeOut(true);
        completionFadeTimeoutRef.current = window.setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, FADE_MS);
      }
    }, 40);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting || completing) return;
    setSubmitError('');

    const errors = validateStep(step);
    setStepErrors(errors);
    if (Object.keys(errors).length > 0) return;

    // Final validation across all steps
    const allErrors = steps.reduce((acc, _, idx) => Object.assign(acc, validateStep(idx)), {});
    if (Object.keys(allErrors).length > 0) {
      setStepErrors(allErrors);
      setStep(0);
      return;
    }

    setSubmitting(true);
    try {
      const displayName =
        formData.role === 'nonprofit'
          ? formData.orgName.trim()
          : [formData.firstName, formData.middleName, formData.lastName].map((s) => s.trim()).filter(Boolean).join(' ');

      const payload = {
        name: displayName,
        pronouns: formData.role === 'volunteer' ? formData.pronouns.trim() : undefined,
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role,
        location: formData.location.trim(),
        age: formData.role === 'volunteer' && formData.age ? Number(formData.age) : undefined,

        skills: formData.role === 'volunteer' ? formData.skills : undefined,
        interests: formData.role === 'volunteer' ? formData.interests : undefined,

        neededSkills: formData.role === 'nonprofit' ? formData.neededSkills : undefined,
        neededInterests: formData.role === 'nonprofit' ? formData.neededInterests : undefined,
        organizationDescription: formData.role === 'nonprofit' ? formData.organizationDescription : undefined,
        website: formData.role === 'nonprofit' ? formData.website : undefined,

        matchingProfile: {
          text: '',
          keywords: []
        }
      };

      const result = await register(payload);
      if (!result.success) {
        setSubmitError(result.error || 'Registration failed.');
        return;
      }

      // Keep legacy localStorage flags so the rest of the app keeps working.
      localStorage.setItem('isAuthenticated', 'true');
      // AuthContext already stored token and user; we also store a lightweight user object for existing dashboard logic.
      const safeUser = {
        id: result.user?._id,
        _id: result.user?._id,
        name: result.user?.name || displayName,
        pronouns: result.user?.pronouns || (formData.role === 'volunteer' ? formData.pronouns.trim() : undefined),
        username: result.user?.username,
        email: result.user?.email,
        role: result.user?.role,

        location: formData.location.trim(),
        age: formData.role === 'volunteer' && formData.age ? Number(formData.age) : undefined,
        skills: formData.role === 'volunteer' ? formData.skills : undefined,
        interests: formData.role === 'volunteer' ? formData.interests : undefined,
        neededSkills: formData.role === 'nonprofit' ? formData.neededSkills : undefined,
        neededInterests: formData.role === 'nonprofit' ? formData.neededInterests : undefined,
        organizationDescription: formData.role === 'nonprofit' ? formData.organizationDescription : undefined,
        website: formData.role === 'nonprofit' ? formData.website : undefined,
        matchingProfile: { text: '', keywords: [] }
      };
      localStorage.setItem('currentUser', JSON.stringify(safeUser));

      startCompletionTransition();
    } catch (err) {
      setSubmitError(err?.message || 'Registration failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const isLastStep = step >= steps.length - 1;
  const handleWizardKeyDown = (e) => {
    if (submitting || completing) return;
    if (e.key !== 'Enter') return;
    if (isLastStep) return;
    if (e.target?.tagName?.toLowerCase() === 'textarea') return;
    if (e.target?.closest?.('.tag-input')) return;
    e.preventDefault();
    goNext();
  };

  const renderStep = (key) => {
    switch (key) {
      case 'role':
        return (
          <>
            <div className="wizard-title">Choose your role</div>
            {stepErrors.role ? <div className="form-error">{stepErrors.role}</div> : null}
            <div className="role-selection">
              <button
                type="button"
                className={`role-option ${formData.role === 'volunteer' ? 'active' : ''}`}
                onClick={() => setFormData({ ...formData, role: 'volunteer' })}
              >
                <span className="role-icon" aria-hidden="true">V</span>
                <div className="role-text">
                  <strong>Volunteer</strong>
                  <span>Find opportunities and build experience</span>
                </div>
              </button>
              <button
                type="button"
                className={`role-option ${formData.role === 'nonprofit' ? 'active' : ''}`}
                onClick={() => setFormData({ ...formData, role: 'nonprofit' })}
              >
                <span className="role-icon" aria-hidden="true">N</span>
                <div className="role-text">
                  <strong>Nonprofit</strong>
                  <span>Post opportunities and review applicants</span>
                </div>
              </button>
            </div>
          </>
        );

      case 'fullName':
        return (
          <>
            <div className="wizard-title">Your name</div>
            <div className="wizard-subtitle">We’ll use this on your profile.</div>
            <div className="wizard-grid-2">
              <div className="form-group">
                <label htmlFor="firstName">First name</label>
                <input id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="First name" />
                {stepErrors.firstName ? <div className="form-error">{stepErrors.firstName}</div> : null}
              </div>
              <div className="form-group">
                <label htmlFor="middleName">Middle name (optional)</label>
                <input id="middleName" name="middleName" value={formData.middleName} onChange={handleChange} placeholder="Middle name" />
              </div>
              <div className="form-group">
                <label htmlFor="lastName">Last name</label>
                <input id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Last name" />
                {stepErrors.lastName ? <div className="form-error">{stepErrors.lastName}</div> : null}
              </div>
              <div className="form-group">
                <label htmlFor="pronouns">Pronouns (optional)</label>
                <input id="pronouns" name="pronouns" value={formData.pronouns} onChange={handleChange} placeholder="e.g., she/her, they/them" />
              </div>
            </div>
          </>
        );

      case 'orgName':
        return (
          <>
            <div className="wizard-title">Organization name</div>
            <div className="wizard-subtitle">This will appear on your nonprofit profile.</div>
            <div className="wizard-grid-2">
              <div className="form-group wizard-span-2">
                <label htmlFor="orgName">Organization</label>
                <input id="orgName" name="orgName" value={formData.orgName} onChange={handleChange} placeholder="Enter organization name" />
                {stepErrors.orgName ? <div className="form-error">{stepErrors.orgName}</div> : null}
              </div>
            </div>
          </>
        );

      case 'username':
        return (
          <>
            <div className="wizard-title">Choose a username</div>
            <div className="wizard-subtitle">This is how others will find you.</div>
            <div className="wizard-grid-2">
              <div className="form-group wizard-span-2">
                <label htmlFor="username">Username</label>
                <input id="username" name="username" value={formData.username} onChange={handleChange} placeholder="Choose a username" />
                {stepErrors.username ? <div className="form-error">{stepErrors.username}</div> : null}
              </div>
            </div>
          </>
        );

      case 'email':
        return (
          <>
            <div className="wizard-title">What’s your email?</div>
            <div className="wizard-subtitle">We’ll use it for account access and notifications.</div>
            <div className="wizard-grid-2">
              <div className="form-group wizard-span-2">
                <label htmlFor="email">Email</label>
                <input id="email" type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" />
                {stepErrors.email ? <div className="form-error">{stepErrors.email}</div> : null}
              </div>
            </div>
          </>
        );

      case 'location':
        return (
          <>
            <div className="wizard-title">Where are you located?</div>
            <div className="wizard-subtitle">City and state helps us match opportunities nearby.</div>
            <div className="wizard-grid-2">
              <div className="form-group wizard-span-2">
                <label htmlFor="location">Location</label>
                <input id="location" name="location" value={formData.location} onChange={handleChange} placeholder="City, State" />
                {stepErrors.location ? <div className="form-error">{stepErrors.location}</div> : null}
              </div>
            </div>
          </>
        );

      case 'age':
        return (
          <>
            <div className="wizard-title">Age (optional)</div>
            <div className="wizard-subtitle">Used for certain opportunity requirements.</div>
            <div className="wizard-grid-2">
              <div className="form-group wizard-span-2">
                <label htmlFor="age">Age</label>
                <input id="age" name="age" inputMode="numeric" value={formData.age} onChange={handleChange} placeholder="e.g., 18" />
                {stepErrors.age ? <div className="form-error">{stepErrors.age}</div> : null}
              </div>
            </div>
          </>
        );

      case 'website':
        return (
          <>
            <div className="wizard-title">Website (optional)</div>
            <div className="wizard-subtitle">Add a link people can learn more from.</div>
            <div className="wizard-grid-2">
              <div className="form-group wizard-span-2">
                <label htmlFor="website">Website</label>
                <input id="website" name="website" value={formData.website} onChange={handleChange} placeholder="https://example.org" />
                {stepErrors.website ? <div className="form-error">{stepErrors.website}</div> : null}
              </div>
            </div>
          </>
        );

      case 'orgDescription':
        return (
          <>
            <div className="wizard-title">Organization description (optional)</div>
            <div className="wizard-subtitle">A short summary of what you do.</div>
            <div className="wizard-grid-2">
              <div className="form-group wizard-span-2">
                <label htmlFor="organizationDescription">Description</label>
                <input
                  id="organizationDescription"
                  name="organizationDescription"
                  value={formData.organizationDescription}
                  onChange={handleChange}
                  placeholder="What do you do?"
                />
              </div>
            </div>
          </>
        );

      case 'skills':
        return (
          <>
            <div className="wizard-title">Your skills</div>
            <div className="wizard-subtitle">Add at least one skill you can offer.</div>
            <TagInput
              label="Skills"
              values={formData.skills}
              onChange={(skills) => setFormData({ ...formData, skills })}
              suggestions={VOLUNTEER_SKILL_SUGGESTIONS}
              placeholder="Start typing a skill (e.g., Graphic Design)"
            />
            {stepErrors.skills ? <div className="form-error">{stepErrors.skills}</div> : null}
          </>
        );

      case 'interests':
        return (
          <>
            <div className="wizard-title">Your interests</div>
            <div className="wizard-subtitle">Add at least one cause you care about.</div>
            <TagInput
              label="Interests"
              values={formData.interests}
              onChange={(interests) => setFormData({ ...formData, interests })}
              suggestions={INTEREST_SUGGESTIONS}
              placeholder="Start typing an interest (e.g., Education)"
            />
            {stepErrors.interests ? <div className="form-error">{stepErrors.interests}</div> : null}
          </>
        );

      case 'neededSkills':
        return (
          <>
            <div className="wizard-title">Skills you need</div>
            <div className="wizard-subtitle">What skills should a volunteer bring?</div>
            <TagInput
              label="Needed skills"
              values={formData.neededSkills}
              onChange={(neededSkills) => setFormData({ ...formData, neededSkills })}
              suggestions={VOLUNTEER_SKILL_SUGGESTIONS}
              placeholder="Start typing a needed skill"
            />
            {stepErrors.neededSkills ? <div className="form-error">{stepErrors.neededSkills}</div> : null}
          </>
        );

      case 'neededInterests':
        return (
          <>
            <div className="wizard-title">Tasks / focus areas</div>
            <div className="wizard-subtitle">What do you need help with?</div>
            <TagInput
              label="Focus areas"
              values={formData.neededInterests}
              onChange={(neededInterests) => setFormData({ ...formData, neededInterests })}
              suggestions={INTEREST_SUGGESTIONS}
              placeholder="Start typing a task or focus area"
            />
            {stepErrors.neededInterests ? <div className="form-error">{stepErrors.neededInterests}</div> : null}
          </>
        );

      case 'password':
        return (
          <>
            <div className="wizard-title">Create a password</div>
            <div className="wizard-subtitle">Make sure it meets the requirements.</div>
            <div className="wizard-grid-2">
              <div className="form-group wizard-span-2">
                <label htmlFor="password">Password</label>
                <div className="input-with-action">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a password"
                  />
                  <button type="button" className="toggle-visibility" onClick={() => setShowPassword((v) => !v)}>
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                {stepErrors.password ? <div className="form-error">{stepErrors.password}</div> : null}
              </div>

              <div className="password-requirements wizard-span-2" aria-label="Password requirements">
                <div className={`password-req ${checks.length ? 'ok' : ''}`}>
                  <span className="password-req__dot" /> At least 8 characters
                </div>
                <div className={`password-req ${checks.upper ? 'ok' : ''}`}>
                  <span className="password-req__dot" /> One uppercase letter
                </div>
                <div className={`password-req ${checks.lower ? 'ok' : ''}`}>
                  <span className="password-req__dot" /> One lowercase letter
                </div>
                <div className={`password-req ${checks.number ? 'ok' : ''}`}>
                  <span className="password-req__dot" /> One number
                </div>
                <div className={`password-req ${checks.special ? 'ok' : ''}`}>
                  <span className="password-req__dot" /> One special character
                </div>
              </div>
            </div>
          </>
        );

      case 'confirmPassword':
        return (
          <>
            <div className="wizard-title">Confirm password</div>
            <div className="wizard-subtitle">Re-enter your password to finish.</div>
            <div className="wizard-grid-2">
              <div className="form-group wizard-span-2">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <div className="input-with-action">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirm ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter password"
                  />
                  <button type="button" className="toggle-visibility" onClick={() => setShowConfirm((v) => !v)}>
                    {showConfirm ? 'Hide' : 'Show'}
                  </button>
                </div>
                {stepErrors.confirmPassword ? <div className="form-error">{stepErrors.confirmPassword}</div> : null}
              </div>
            </div>
            {submitError ? <div className="form-error">{submitError}</div> : null}
          </>
        );

      default:
        return null;
    }
  };

  const busy = submitting || completing;

  return (
    <div className={`auth-page auth-page--signup ${completing ? 'auth-page--completing' : ''} ${fadeOut ? 'auth-page--fade-out' : ''}`}>
      <div className="auth-container auth-container--wide">
        <form ref={formRef} className="wizard" onSubmit={handleSubmit} onKeyDown={handleWizardKeyDown}>
          <div className="wizard-progress" aria-label="Sign up progress">
            <div className="wizard-progress__track">
              <div className="wizard-progress__fill" style={{ width: `${progressPct}%` }} />
            </div>
          </div>

          <div className="wizard-viewport" style={viewportHeight ? { height: viewportHeight } : undefined}>
            <div className="wizard-track" style={{ transform: `translateX(-${step * 100}%)` }}>
              {steps.map((s, idx) => (
                <div
                  key={s.key}
                  className={`wizard-pane ${s.key === 'role' ? 'wizard-pane--role' : ''}`}
                  aria-hidden={step !== idx}
                  ref={(node) => { paneRefs.current[idx] = node; }}
                >
                  <div className="wizard-panel">{renderStep(s.key)}</div>
                </div>
              ))}
            </div>

            {completing ? (
              <div className="wizard-completeOverlay" role="status" aria-live="polite">
                <div className="wizard-completeCard">
                  <div className="wizard-title">Setting up your dashboard…</div>
                  <div className="wizard-subtitle">Hang tight — we’re finishing a few things.</div>
                  <div className="wizard-progress__track wizard-completeTrack" aria-hidden="true">
                    <div className="wizard-progress__fill wizard-completeFill" style={{ width: `${completePct}%` }} />
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <div className="wizard-nav">
            <button type="button" className="btn btn-ghost" onClick={goBack} disabled={step === 0 || busy}>
              Back
            </button>

            {!isLastStep ? (
              <button type="button" className="btn btn-primary" onClick={goNext} disabled={busy}>
                Next
              </button>
            ) : (
              <button type="submit" className="btn btn-primary" disabled={busy}>
                {busy ? 'Creating...' : 'Create Account'}
              </button>
            )}
          </div>

          {submitError ? (
            <div className="form-error" role="alert">
              {submitError}
            </div>
          ) : null}
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
