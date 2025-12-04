// services/emailService.js
const nodemailer = require('nodemailer');

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendEmailOTP = async (email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,  // agrivsion.team@gmail.com
        pass: process.env.EMAIL_PASS.replace(/\s+/g, '')  // Remove spaces if any
      },
      tls: {
        rejectUnauthorized: false
      }
    });
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'AgriVision - OTP Verification',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #4CAF50;">AgriVision OTP Verification</h2>
          <p>Your OTP code is: <strong>${otp}</strong></p>
          <p>Valid for 10 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `,
      text: `Your AgriVision OTP is: ${otp}. Valid for 10 minutes.`
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP sent to ${email}`);
    return true;
    
  } catch (error) {
    console.error('❌ Email error:', error.message);
    return false;
  }
};

module.exports = {
  generateOTP,
  sendEmailOTP
};