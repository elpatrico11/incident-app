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

router.get("/download", async (req, res) => {
  try {
    const totalIncidents = await Incident.countDocuments();

    const avgResolutionTimeResult = await Incident.aggregate([
      {
        $match: { status: "Resolved", resolvedAt: { $exists: true } },
      },
      {
        $project: {
          resolutionTime: {
            $divide: [
              { $subtract: ["$resolvedAt", "$createdAt"] },
              1000 * 60 * 60, //milliseconds to hours
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

    // Construct CSV content
    let csvContent = "";

    // Add BOM for UTF-8 to ensure proper encoding in Excel
    csvContent += "\uFEFF";

    // 1. Main Metrics
    csvContent +=
      "Total Incidents,Average Resolution Time (h),Average Incidents Per Day\n";
    csvContent += `${totalIncidents},${averageResolutionTime},${averagePerDay}\n\n`;

    // 2. Reports by Category
    csvContent += "Reports by Category\n";
    csvContent += "Category,Count\n";
    reportsByCategory.forEach((item) => {
      // Escape double quotes by doubling them
      const category = `"${item.category.replace(/"/g, '""')}"`;
      csvContent += `${category},${item.count}\n`;
    });
    csvContent += "\n";

    // 3. Status Count
    csvContent += "Status Count\n";
    csvContent += "Status,Count\n";
    statusCount.forEach((item) => {
      const status = `"${item.status.replace(/"/g, '""')}"`;
      csvContent += `${status},${item.count}\n`;
    });
    csvContent += "\n";

    // 4. Total Incidents Per Day
    csvContent += "Total Incidents Per Day\n";
    csvContent += "Date,Count\n";
    totalIncidentsPerDay.forEach((item) => {
      csvContent += `${item.date},${item.count}\n`;
    });

    // Set headers for CSV download
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", "attachment; filename=raporty.csv");

    // Send the CSV content
    res.send(csvContent);
  } catch (err) {
    console.error("Error in /api/admin/reports/download:", err.message);
    res.status(500).send("Błąd serwera");
  }
});

module.exports = router;
