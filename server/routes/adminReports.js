const express = require("express");
const router = express.Router();
const Incident = require("../models/Incident");
const authMiddleware = require("../middleware/auth");
const authorize = require("../middleware/authorize");

const statusTranslations = {
  Pending: "Oczekujące",
  "In Progress": "W trakcie",
  Resolved: "Rozwiązane",
};

router.use(authMiddleware, authorize("admin"));

router.get("/", async (req, res) => {
  try {
    // Total number of incidents
    const totalIncidents = await Incident.countDocuments();

    // Average Resolution Time (in hours)
    const avgResolutionTimeResult = await Incident.aggregate([
      {
        $match: { status: "Resolved", resolvedAt: { $exists: true } },
      },
      {
        $project: {
          resolutionTime: {
            $divide: [
              { $subtract: ["$resolvedAt", "$createdAt"] },
              1000 * 60 * 60, // Convert milliseconds to hours
            ],
          },
        },
      },
      {
        $group: {
          _id: null,
          averageResolutionTime: { $avg: "$resolutionTime" },
        },
      },
    ]);

    const averageResolutionTime =
      avgResolutionTimeResult.length > 0
        ? avgResolutionTimeResult[0].averageResolutionTime.toFixed(2)
        : 0;

    // Reports by Category
    const reportsByCategory = await Incident.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          category: "$_id",
          count: 1,
          _id: 0,
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    // Status Count with Polish translations
    const statusCountRaw = await Incident.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          status: "$_id",
          count: 1,
          _id: 0,
        },
      },
    ]);

    const statusCount = statusCountRaw.map((item) => ({
      status: statusTranslations[item.status] || item.status,
      count: item.count,
    }));

    // Average Incidents Per Day and Total Per Day
    const incidentsPerDayAggregation = await Incident.aggregate([
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    const totalDays = incidentsPerDayAggregation.length || 1;
    const averagePerDay = (totalIncidents / totalDays).toFixed(2);

    const totalIncidentsPerDay = incidentsPerDayAggregation.map((item) => ({
      date: item._id,
      count: item.count,
    }));

    const responsePayload = {
      totalIncidents,
      averageResolutionTime,
      reportsByCategory,
      statusCount,
      averagePerDay,
      totalIncidentsPerDay,
    };

    res.json(responsePayload);
  } catch (err) {
    console.error("Error in /api/admin/reports:", err.message);
    res.status(500).send("Błąd serwera");
  }
});

module.exports = router;
