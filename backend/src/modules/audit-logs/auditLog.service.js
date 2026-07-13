const AuditLog = require('./auditLog.model');

/**
 * Creates an audit log entry
 * @param {Object} logData
 * @param {String} logData.module - The module where action occurred (e.g., 'BRANCH')
 * @param {String} logData.action - The action performed (e.g., 'CREATE', 'UPDATE')
 * @param {String} logData.entityType - Type of entity affected (e.g., 'BRANCH')
 * @param {String} logData.entityId - ID of the entity
 * @param {String} logData.performedBy - User ID who performed the action
 * @param {Object} [logData.oldValues] - Previous state (optional)
 * @param {Object} [logData.newValues] - New state (optional)
 * @returns {Promise<Object>} Created audit log
 */
const createLog = async (logData) => {
  try {
    const auditLog = await AuditLog.create(logData);
    return auditLog;
  } catch (error) {
    console.error('Error creating audit log:', error);
    // We usually don't want audit logging failures to break the main application flow
    return null;
  }
};

module.exports = {
  createLog,
};
