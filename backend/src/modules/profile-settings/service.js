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
}

module.exports = new ProfileSettingsPageService();