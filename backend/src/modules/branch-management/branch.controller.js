const branchService = require('./branch.service');
const { createLog } = require('../audit-logs/auditLog.service');

const getBranches = async (req, res) => {
  const result = await branchService.getBranches(req.query);
  res.status(200).json({ success: true, ...result });
};

const getBranchById = async (req, res) => {
  try {
    const branch = await branchService.getBranchById(req.params.id);
    res.status(200).json({ success: true, data: branch });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

const createBranch = async (req, res) => {
  try {
    const branch = await branchService.createBranch(req.body, req.user._id);
    res.status(201).json({ success: true, message: 'Branch created successfully', data: branch });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const updateBranch = async (req, res) => {
  try {
    const branch = await branchService.updateBranch(req.params.id, req.body, req.user._id);
    res.status(200).json({ success: true, message: 'Branch updated successfully', data: branch });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const updateBranchStatus = async (req, res) => {
  try {
    const branch = await branchService.updateBranchStatus(req.params.id, req.body.status, req.user._id);
    res.status(200).json({ success: true, message: `Branch ${branch.status.toLowerCase()} successfully`, data: branch });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const assignManager = async (req, res) => {
  try {
    const branch = await branchService.assignManager(req.params.id, req.body.managerId, req.user._id);
    res.status(200).json({ success: true, message: 'Manager assigned successfully', data: branch });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getBranchDashboard = async (req, res) => {
  try {
    // For manager, ensure they can only access their own branch dashboard
    const isManager = req.user.roleId && req.user.roleId.name === 'BRANCH_MANAGER';
    let branchId = req.params.id;
    
    if (isManager) {
      branchId = req.user.branchId;
    }
    
    const dashboardData = await branchService.getBranchDashboard(branchId);
    res.status(200).json({ success: true, data: dashboardData });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getMyDashboard = async (req, res) => {
  try {
    if (!req.user.branchId) {
      return res.status(403).json({ success: false, message: 'No branch assigned to this user' });
    }
    const dashboardData = await branchService.getBranchDashboard(req.user.branchId);
    res.status(200).json({ success: true, data: dashboardData });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getAdminComparison = async (req, res) => {
  try {
    const comparisonData = await branchService.getAdminDashboardSummary();
    res.status(200).json({ success: true, data: comparisonData });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getBranchEmployees = async (req, res) => {
  try {
    const employees = await branchService.getBranchEmployees(req.params.id);
    res.status(200).json({ success: true, data: employees });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Mock endpoints for tabs
const getBranchInventory = async (req, res) => {
  res.status(200).json({ success: true, data: [] });
};

const getBranchTransfers = async (req, res) => {
  res.status(200).json({ success: true, data: [] });
};

const getBranchAuditLogs = async (req, res) => {
  const AuditLog = require('../audit-logs/auditLog.model');
  try {
    const logs = await AuditLog.find({ entityType: 'BRANCH', entityId: req.params.id })
      .populate('performedBy', 'firstName lastName')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: logs });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  getBranches,
  getBranchById,
  createBranch,
  updateBranch,
  updateBranchStatus,
  assignManager,
  getBranchDashboard,
  getMyDashboard,
  getAdminComparison,
  getBranchEmployees,
  getBranchInventory,
  getBranchTransfers,
  getBranchAuditLogs
};
