const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

// Mock counselor data (in a real app, this would come from a database)
const mockCounselors = [
  {
    id: '1',
    name: 'Dr. Priya Sharma',
    specialization: 'Anxiety & Depression',
    languages: ['Hindi', 'English'],
    experience: '8 years',
    rating: 4.8,
    available: true,
    consultation_fee: 500,
    next_available: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    name: 'Dr. Rajesh Kumar',
    specialization: 'Family Therapy',
    languages: ['Hindi', 'Bengali'],
    experience: '12 years',
    rating: 4.9,
    available: true,
    consultation_fee: 600,
    next_available: '2024-01-15T14:00:00Z'
  },
  {
    id: '3',
    name: 'Dr. Sunita Patel',
    specialization: 'Child Psychology',
    languages: ['Gujarati', 'Hindi', 'English'],
    experience: '6 years',
    rating: 4.7,
    available: false,
    consultation_fee: 450,
    next_available: '2024-01-16T09:00:00Z'
  }
];

// Get available counselors
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { specialization, language, max_fee } = req.query;

    let filteredCounselors = mockCounselors;

    // Filter by specialization
    if (specialization) {
      filteredCounselors = filteredCounselors.filter(counselor =>
        counselor.specialization.toLowerCase().includes(specialization.toLowerCase())
      );
    }

    // Filter by language
    if (language) {
      filteredCounselors = filteredCounselors.filter(counselor =>
        counselor.languages.some(lang => 
          lang.toLowerCase().includes(language.toLowerCase())
        )
      );
    }

    // Filter by maximum fee
    if (max_fee) {
      filteredCounselors = filteredCounselors.filter(counselor =>
        counselor.consultation_fee <= parseInt(max_fee)
      );
    }

    res.json({
      success: true,
      data: filteredCounselors
    });
  } catch (error) {
    console.error('Get counselors error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get counselor details
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const counselor = mockCounselors.find(c => c.id === id);

    if (!counselor) {
      return res.status(404).json({
        success: false,
        message: 'Counselor not found'
      });
    }

    res.json({
      success: true,
      data: counselor
    });
  } catch (error) {
    console.error('Get counselor details error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Request counselor consultation
router.post('/:id/request', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { preferred_time, urgency, message } = req.body;

    const counselor = mockCounselors.find(c => c.id === id);
    if (!counselor) {
      return res.status(404).json({
        success: false,
        message: 'Counselor not found'
      });
    }

    if (!counselor.available) {
      return res.status(400).json({
        success: false,
        message: 'Counselor is not available at the moment'
      });
    }

    // In a real app, this would create a consultation request in the database
    const consultationRequest = {
      id: Date.now().toString(),
      counselor_id: id,
      user_id: req.user.userId,
      preferred_time,
      urgency,
      message,
      status: 'pending',
      created_at: new Date()
    };

    res.json({
      success: true,
      message: 'Consultation request submitted successfully',
      data: consultationRequest
    });
  } catch (error) {
    console.error('Request consultation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get user's consultation history
router.get('/consultations/history', authenticateToken, async (req, res) => {
  try {
    // Mock consultation history
    const consultations = [
      {
        id: '1',
        counselor_name: 'Dr. Priya Sharma',
        date: '2024-01-10T10:00:00Z',
        duration: 60,
        status: 'completed',
        rating: 5,
        notes: 'Very helpful session'
      },
      {
        id: '2',
        counselor_name: 'Dr. Rajesh Kumar',
        date: '2024-01-05T14:00:00Z',
        duration: 45,
        status: 'completed',
        rating: 4,
        notes: 'Good insights provided'
      }
    ];

    res.json({
      success: true,
      data: consultations
    });
  } catch (error) {
    console.error('Get consultation history error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Rate counselor consultation
router.post('/consultations/:id/rate', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, feedback } = req.body;

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    // In a real app, this would update the consultation rating in the database
    res.json({
      success: true,
      message: 'Rating submitted successfully',
      data: {
        consultation_id: id,
        rating,
        feedback,
        rated_at: new Date()
      }
    });
  } catch (error) {
    console.error('Rate consultation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;





