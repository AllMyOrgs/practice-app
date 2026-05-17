import { useState } from 'react';
import './SubmissionForm.css';

const DEPARTMENTS = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations'];
const EXPERIENCE_LEVELS = ['Junior (0–2 yrs)', 'Mid-level (2–5 yrs)', 'Senior (5+ yrs)'];
const SKILLS = ['JavaScript', 'Python', 'React', 'Node.js', 'SQL', 'Docker', 'AWS', 'TypeScript'];

const INITIAL_STATE = {
  name: '',
  email: '',
  department: '',
  experience: '',
  skills: [],
  agreeToTerms: false,
};

export default function SubmissionForm({ onSubmitSuccess }) {
  const [formData, setFormData] = useState(INITIAL_STATE);
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  const validate = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Enter a valid email';
    if (!formData.department) errors.department = 'Please select a department';
    if (!formData.experience) errors.experience = 'Please select your experience level';
    if (formData.skills.length === 0) errors.skills = 'Select at least one skill';
    if (!formData.agreeToTerms) errors.agreeToTerms = 'You must agree to the terms';
    return errors;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox' && name === 'skills') {
      setFormData(prev => ({
        ...prev,
        skills: checked
          ? [...prev.skills, value]
          : prev.skills.filter(s => s !== value),
      }));
    } else if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setStatus('loading');
    setErrorMsg('');

    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${apiUrl}/api/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Server error (${res.status})`);
      }

      setStatus('success');
      setFormData(INITIAL_STATE);
      setValidationErrors({});
      onSubmitSuccess?.();

      setTimeout(() => setStatus('idle'), 4000);
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.message);
    }
  };

  return (
    <form className="form-card" onSubmit={handleSubmit} noValidate>
      <h2 className="form-title">Registration Form</h2>

      {/* Text Input — Name */}
      <div className="field-group">
        <label htmlFor="name" className="field-label">
          Full Name <span className="required">*</span>
        </label>
        <input
          id="name"
          name="name"
          type="text"
          className={`field-input ${validationErrors.name ? 'field-input--error' : ''}`}
          placeholder="John Doe"
          value={formData.name}
          onChange={handleChange}
        />
        {validationErrors.name && <span className="field-error">{validationErrors.name}</span>}
      </div>

      {/* Email Input */}
      <div className="field-group">
        <label htmlFor="email" className="field-label">
          Email Address <span className="required">*</span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          className={`field-input ${validationErrors.email ? 'field-input--error' : ''}`}
          placeholder="john@example.com"
          value={formData.email}
          onChange={handleChange}
        />
        {validationErrors.email && <span className="field-error">{validationErrors.email}</span>}
      </div>

      {/* Dropdown — Department */}
      <div className="field-group">
        <label htmlFor="department" className="field-label">
          Department <span className="required">*</span>
        </label>
        <select
          id="department"
          name="department"
          className={`field-select ${validationErrors.department ? 'field-input--error' : ''}`}
          value={formData.department}
          onChange={handleChange}
        >
          <option value="">— Select a department —</option>
          {DEPARTMENTS.map(d => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        {validationErrors.department && (
          <span className="field-error">{validationErrors.department}</span>
        )}
      </div>

      {/* Radio — Experience Level */}
      <div className="field-group">
        <fieldset className="fieldset">
          <legend className="field-label">
            Experience Level <span className="required">*</span>
          </legend>
          <div className="radio-group">
            {EXPERIENCE_LEVELS.map(level => (
              <label key={level} className="radio-label">
                <input
                  type="radio"
                  name="experience"
                  value={level}
                  checked={formData.experience === level}
                  onChange={handleChange}
                  className="radio-input"
                />
                <span className="radio-text">{level}</span>
              </label>
            ))}
          </div>
        </fieldset>
        {validationErrors.experience && (
          <span className="field-error">{validationErrors.experience}</span>
        )}
      </div>

      {/* Checkboxes — Skills */}
      <div className="field-group">
        <fieldset className="fieldset">
          <legend className="field-label">
            Skills <span className="required">*</span>
          </legend>
          <div className="checkbox-grid">
            {SKILLS.map(skill => (
              <label key={skill} className="checkbox-label">
                <input
                  type="checkbox"
                  name="skills"
                  value={skill}
                  checked={formData.skills.includes(skill)}
                  onChange={handleChange}
                  className="checkbox-input"
                />
                <span className="checkbox-text">{skill}</span>
              </label>
            ))}
          </div>
        </fieldset>
        {validationErrors.skills && (
          <span className="field-error">{validationErrors.skills}</span>
        )}
      </div>

      {/* Single Checkbox — Terms */}
      <div className="field-group">
        <label className="checkbox-label checkbox-label--terms">
          <input
            type="checkbox"
            name="agreeToTerms"
            checked={formData.agreeToTerms}
            onChange={handleChange}
            className="checkbox-input"
          />
          <span className="checkbox-text">
            I agree to the <a href="#terms" className="link">terms and conditions</a>
          </span>
        </label>
        {validationErrors.agreeToTerms && (
          <span className="field-error">{validationErrors.agreeToTerms}</span>
        )}
      </div>

      {/* Status Messages */}
      {status === 'success' && (
        <div className="alert alert--success">
          Registration submitted successfully!
        </div>
      )}
      {status === 'error' && (
        <div className="alert alert--error">
          {errorMsg || 'Something went wrong. Please try again.'}
        </div>
      )}

      <button
        type="submit"
        className="submit-btn"
        disabled={status === 'loading'}
      >
        {status === 'loading' ? 'Submitting…' : 'Submit Registration'}
      </button>
    </form>
  );
}
