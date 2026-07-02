class ProfileSettingsPageService {
  /**
   * Process and structure the profile details for the response payload
   * @param {Object} user - The populated user object from req.user
   */
  async fetchDetails(user) {
    return {
      profile: {
        _id: user._id,
        employeeId: user.employeeId,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        phoneNumber: user.phoneNumber,
        profileImage: user.profileImage,
        role: user.roleId ? {
          _id: user.roleId._id,
          name: user.roleId.name
        } : null,
        branch: user.branchId ? {
          _id: user.branchId._id,
          code: user.branchId.code,
          name: user.branchId.name
        } : null,
        status: user.status,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    };
  }

  /**
   * Modify the personal details of the current user account profile
   * @param {Object} userInstance - Live Mongoose Document for the logged-in user
   * @param {Object} updateFields - Form parameters to modify
   */
  async modifyProfile(userInstance, updateFields) {
    if (updateFields.firstName) userInstance.firstName = updateFields.firstName.trim();
    if (updateFields.lastName) userInstance.lastName = updateFields.lastName.trim();
    
    // Accept empty strings or null to clear out the optional phone field
    userInstance.phoneNumber = updateFields.phoneNumber ? updateFields.phoneNumber.trim() : null;

    // Persist changes to MongoDB (Triggers pre-save logic safely)
    await userInstance.save();

    // Return the updated structure
    return {
      profile: {
        firstName: userInstance.firstName,
        lastName: userInstance.lastName,
        fullName: userInstance.fullName,
        phoneNumber: userInstance.phoneNumber
      }
    };
  }

  /**
   * Validate current password and apply a new secure password string
   * @param {Object} userInstance - Live Mongoose Document for current user context [cite: 730]
   * @param {string} currentPassword - Current user password input string
   * @param {string} newPassword - Selected new password string replacement
   */
  async modifyPassword(userInstance, currentPassword, newPassword) {
    if (!currentPassword || !newPassword) {
      const error = new Error('Both current and new password strings are mandatory fields.');
      error.statusCode = 400;
      throw error;
    }

    // Explicitly check password against the database hash using the schema method [cite: 599]
    const isMatch = await userInstance.comparePassword(currentPassword);
    if (!isMatch) {
      const error = new Error('The current password provided does not match our records.');
      error.statusCode = 401;
      throw error;
    }

    // Verify minimal security layout length [cite: 595, 611]
    if (newPassword.length < 8) {
      const error = new Error('The new password must contain at least 8 characters.');
      error.statusCode = 400;
      throw error;
    }

    // Re-assign plain text string. The user.model pre('save') hook handles re-hashing [cite: 495, 598]
    userInstance.password = newPassword;
    await userInstance.save(); // [cite: 730]

    return true;
  }
}

module.exports = new ProfileSettingsPageService();