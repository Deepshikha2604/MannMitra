const express = require('express');
const { User, ChatMessage } = require('../models');
const { sendEmergencyAlert } = require('../services/smsService');

const router = express.Router();

// Crisis detection endpoint (no auth required for emergency access)
router.post('/detect', async (req, res) => {
  try {
    const { message, phone, location } = req.body;

    if (!message) {
      return res.status(400).json({
        error: 'Message required',
        message: 'Please provide a message to analyze'
      });
    }

    const crisisLevel = detectCrisisLevel(message);
    const helplines = getHelplines(location);

    // If critical crisis detected, send emergency alert
    if (crisisLevel === 'critical' && phone) {
      await sendEmergencyAlert(phone, location, crisisLevel);
    }

    res.json({
      crisisLevel,
      helplines,
      immediateSupport: getImmediateSupport(crisisLevel),
      message: getCrisisResponse(crisisLevel)
    });

  } catch (error) {
    console.error('Error in crisis detection:', error);
    res.status(500).json({
      error: 'Crisis detection failed',
      message: 'Please contact emergency services directly',
      emergencyNumbers: getEmergencyNumbers()
    });
  }
});

// Get helplines by location
router.get('/helplines', async (req, res) => {
  try {
    const { location, language = 'hindi' } = req.query;
    const helplines = getHelplines(location, language);

    res.json({
      helplines,
      message: 'Emergency support available 24/7'
    });

  } catch (error) {
    console.error('Error fetching helplines:', error);
    res.status(500).json({
      error: 'Failed to fetch helplines',
      message: 'Please contact emergency services directly',
      emergencyNumbers: getEmergencyNumbers()
    });
  }
});

// Log crisis incident (for authenticated users)
router.post('/log', async (req, res) => {
  try {
    const { userId } = req.user;
    const { 
      crisisLevel, 
      description, 
      location, 
      helplineContacted,
      outcome 
    } = req.body;

    // Create crisis log entry
    await ChatMessage.create({
      user_id: userId,
      session_id: 'crisis-' + Date.now(),
      message_type: 'system',
      content: `Crisis incident logged: ${crisisLevel} - ${description}`,
      crisis_detected: true,
      crisis_level: crisisLevel,
      context_data: {
        description,
        location,
        helplineContacted,
        outcome,
        timestamp: new Date().toISOString()
      }
    });

    res.json({
      message: 'Crisis incident logged successfully',
      support: getCrisisSupport(crisisLevel)
    });

  } catch (error) {
    console.error('Error logging crisis incident:', error);
    res.status(500).json({
      error: 'Failed to log crisis incident',
      message: 'Please contact emergency services directly'
    });
  }
});

// Get crisis resources
router.get('/resources', async (req, res) => {
  try {
    const { language = 'hindi' } = req.query;

    const resources = {
      immediateHelp: getImmediateHelpResources(language),
      selfHelp: getSelfHelpResources(language),
      professionalHelp: getProfessionalHelpResources(language),
      communitySupport: getCommunitySupportResources(language)
    };

    res.json(resources);

  } catch (error) {
    console.error('Error fetching crisis resources:', error);
    res.status(500).json({
      error: 'Failed to fetch resources',
      message: 'Please contact emergency services directly'
    });
  }
});

// Helper functions
function detectCrisisLevel(message) {
  const lowerMessage = message.toLowerCase();
  
  const criticalKeywords = [
    'suicide', 'kill myself', 'end my life', 'want to die', 'no reason to live',
    'harm myself', 'self harm', 'cut myself', 'overdose', 'jump off',
    'hanging', 'poison', 'gun', 'weapon', 'death', 'die'
  ];
  
  const highKeywords = [
    'hopeless', 'worthless', 'no hope', 'can\'t take it', 'tired of living',
    'better off dead', 'no one cares', 'alone', 'isolated'
  ];
  
  const mediumKeywords = [
    'depressed', 'sad', 'lonely', 'anxious', 'worried', 'stressed',
    'overwhelmed', 'can\'t cope', 'need help'
  ];

  const criticalCount = criticalKeywords.filter(word => lowerMessage.includes(word)).length;
  const highCount = highKeywords.filter(word => lowerMessage.includes(word)).length;
  const mediumCount = mediumKeywords.filter(word => lowerMessage.includes(word)).length;

  if (criticalCount >= 2) return 'critical';
  if (criticalCount >= 1 || highCount >= 2) return 'high';
  if (highCount >= 1 || mediumCount >= 3) return 'medium';
  return 'low';
}

