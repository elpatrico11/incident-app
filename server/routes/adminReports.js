// adminReportsRoutes.js
const express = require("express");
const router = express.Router();
const Incident = require("../models/Incident");
const authMiddleware = require("../middleware/auth");
const authorize = require("../middleware/authorize");

// Middleware: auth + authorize admin
router.use(authMiddleware, authorize("admin"));

/**
 * @route   GET /api/admin/reports
 * @desc    Pobranie danych raportowych
 * @access  Admin
 */
router.get("/", async (req, res) => {
  const { timeHorizon = "monthly" } = req.query; // Default to 'monthly' if not provided

  try {
    // Define date aggregation based on timeHorizon
    let dateGroup = {};
    let dateFormat = "";

    if (timeHorizon === "daily") {
      dateGroup = {
        year: { $year: "$createdAt" },
        month: { $month: "$createdAt" },
        day: { $dayOfMonth: "$createdAt" },
      };
      dateFormat = {
        $concat: [
          { $toString: "$year" },
          "-",
          {
            $cond: [
              { $lt: ["$month", 10] },
              { $concat: ["0", { $toString: "$month" }] },
              { $toString: "$month" },
            ],
          },
          "-",
          {
            $cond: [
              { $lt: ["$day", 10] },
              { $concat: ["0", { $toString: "$day" }] },
              { $toString: "$day" },
            ],
          },
        ],
      };
    } else if (timeHorizon === "weekly") {
      dateGroup = {
        year: { $isoWeekYear: "$createdAt" },
        week: { $isoWeek: "$createdAt" },
      };
      dateFormat = {
        $concat: [
          { $toString: "$year" },
          "-W",
          {
            $cond: [
              { $lt: ["$week", 10] },
              { $concat: ["0", { $toString: "$week" }] },
              { $toString: "$week" },
            ],
          },
        ],
      };
    } else {
      // Default to 'monthly'
      dateGroup = {
        year: { $year: "$createdAt" },
        month: { $month: "$createdAt" },
      };
      dateFormat = {
        $concat: [
          { $toString: "$year" },
          "-",
          {
            $cond: [
              { $lt: ["$month", 10] },
              { $concat: ["0", { $toString: "$month" }] },
              { $toString: "$month" },
            ],
          },
        ],
      };
    }

    // a. Incident Trends Over Time
    const incidentTrends = await Incident.aggregate([
      {
        $group: {
          _id: dateGroup,
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          "_id.year": 1,
          ...(timeHorizon === "daily"
            ? { "_id.month": 1, "_id.day": 1 }
            : timeHorizon === "weekly"
            ? { "_id.week": 1 }
            : { "_id.month": 1 }),
        },
      },
      {
        $project: {
          _id: 0,
          period:
            timeHorizon === "daily"
              ? {
                  $concat: [
                    { $toString: "$_id.year" },
                    "-",
                    {
                      $cond: [
                        { $lt: ["$_id.month", 10] },
                        { $concat: ["0", { $toString: "$_id.month" }] },
                        { $toString: "$_id.month" },
                      ],
                    },
                    "-",
                    {
                      $cond: [
                        { $lt: ["$_id.day", 10] },
                        { $concat: ["0", { $toString: "$_id.day" }] },
                        { $toString: "$_id.day" },
                      ],
                    },
                  ],
                }
              : timeHorizon === "weekly"
              ? {
                  $concat: [
                    { $toString: "$_id.year" },
                    "-W",
                    {
                      $cond: [
                        { $lt: ["$_id.week", 10] },
                        { $concat: ["0", { $toString: "$_id.week" }] },
                        { $toString: "$_id.week" },
                      ],
                    },
                  ],
                }
              : dateFormat,
          count: 1,
        },
      },
    ]);

    console.log("incidentTrends:", incidentTrends); // Log incidentTrends

    // b. Average Resolution Time (in hours)
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

    console.log("averageResolutionTime:", averageResolutionTime); // Log averageResolutionTime

    // c. Reports by Category Over Time (for Stacked Bar Chart)
    const reportsByCategory = await Incident.aggregate([
      {
        $group: {
          _id: {
            year:
              timeHorizon === "daily"
                ? { $year: "$createdAt" }
                : timeHorizon === "weekly"
                ? { $isoWeekYear: "$createdAt" }
                : { $year: "$createdAt" },
            period:
              timeHorizon === "daily"
                ? { $dayOfMonth: "$createdAt" }
                : timeHorizon === "weekly"
                ? { $isoWeek: "$createdAt" }
                : { $month: "$createdAt" },
            category: "$category",
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          "_id.year": 1,
          ...(timeHorizon === "daily"
            ? { "_id.month": 1, "_id.period": 1 }
            : timeHorizon === "weekly"
            ? { "_id.week": 1 }
            : { "_id.month": 1 }),
        },
      },
      {
        $project: {
          _id: 0,
          period:
            timeHorizon === "daily"
              ? {
                  $concat: [
                    { $toString: "$_id.year" },
                    "-",
                    {
                      $cond: [
                        { $lt: ["$_id.month", 10] },
                        { $concat: ["0", { $toString: "$_id.month" }] },
                        { $toString: "$_id.month" },
                      ],
                    },
                    "-",
                    {
                      $cond: [
                        { $lt: ["$_id.period", 10] },
                        { $concat: ["0", { $toString: "$_id.period" }] },
                        { $toString: "$_id.period" },
                      ],
                    },
                  ],
                }
              : timeHorizon === "weekly"
              ? {
                  $concat: [
                    { $toString: "$_id.year" },
                    "-W",
                    {
                      $cond: [
                        { $lt: ["$_id.period", 10] },
                        { $concat: ["0", { $toString: "$_id.period" }] },
                        { $toString: "$_id.period" },
                      ],
                    },
                  ],
                }
              : {
                  $concat: [
                    { $toString: "$_id.year" },
                    "-",
                    {
                      $cond: [
                        { $lt: ["$_id.period", 10] },
                        { $concat: ["0", { $toString: "$_id.period" }] },
                        { $toString: "$_id.period" },
                      ],
                    },
                  ],
                },
          category: "$_id.category",
          count: 1,
        },
      },
      {
        $group: {
          _id: "$period",
          categories: {
            $push: {
              category: "$category",
              count: "$count",
            },
          },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    console.log("reportsByCategory:", reportsByCategory); // Log reportsByCategory

    // Transform reportsByCategory into a suitable format for the frontend
    const categories = [
      ...new Set(
        reportsByCategory.flatMap((item) =>
          item.categories.map((cat) => cat.category)
        )
      ),
    ];

    const reportsByCategoryFormatted = reportsByCategory.map((item) => {
      const dataPoint = { period: item._id };
      item.categories.forEach((cat) => {
        dataPoint[cat.category] = cat.count;
      });
      return dataPoint;
    });

    console.log("reportsByCategoryFormatted:", reportsByCategoryFormatted); // Log formatted data
    console.log("categories:", categories); // Log categories

    // d. Status Count
    const statusCount = await Incident.aggregate([
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

    console.log("statusCount:", statusCount); // Log statusCount

    // e. Top N Categories
    const topN = 5; // Adjust as needed
    const topCategories = await Incident.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: topN,
      },
      {
        $project: {
          category: "$_id",
          count: 1,
          _id: 0,
        },
      },
    ]);

    console.log("topCategories:", topCategories); // Log topCategories

    // Prepare the response payload without `priorityCount`
    const responsePayload = {
      incidentTrends,
      averageResolutionTime,
      reportsByCategory: {
        data: reportsByCategoryFormatted,
        categories,
      },
      statusCount,
      topCategories,
      // priorityCount, // Removed as it's not needed
    };

    console.log("Response payload:", responsePayload); // Log the entire response payload

    res.json(responsePayload);
  } catch (err) {
    console.error("Error in /api/admin/reports:", err.message);
    res.status(500).send("Błąd serwera");
  }
});

module.exports = router;
