const express = require('express');
const router = express.Router();
const controller = require('./controller');

// Existing route (keep this)
router.get('/', controller.getDetails);

// MOCK Employee Activity Data
const employeeActivity = [
  { name: "Alex Rivers", dept: "Engineering", checkIn: "08:35 AM", checkOut: "05:22 PM", hours: "8h 37m", status: "Present", bg: "bg-green-100 text-green-700" },
  { name: "Sarah Jenkins", dept: "Sales", checkIn: "08:45 AM", checkOut: "-- : --", hours: "Active", status: "Late", bg: "bg-yellow-100 text-yellow-700" },
  { name: "Michael Chen", dept: "Product", checkIn: "Not Logged", checkOut: "Not Logged", hours: "0h 0m", status: "Absent", bg: "bg-red-100 text-red-700" },
  { name: "Jessica Li", dept: "Design", checkIn: "08:40 AM", checkOut: "05:00 PM", hours: "8h 20m", status: "Present", bg: "bg-green-100 text-green-700" },
];

// NEW ROUTE: Fetch Employee Activity
router.get('/activity', (req, res) => {
  res.json(employeeActivity);
});

// EXPORT ROUTER ONLY AT THE BOTTOM
module.exports = router;