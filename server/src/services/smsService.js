const twilio = require("twilio");

/**
 * Initialize Twilio client
 */
const getTwilioClient = () => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken) {
    console.warn("⚠️ Twilio credentials not configured. SMS will not be sent.");
    return null;
  }

  return twilio(accountSid, authToken);
};

/**
 * Format phone number for Twilio (ensure it starts with country code)
 * @param {String} phoneNumber - Phone number from user
 * @returns {String} - Formatted phone number with country code
 */
const formatPhoneNumber = (phoneNumber) => {
  // Remove all non-digit characters
  let cleaned = phoneNumber.replace(/\D/g, "");

  // If number doesn't start with +, assume it's a local number and add country code
  // Default to India (+91) if no country code detected
  if (!phoneNumber.startsWith("+")) {
    // If it starts with 0, remove it (common in India)
    if (cleaned.startsWith("0")) {
      cleaned = cleaned.substring(1);
    }
    // If it's 10 digits, assume India (+91)
    if (cleaned.length === 10) {
      cleaned = "91" + cleaned;
    }
    // Add + prefix
    return "+" + cleaned;
  }

  return phoneNumber;
};

/**
 * Send SMS notification when print job is ready for pickup
 * @param {Object} options - SMS options
 * @param {String} options.to - Recipient phone number
 * @param {String} options.studentName - Student name
 * @param {Object} options.job - PrintJob object with populated student
 * @returns {Promise<Object>} - SMS send result
 */
const sendPickupNotification = async ({ to, studentName, job }) => {
  try {
    const client = getTwilioClient();
    if (!client) {
      console.warn("⚠️ Twilio client not available. SMS not sent.");
      return { success: false, error: "Twilio not configured" };
    }

    const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
    if (!twilioPhoneNumber) {
      console.warn("⚠️ TWILIO_PHONE_NUMBER not configured. SMS not sent.");
      return { success: false, error: "Twilio phone number not configured" };
    }

    const formattedTo = formatPhoneNumber(to);

    // Short and simple message
    const message = `PrintFlow:
Print ready.
Token: #${job.tokenNumber}
Collect from vendor counter.`;

    const messageResult = await client.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: formattedTo,
    });

    // Log detailed message information
    console.log(`📱 SMS API Response:`);
    console.log(`   To: ${formattedTo}`);
    console.log(`   From: ${twilioPhoneNumber}`);
    console.log(`   Message SID: ${messageResult.sid}`);
    console.log(`   Status: ${messageResult.status}`);
    console.log(`   Price: ${messageResult.price || 'N/A'}`);
    console.log(`   Error Code: ${messageResult.errorCode || 'None'}`);
    console.log(`   Error Message: ${messageResult.errorMessage || 'None'}`);
    
    // Check if message was actually queued/sent
    if (messageResult.status === 'queued' || messageResult.status === 'sending' || messageResult.status === 'sent') {
      console.log(`✅ SMS queued/sent successfully. Check delivery status in Twilio Console.`);
      console.log(`   View message: https://console.twilio.com/us1/monitor/logs/sms/logs/${messageResult.sid}`);
    } else if (messageResult.status === 'failed' || messageResult.status === 'undelivered') {
      console.error(`❌ SMS failed to send. Status: ${messageResult.status}`);
      console.error(`   Error Code: ${messageResult.errorCode}`);
      console.error(`   Error Message: ${messageResult.errorMessage}`);
    }

    return { 
      success: true, 
      messageSid: messageResult.sid,
      status: messageResult.status,
      errorCode: messageResult.errorCode,
      errorMessage: messageResult.errorMessage
    };
  } catch (error) {
    // Handle specific Twilio errors
    if (error.code === 21608) {
      // Unverified number error (Trial account limitation)
      console.error(`❌ SMS Error: Phone number ${to} is not verified in Twilio.`);
      console.error(`   Trial accounts can only send to verified numbers.`);
      console.error(`   Verify at: https://console.twilio.com/us1/develop/phone-numbers/manage/verified`);
      console.error(`   Or upgrade to a paid account to send to any number.`);
      return { 
        success: false, 
        error: "Unverified number (Trial account limitation)",
        code: 21608,
        details: `Phone number ${to} must be verified in Twilio console, or upgrade to paid account.`
      };
    } else if (error.code === 21211) {
      // Invalid phone number
      console.error(`❌ SMS Error: Invalid phone number format: ${to}`);
      return { 
        success: false, 
        error: "Invalid phone number format",
        code: 21211
      };
    } else {
      console.error("❌ Error sending SMS:", error.message || error);
      return { 
        success: false, 
        error: error.message || "Unknown error",
        code: error.code
      };
    }
    // Don't throw - SMS failure shouldn't block job completion
  }
};

/**
 * Check the delivery status of a sent message
 * @param {String} messageSid - Twilio message SID
 * @returns {Promise<Object>} - Message status details
 */
const checkMessageStatus = async (messageSid) => {
  try {
    const client = getTwilioClient();
    if (!client) {
      return { error: "Twilio client not available" };
    }

    const message = await client.messages(messageSid).fetch();
    
    return {
      sid: message.sid,
      status: message.status,
      to: message.to,
      from: message.from,
      body: message.body,
      dateCreated: message.dateCreated,
      dateSent: message.dateSent,
      dateUpdated: message.dateUpdated,
      errorCode: message.errorCode,
      errorMessage: message.errorMessage,
      price: message.price,
      priceUnit: message.priceUnit,
    };
  } catch (error) {
    console.error("Error checking message status:", error);
    return { error: error.message };
  }
};

module.exports = {
  sendPickupNotification,
  formatPhoneNumber,
  checkMessageStatus,
};
