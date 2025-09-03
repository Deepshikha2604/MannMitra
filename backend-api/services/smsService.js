const twilio = require('twilio');

class SMSService {
  constructor() {
    this.client = null;
    this.isConfigured = false;
    this.initializeClient();
  }

  initializeClient() {
    try {
      if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
        this.client = twilio(
          process.env.TWILIO_ACCOUNT_SID,
          process.env.TWILIO_AUTH_TOKEN
        );
        this.isConfigured = true;
        console.log('SMS Service initialized successfully');
      } else {
        console.warn('SMS Service not configured - missing Twilio credentials');
      }
    } catch (error) {
      console.error('Failed to initialize SMS Service:', error.message);
    }
  }

  async sendOTP(phoneNumber, otp) {
    if (!this.isConfigured) {
      // In development, just log the OTP
      console.log(`[DEV] OTP for ${phoneNumber}: ${otp}`);
      return { success: true, messageId: 'dev-' + Date.now() };
    }

    try {
      const message = await this.client.messages.create({
        body: `Your MannMitra verification code is: ${otp}. This code will expire in 10 minutes.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber
      });

      return {
        success: true,
        messageId: message.sid,
        status: message.status
      };
    } catch (error) {
      console.error('SMS sending failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async sendCrisisAlert(phoneNumber, message) {
    if (!this.isConfigured) {
      console.log(`[DEV] Crisis alert for ${phoneNumber}: ${message}`);
      return { success: true, messageId: 'dev-crisis-' + Date.now() };
    }

    try {
      const smsMessage = await this.client.messages.create({
        body: `MannMitra Crisis Alert: ${message}. Please contact emergency services if needed.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber
      });

      return {
        success: true,
        messageId: smsMessage.sid,
        status: smsMessage.status
      };
    } catch (error) {
      console.error('Crisis SMS sending failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  validatePhoneNumber(phoneNumber) {
    // Basic phone number validation
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phoneNumber);
  }
}

module.exports = new SMSService();




