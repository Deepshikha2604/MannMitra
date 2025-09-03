const { sequelize } = require('../../config/database');

async function up() {
  try {
    // Create Users table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        phone VARCHAR(20) UNIQUE NOT NULL,
        phone_hash VARCHAR(255) NOT NULL,
        name VARCHAR(100),
        age INTEGER,
        gender VARCHAR(20),
        location VARCHAR(100),
        education_level VARCHAR(50),
        occupation VARCHAR(100),
        preferred_language VARCHAR(20) DEFAULT 'hindi',
        comfort_level VARCHAR(20) DEFAULT 'beginner',
        emergency_contact VARCHAR(20),
        is_active BOOLEAN DEFAULT true,
        onboarding_completed BOOLEAN DEFAULT false,
        subscription_type VARCHAR(20) DEFAULT 'free',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Create mood_entries table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS mood_entries (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        mood_score INTEGER NOT NULL CHECK (mood_score >= 1 AND mood_score <= 10),
        mood_emoji VARCHAR(10),
        primary_emotion VARCHAR(50) NOT NULL,
        secondary_emotion VARCHAR(50),
        energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 10),
        sleep_quality INTEGER CHECK (sleep_quality >= 1 AND sleep_quality <= 10),
        stress_level INTEGER CHECK (stress_level >= 1 AND stress_level <= 10),
        notes TEXT,
        triggers TEXT[],
        activities_done TEXT[],
        location VARCHAR(100),
        weather VARCHAR(50),
        ai_insights TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Create chat_messages table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        session_id UUID NOT NULL,
        message_type VARCHAR(20) NOT NULL CHECK (message_type IN ('user', 'ai', 'system')),
        content TEXT NOT NULL,
        content_type VARCHAR(20) DEFAULT 'text' CHECK (content_type IN ('text', 'voice', 'image')),
        language VARCHAR(10),
        sentiment_score DECIMAL(3,2),
        emotion_detected VARCHAR(50),
        crisis_detected BOOLEAN DEFAULT false,
        crisis_level VARCHAR(20),
        ai_response_time INTEGER,
        user_satisfaction INTEGER CHECK (user_satisfaction >= 1 AND user_satisfaction <= 5),
        context_data JSONB,
        metadata JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Create indexes for better performance
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_mood_entries_user_id ON mood_entries(user_id);
      CREATE INDEX IF NOT EXISTS idx_mood_entries_created_at ON mood_entries(created_at);
      CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
      CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
      CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);
      CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
    `);

    console.log('✅ Database tables created successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

async function down() {
  try {
    await sequelize.query('DROP TABLE IF EXISTS chat_messages CASCADE;');
    await sequelize.query('DROP TABLE IF EXISTS mood_entries CASCADE;');
    await sequelize.query('DROP TABLE IF EXISTS users CASCADE;');
    console.log('✅ Database tables dropped successfully');
  } catch (error) {
    console.error('❌ Rollback failed:', error);
    throw error;
  }
}

module.exports = { up, down };





