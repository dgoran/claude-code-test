const Owner = require('../models/Owner');

/**
 * Create default owner account if no owners exist
 * This ensures there's always an admin account available
 */
const setupDefaultOwner = async () => {
  try {
    // Check if any owners exist
    const ownerCount = await Owner.countDocuments();

    if (ownerCount === 0) {
      console.log('No owner accounts found. Creating default owner...');

      // Create default owner
      const defaultOwner = new Owner({
        name: 'System Administrator',
        email: 'admin',
        password: 'admin123',
        role: 'owner',
        isActive: true
      });

      await defaultOwner.save();

      console.log('✓ Default owner account created successfully');
      console.log('  Username: admin');
      console.log('  Password: admin123');
      console.log('  ⚠️  IMPORTANT: Please change these credentials in production!');
    } else {
      console.log(`✓ Found ${ownerCount} existing owner account(s)`);
    }
  } catch (error) {
    console.error('Error setting up default owner:', error);
    // Don't throw error - allow server to continue starting
  }
};

module.exports = setupDefaultOwner;
