import React, { useState } from 'react';
import api from '../services/api';
import './Contact.css';

const Contact = () => {
	const [isSubmitted, setIsSubmitted] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submitError, setSubmitError] = useState('');

	const handleSubmit = async (event) => {
		event.preventDefault();
		setIsSubmitting(true);
		setSubmitError('');
		setIsSubmitted(false);

		const formData = new FormData(event.target);
		const payload = {
			name: formData.get('name')?.trim(),
			email: formData.get('email')?.trim(),
			message: formData.get('message')?.trim(),
			consent: Boolean(formData.get('consent'))
		};

		try {
			const response = await api.sendContactMessage(payload);
			if (!response?.success) {
				setSubmitError(response?.message || 'Something went wrong. Please try again.');
				return;
			}

			event.target.reset();
			setIsSubmitted(true);
		} catch (error) {
			setSubmitError('Something went wrong. Please try again.');
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<main className="contact-page">
			<section className="contact-hero">
				<div className="contact-shell">
					<div className="contact-hero-content">
						<span className="contact-pill">Say hello</span>
						<h1>Lets build something good together.</h1>
						<p>
							Whether you are a volunteer, organizer, or partner, we would love to hear what you are
							working on and how we can help.
						</p>
					</div>
					<div className="contact-hero-badges">
						<div className="contact-badge">Warm intro</div>
						<div className="contact-badge contact-badge--accent">2-day reply</div>
						<div className="contact-badge">No spam</div>
					</div>
				</div>
			</section>

			<section className="contact-content">
				<div className="contact-shell contact-grid">
					<div className="contact-form-wrap">
						<form className="contact-form" onSubmit={handleSubmit}>
							<div className="contact-form-header">
								<h2>Start the conversation</h2>
								<p>Tell us a little about what you are thinking.</p>
							</div>

							<div className="contact-row">
								<label className="contact-field">
									<span>Name</span>
									<input type="text" name="name" placeholder="Alex Rivers" required />
								</label>
								<label className="contact-field">
									<span>Email</span>
									<input type="email" name="email" placeholder="alex@email.com" required />
								</label>
							</div>

							<label className="contact-field">
								<span>Message</span>
								<textarea
									name="message"
									rows="5"
									placeholder="Share your idea, question, or a quick hello."
									required
								/>
							</label>

							<label className="contact-consent">
								<input type="checkbox" name="consent" />
								<span>I am happy to receive an occasional update from Jengo.</span>
							</label>

							<button className="contact-submit" type="submit" disabled={isSubmitting}>
								{isSubmitting ? 'Sending...' : 'Send message'}
							</button>

							{submitError && (
								<div className="contact-error" role="status">
									{submitError}
								</div>
							)}

							{isSubmitted && (
								<div className="contact-success" role="status">
									Thanks for reaching out. We will get back to you soon.
								</div>
							)}
						</form>
					</div>
				</div>
			</section>
		</main>
	);
};

export default Contact;
