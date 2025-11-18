const userModel = require('../modules/user');
const { encrypt, decrypt } = require('../utils/crypto');

class userServices {
  static async createUser(uId, phone, role) {
    try {
      const encryptedPhone = encrypt(phone);

      // Find by encrypted phone
      const existingUser = await userModel.findOne({ phone: encryptedPhone });

      if (existingUser) {
        existingUser.uId = uId;
        await existingUser.save();

        // Decrypt before sending to frontend
        const userObj = existingUser.toObject();
        userObj.phone = decrypt(userObj.phone);

        return { user: userObj, isNew: false };
      }

      const newUser = new userModel({
        uId,
        phone: encryptedPhone,
        role,
        isActive: true,  // default
      });

      await newUser.save();

      const userObj = newUser.toObject();
      userObj.phone = decrypt(userObj.phone);

      return { user: userObj, isNew: true };

    } catch (err) {
      throw new Error('Error finding or creating user: ' + err.message);
    }
  }
  static async getStats() {
  const total = await userModel.countDocuments();
  const active = await userModel.countDocuments({ isActive: true });

  return { total, active };
}

}

module.exports = userServices;