function getHelplines(location, language = 'hindi') {
  const nationalHelplines = {
    hindi: [
      {
        name: 'National Crisis Helpline',
        number: '1800-599-0019',
        available: '24/7',
        languages: ['Hindi', 'English']
      },
      {
        name: 'Vandrevala Foundation',
        number: '1860-266-2345',
        available: '24/7',
        languages: ['Hindi', 'English', 'Gujarati']
      },
      {
        name: 'iCall Helpline',
        number: '022-25521111',
        available: 'Mon-Sat 8AM-10PM',
        languages: ['Hindi', 'English', 'Marathi']
      }
    ],
    english: [
      {
        name: 'National Crisis Helpline',
        number: '1800-599-0019',
        available: '24/7',
        languages: ['Hindi', 'English']
      },
      {
        name: 'The Samaritans Mumbai',
        number: '+91-84229-84528',
        available: '24/7',
        languages: ['English']
      }
    ]
  };

  // Add location-specific helplines
  const locationHelplines = getLocationSpecificHelplines(location);
  
  return {
    national: nationalHelplines[language] || nationalHelplines.hindi,
    local: locationHelplines,
    emergency: getEmergencyNumbers()
  };
}

function getLocationSpecificHelplines(location) {
  const locationMap = {
    'mumbai': [
      {
        name: 'Mumbai Police Helpline',
        number: '022-22621855',
        available: '24/7',
        languages: ['Hindi', 'English', 'Marathi']
      }
    ],
    'delhi': [
      {
        name: 'Delhi Police Helpline',
        number: '011-23469100',
        available: '24/7',
        languages: ['Hindi', 'English']
      }
    ],
    'bangalore': [
      {
        name: 'Bangalore Police Helpline',
        number: '080-22943225',
        available: '24/7',
        languages: ['Hindi', 'English', 'Kannada']
      }
    ]
  };

  return locationMap[location?.toLowerCase()] || [];
}

function getEmergencyNumbers() {
  return [
    {
      name: 'Police',
      number: '100',
      available: '24/7'
    },
    {
      name: 'Ambulance',
      number: '102',
      available: '24/7'
    },
    {
      name: 'Women Helpline',
      number: '1091',
      available: '24/7'
    },
    {
      name: 'Child Helpline',
      number: '1098',
      available: '24/7'
    }
  ];
}

function getImmediateSupport(crisisLevel) {
  const support = {
    critical: [
      'Call emergency services immediately (100)',
      'Contact a crisis helpline',
      'Reach out to a trusted friend or family member',
      'Go to the nearest hospital emergency room',
      'Stay with someone you trust'
    ],
    high: [
      'Contact a crisis helpline',
      'Talk to a trusted friend or family member',
      'Consider speaking with a mental health professional',
      'Practice grounding techniques',
      'Remove yourself from harmful situations'
    ],
    medium: [
      'Talk to someone you trust',
      'Practice self-care activities',
      'Consider professional counseling',
      'Use relaxation techniques',
      'Take a break from stressful situations'
    ],
    low: [
      'Practice self-care',
      'Talk to friends or family',
      'Engage in positive activities',
      'Consider professional support if needed'
    ]
  };

  return support[crisisLevel] || support.low;
}

function getCrisisResponse(crisisLevel) {
  const responses = {
    critical: 'आपकी सुरक्षा सबसे महत्वपूर्ण है। कृपया तुरंत आपातकालीन सेवाओं से संपर्क करें।',
    high: 'आप अकेले नहीं हैं। कृपया किसी विश्वसनीय व्यक्ति से बात करें या क्राइसिस हेल्पलाइन पर कॉल करें।',
    medium: 'यह समय कठिन है, लेकिन यह गुजर जाएगा। कृपया किसी से बात करें और सहायता लें।',
    low: 'आपकी भावनाएं महत्वपूर्ण हैं। कृपया अपनी देखभाल करें और आवश्यकता पड़ने पर सहायता लें।'
  };

  return responses[crisisLevel] || responses.low;
}

function getCrisisSupport(crisisLevel) {
  return {
    immediate: getImmediateSupport(crisisLevel),
    resources: getCrisisResources(crisisLevel),
    followUp: getFollowUpSupport(crisisLevel)
  };
}

