import React from 'react';
import '../css/LandingPage.css';
     // your existing navbar component

function LandingPage() {
    return (
        <div className="landing-page">


            {/* Hero Section */}
            <section className="hero">
                <div className="hero-content">
                    <h1>Welcome to Smart Parking</h1>
                    <p>
                        Experience the future of parking with real-time availability,
                        easy booking, and secure payments — all in one platform.
                    </p>
                    {/* <button className="cta-btn">Get Started</button> */}
                </div>
            </section>

            {/* Additional Sections */}
            <section className="features">
                <h2>Why Choose Us?</h2>
                <div className="feature-list">
                    <div className="feature">
                        <h3>🚗 Real-time Tracking</h3>
                        <p>Find available spots instantly with live updates.</p>
                    </div>
                    <div className="feature">
                        <h3>💳 Easy Payments</h3>
                        <p>Pay securely with integrated payment solutions.</p>
                    </div>
                    <div className="feature">
                        <h3>📱 Mobile Friendly</h3>
                        <p>Manage bookings and payments on the go.</p>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default LandingPage;
