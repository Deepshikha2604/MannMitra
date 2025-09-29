const { sequelize } = require('../../config/database');
const initial = require('./001_initial_tables');
const m003 = require('./003_update_user_auth_constraints');

async function runMigrations() {
  try {
    console.log('🚀 Starting database migrations...');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established');

    // Run migrations
    await initial.up();
    await m003.up();
    
    console.log('🎉 All migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  }
}

// Run migrations if this file is executed directly
if (require.main === module) {
  runMigrations();
}

module.exports = { runMigrations };














