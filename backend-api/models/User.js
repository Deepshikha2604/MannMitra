const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      is: /^[0-9]{10}$/
    }
  },
  phone_hash: {
    type: DataTypes.STRING,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  age: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 13,
      max: 120
    }
  },
  gender: {
    type: DataTypes.ENUM('male', 'female', 'other', 'prefer_not_to_say'),
    allowNull: false
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false
  },
  education_level: {
    type: DataTypes.ENUM('none', 'primary', 'secondary', 'higher_secondary', 'graduate', 'post_graduate'),
    allowNull: false
  },
  occupation: {
    type: DataTypes.ENUM('student', 'homemaker', 'daily_wage_worker', 'unemployed', 'employed', 'retired'),
    allowNull: false
  },
  preferred_language: {
    type: DataTypes.ENUM('hindi', 'english', 'bengali', 'tamil', 'telugu', 'marathi', 'gujarati', 'punjabi', 'urdu'),
    allowNull: false,
    defaultValue: 'hindi'
  },
  comfort_level: {
    type: DataTypes.ENUM('text', 'voice', 'both'),
    allowNull: false,
    defaultValue: 'text'
  },
  emergency_contact: {
    type: DataTypes.STRING,
    allowNull: true
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  last_login: {
    type: DataTypes.DATE,
    allowNull: true
  },
  onboarding_completed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  subscription_type: {
    type: DataTypes.ENUM('free', 'premium'),
    defaultValue: 'free'
  },
  subscription_expires: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'users',
  hooks: {
    // Validation runs before create, so ensure phone_hash exists pre-validation
    beforeValidate: async (user) => {
      if (user.phone && !user.phone_hash) {
        user.phone_hash = await bcrypt.hash(user.phone, 10);
      }
    }
  }
});

// Static methods for authentication
User.findByNameAndPhone = async function(name, phone) {
  const normalizedName = String(name || '').trim().toLowerCase();
  const normalizedPhone = String(phone || '').replace(/\D/g, '');
  return await this.findOne({
    where: {
      phone: normalizedPhone,
      name: sequelize.where(
        sequelize.fn('LOWER', sequelize.col('name')),
        normalizedName
      )
    }
  });
};

User.findByPhone = async function(phone) {
  return await this.findOne({
    where: { phone }
  });
};

User.verifyPhoneHash = async function(phone, phoneHash) {
  return await bcrypt.compare(phone, phoneHash);
};

module.exports = User;
