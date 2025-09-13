import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Phone, MapPin, Clock, Star, Heart } from 'lucide-react';
import './Helpline.css';

const Helpline: React.FC = () => {
  const [selectedCity, setSelectedCity] = useState<string>('');

  const emergencyNumbers = [
    { name: 'Police', number: '100', available: '24/7' },
    { name: 'Ambulance', number: '102', available: '24/7' },
    { name: 'Women Helpline', number: '1091', available: '24/7' },
    { name: 'Child Helpline', number: '1098', available: '24/7' },
    { name: 'National Crisis Helpline', number: '1800-599-0019', available: '24/7' }
  ];

  const freeTherapists = [
    {
      id: 1,
      name: 'Dr. Priya Sharma',
      specialization: 'Anxiety & Depression',
      languages: ['Hindi', 'English'],
      experience: '8 years',
      rating: 4.8,
      location: 'Mumbai',
      availability: 'Mon-Fri 9AM-6PM',
      phone: '+91-98765-43210',
      isFree: true,
      description: 'Specializes in cognitive behavioral therapy for anxiety and depression. Provides free consultation for underprivileged patients.'
    },
    {
      id: 2,
      name: 'Dr. Rajesh Kumar',
      specialization: 'Family Therapy',
      languages: ['Hindi', 'Bengali'],
      experience: '12 years',
      rating: 4.9,
      location: 'Delhi',
      availability: 'Mon-Sat 10AM-7PM',
      phone: '+91-98765-43211',
      isFree: true,
      description: 'Expert in family counseling and relationship therapy. Offers free sessions for low-income families.'
    },
    {
      id: 3,
      name: 'Dr. Sunita Patel',
      specialization: 'Child Psychology',
      languages: ['Gujarati', 'Hindi', 'English'],
      experience: '6 years',
      rating: 4.7,
      location: 'Ahmedabad',
      availability: 'Tue-Sat 2PM-8PM',
      phone: '+91-98765-43212',
      isFree: true,
      description: 'Child and adolescent mental health specialist. Free consultation for children from economically weaker sections.'
    },
    {
      id: 4,
      name: 'Dr. Anil Singh',
      specialization: 'Trauma & PTSD',
      languages: ['Hindi', 'Punjabi'],
      experience: '10 years',
      rating: 4.6,
      location: 'Chandigarh',
      availability: 'Mon-Fri 9AM-5PM',
      phone: '+91-98765-43213',
      isFree: true,
      description: 'Trauma specialist with experience in crisis intervention. Provides free therapy for trauma survivors.'
    },
    {
      id: 5,
      name: 'Dr. Meera Iyer',
      specialization: 'Addiction Counseling',
      languages: ['Tamil', 'English'],
      experience: '7 years',
      rating: 4.5,
      location: 'Chennai',
      availability: 'Mon-Sat 8AM-6PM',
      phone: '+91-98765-43214',
      isFree: true,
      description: 'Addiction recovery specialist. Free counseling for substance abuse and addiction issues.'
    }
  ];

  const cityHelplines = {
    'Mumbai': [
      { name: 'Mumbai Police Helpline', number: '022-22621855', available: '24/7' },
      { name: 'iCall Helpline', number: '022-25521111', available: 'Mon-Sat 8AM-10PM' }
    ],
    'Delhi': [
      { name: 'Delhi Police Helpline', number: '011-23469100', available: '24/7' },
      { name: 'AASRA Delhi', number: '011-23389090', available: '24/7' }
    ],
    'Bangalore': [
      { name: 'Bangalore Police Helpline', number: '080-22943225', available: '24/7' },
      { name: 'Sneha Bangalore', number: '080-25497777', available: '24/7' }
    ],
    'Chennai': [
      { name: 'Chennai Police Helpline', number: '044-23452345', available: '24/7' },
      { name: 'Sneha Chennai', number: '044-24640050', available: '24/7' }
    ]
  };

  const filteredTherapists = selectedCity 
    ? freeTherapists.filter(t => t.location.toLowerCase().includes(selectedCity.toLowerCase()))
    : freeTherapists;

  return (
    <div className="helpline-page">
      <div className="helpline-header">
        <h1>Emergency Support & Free Counseling</h1>
        <p>Immediate help and free mental health services available 24/7</p>
      </div>

      <div className="helpline-content">
        <section className="emergency-section">
          <h2>Emergency Numbers</h2>
          <div className="emergency-grid">
            {emergencyNumbers.map((contact, index) => (
              <div key={index} className="emergency-card">
                <Phone className="emergency-icon" />
                <div className="emergency-info">
                  <h3>{contact.name}</h3>
                  <div className="emergency-number">{contact.number}</div>
                  <div className="emergency-availability">{contact.available}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="therapists-section">
          <div className="section-header">
            <h2>Free Consultation Therapists</h2>
            <div className="city-filter">
              <input
                type="text"
                placeholder="Filter by city (e.g., Mumbai, Delhi)"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="city-input"
              />
            </div>
          </div>

          <div className="therapists-grid">
            {filteredTherapists.map((therapist) => (
              <div key={therapist.id} className="therapist-card">
                <div className="therapist-header">
                  <div className="therapist-info">
                    <h3>{therapist.name}</h3>
                    <p className="specialization">{therapist.specialization}</p>
                    <div className="therapist-meta">
                      <span className="experience">{therapist.experience}</span>
                      <div className="rating">
                        <Star className="star-icon" />
                        {therapist.rating}
                      </div>
                    </div>
                  </div>
                  <div className="free-badge">
                    <Heart className="heart-icon" />
                    Free
                  </div>
                </div>

                <div className="therapist-details">
                  <div className="detail-row">
                    <MapPin className="detail-icon" />
                    <span>{therapist.location}</span>
                  </div>
                  <div className="detail-row">
                    <Clock className="detail-icon" />
                    <span>{therapist.availability}</span>
                  </div>
                  <div className="detail-row">
                    <Phone className="detail-icon" />
                    <span>{therapist.phone}</span>
                  </div>
                </div>

                <div className="languages">
                  <strong>Languages:</strong> {therapist.languages.join(', ')}
                </div>

                <p className="therapist-description">{therapist.description}</p>

                <div className="therapist-actions">
                  <a href={`tel:${therapist.phone}`} className="call-btn">
                    <Phone className="btn-icon" />
                    Call Now
                  </a>
                  <Link to="/chat" className="chat-btn">
                    Chat with AI
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {selectedCity && cityHelplines[selectedCity as keyof typeof cityHelplines] && (
          <section className="local-helplines">
            <h2>Local Helplines - {selectedCity}</h2>
            <div className="local-grid">
              {cityHelplines[selectedCity as keyof typeof cityHelplines].map((helpline, index) => (
                <div key={index} className="local-card">
                  <h3>{helpline.name}</h3>
                  <div className="local-number">{helpline.number}</div>
                  <div className="local-availability">{helpline.available}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="crisis-resources">
          <h2>Additional Resources</h2>
          <div className="resources-grid">
            <div className="resource-card">
              <h3>Self-Help Techniques</h3>
              <ul>
                <li>Deep breathing exercises</li>
                <li>Progressive muscle relaxation</li>
                <li>Mindfulness meditation</li>
                <li>Grounding techniques</li>
              </ul>
            </div>
            <div className="resource-card">
              <h3>Online Support</h3>
              <ul>
                <li>24/7 AI Chat support</li>
                <li>Mood tracking tools</li>
                <li>Wellness activities</li>
                <li>Community forums</li>
              </ul>
            </div>
            <div className="resource-card">
              <h3>Emergency Procedures</h3>
              <ul>
                <li>Call emergency services (100)</li>
                <li>Go to nearest hospital</li>
                <li>Contact trusted friend/family</li>
                <li>Use crisis helplines</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Helpline;

