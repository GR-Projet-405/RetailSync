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
 * @param {Object} userInstance - Live Mongoose Document for current user context
 * @param {string} currentPassword - Current user password input string
 * @param {string} newPassword - Selected new password string replacement
 */
async modifyPassword(userInstance, currentPassword, newPassword) {
  if (!currentPassword || !newPassword) {
    const error = new Error('Both current and new password strings are mandatory fields.');
    error.statusCode = 400;
    throw error;
  }

  // 1. Fetch a fresh copy of the user using the logged-in user's ID
  // We explicitly use .select('+password') to force Mongoose to return the password hash
  const User = userInstance.constructor; // Dynamically gets the User model
  const freshUser = await User.findById(userInstance._id).select('+password');

  if (!freshUser) {
    const error = new Error('User account context could not be verified.');
    error.statusCode = 404;
    throw error;
  }

  // 2. Explicitly check password against the database hash using the schema method
  const isMatch = await freshUser.comparePassword(currentPassword);
  if (!isMatch) {
    const error = new Error('The current password provided does not match our records.');
    error.statusCode = 401;
    throw error;
  }

  // 3. Verify minimal security layout length
  if (newPassword.length < 8) {
    const error = new Error('The new password must contain at least 8 characters.');
    error.statusCode = 400;
    throw error;
  }

  // 4. Re-assign plain text string. The user.model pre('save') hook handles re-hashing
  freshUser.password = newPassword;
  await freshUser.save(); 

  return true;
}
}

module.exports = new ProfileSettingsPageService();