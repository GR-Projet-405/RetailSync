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
        fullName: user.fullName, // Accesses the schema's virtual property
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
}

module.exports = new ProfileSettingsPageService();