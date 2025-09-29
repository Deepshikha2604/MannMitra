const { sequelize } = require('../../config/database');

async function up() {
  try {
    // Make name field required (NOT NULL)
    await sequelize.query(`
      ALTER TABLE users 
      ALTER COLUMN name SET NOT NULL;
    `);

    // Add unique constraint on name + phone combination
    await sequelize.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_users_name_phone 
      ON users(name, phone);
    `);

    // Add index for faster lookups
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_users_name 
      ON users(name);
    `);

    console.log('✅ User authentication constraints added successfully');
  } catch (error) {
    console.error('❌ Migration 003 failed:', error);
    throw error;
  }
}

async function down() {
  try {
    // Remove unique constraint
    await sequelize.query(`
      DROP INDEX IF EXISTS idx_users_name_phone;
    `);

    // Remove name index
    await sequelize.query(`
      DROP INDEX IF EXISTS idx_users_name;
    `);

    // Make name field nullable again
    await sequelize.query(`
      ALTER TABLE users 
      ALTER COLUMN name DROP NOT NULL;
    `);

    console.log('✅ User authentication constraints removed successfully');
  } catch (error) {
    console.error('❌ Rollback 003 failed:', error);
    throw error;
  }
}

module.exports = { up, down };