function getCrisisResources(crisisLevel) {
  const resources = {
    critical: [
      'Emergency services (100)',
      'Crisis helplines',
      'Hospital emergency rooms',
      'Trusted friends/family'
    ],
    high: [
      'Crisis helplines',
      'Mental health professionals',
      'Support groups',
      'Trusted friends/family'
    ],
    medium: [
      'Mental health professionals',
      'Support groups',
      'Self-help resources',
      'Friends and family'
    ],
    low: [
      'Self-help resources',
      'Friends and family',
      'Professional counseling',
      'Wellness activities'
    ]
  };

  return resources[crisisLevel] || resources.low;
}

function getFollowUpSupport(crisisLevel) {
  const followUp = {
    critical: [
      'Immediate professional intervention',
      'Safety planning',
      'Regular check-ins',
      'Medication evaluation if needed'
    ],
    high: [
      'Professional counseling',
      'Safety planning',
      'Regular support check-ins',
      'Coping strategy development'
    ],
    medium: [
      'Professional counseling',
      'Support group participation',
      'Coping skill development',
      'Regular self-care practices'
    ],
    low: [
      'Self-care practices',
      'Support from friends/family',
      'Professional help if needed',
      'Wellness activities'
    ]
  };

  return followUp[crisisLevel] || followUp.low;
}

function getImmediateHelpResources(language) {
  const resources = {
    hindi: [
      {
        title: 'तत्काल सहायता',
        description: 'आपातकालीन स्थिति में तुरंत सहायता प्राप्त करें',
        actions: [
          'पुलिस को कॉल करें (100)',
          'एम्बुलेंस कॉल करें (102)',
          'क्राइसिस हेल्पलाइन पर कॉल करें',
          'निकटतम अस्पताल जाएं'
        ]
      }
    ],
    english: [
      {
        title: 'Immediate Help',
        description: 'Get immediate assistance in emergency situations',
        actions: [
          'Call Police (100)',
          'Call Ambulance (102)',
          'Call Crisis Helpline',
          'Go to nearest hospital'
        ]
      }
    ]
  };

  return resources[language] || resources.hindi;
}

function getSelfHelpResources(language) {
  const resources = {
    hindi: [
      {
        title: 'स्व-सहायता तकनीक',
        description: 'तनाव और चिंता को कम करने के लिए तकनीक',
        techniques: [
          'गहरी सांस लेने का व्यायाम',
          'प्रगतिशील मांसपेशी विश्राम',
          'माइंडफुलनेस मेडिटेशन',
          'ग्राउंडिंग तकनीक'
        ]
      }
    ],
    english: [
      {
        title: 'Self-Help Techniques',
        description: 'Techniques to reduce stress and anxiety',
        techniques: [
          'Deep breathing exercises',
          'Progressive muscle relaxation',
          'Mindfulness meditation',
          'Grounding techniques'
        ]
      }
    ]
  };

  return resources[language] || resources.hindi;
}

function getProfessionalHelpResources(language) {
  const resources = {
    hindi: [
      {
        title: 'पेशेवर सहायता',
        description: 'मानसिक स्वास्थ्य पेशेवरों से संपर्क करें',
        options: [
          'मनोचिकित्सक',
          'मनोवैज्ञानिक',
          'काउंसलर',
          'थेरेपिस्ट'
        ]
      }
    ],
    english: [
      {
        title: 'Professional Help',
        description: 'Contact mental health professionals',
        options: [
          'Psychiatrist',
          'Psychologist',
          'Counselor',
          'Therapist'
        ]
      }
    ]
  };

  return resources[language] || resources.hindi;
}

function getCommunitySupportResources(language) {
  const resources = {
    hindi: [
      {
        title: 'समुदाय सहायता',
        description: 'समुदाय आधारित सहायता समूह',
        options: [
          'सहायता समूह',
          'पीयर सपोर्ट',
          'ऑनलाइन फोरम',
          'कम्युनिटी सेंटर'
        ]
      }
    ],
    english: [
      {
        title: 'Community Support',
        description: 'Community-based support groups',
        options: [
          'Support groups',
          'Peer support',
          'Online forums',
          'Community centers'
        ]
      }
    ]
  };

  return resources[language] || resources.hindi;
}

module.exports = router;
