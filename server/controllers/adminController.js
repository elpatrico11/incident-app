const User = require("../models/User");
const Incident = require("../models/Incident");
const Notification = require("../models/Notification");

//Get all users

const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    console.error("Error in getAllUsers:", error.message);
    next(error);
  }
};

//Get single user

const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ msg: "Użytkownik nie znaleziony" });
    }
    res.json(user);
  } catch (error) {
    console.error("Error in getUserById:", error.message);
    if (error.kind === "ObjectId") {
      return res.status(404).json({ msg: "Użytkownik nie znaleziony" });
    }
    next(error);
  }
};

//Update user

const updateUser = async (req, res, next) => {
  try {
    const { firstName, lastName, email, role } = req.body;

    const updateFields = {};
    if (firstName) updateFields.firstName = firstName;
    if (lastName) updateFields.lastName = lastName;
    if (email) updateFields.email = email;
    if (role) updateFields.role = role;

    let user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ msg: "Użytkownik nie znaleziony" });
    }

    user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select("-password");

    res.json(user);
  } catch (error) {
    console.error("Error in updateUser:", error.message);
    next(error);
  }
};

//Delete user

const deleteUser = async (req, res, next) => {
  try {
    let user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ msg: "Użytkownik nie znaleziony." });
    }

    // Prevent admin from deleting their own account
    if (user.id === req.user.id) {
      return res
        .status(400)
        .json({ msg: "Nie możesz usunąć swojego własnego konta." });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({ msg: "Użytkownik usunięty." });
  } catch (error) {
    console.error("Error in deleteUser:", error.message);
    if (error.kind === "ObjectId") {
      return res.status(404).json({ msg: "Użytkownik nie znaleziony." });
    }
    next(error);
  }
};

//Get all incidents with optional filtering

const getAllIncidents = async (req, res, next) => {
  try {
    const { status, category } = req.query;
    let filter = {};

    if (status && status !== "All") {
      filter.status = status;
    }

    if (category && category !== "All") {
      filter.category = category;
    }

    const incidents = await Incident.find(filter).populate("user", [
      "firstName",
      "lastName",
      "email",
      "role",
    ]);
    res.json(incidents);
  } catch (error) {
    console.error("Error in getAllIncidents:", error.message);
    next(error);
  }
};

//Update incident status

const updateIncidentStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    let incident = await Incident.findById(req.params.id).populate("user", [
      "firstName",
      "lastName",
      "email",
    ]);

    if (!incident) {
      console.log(`Incident with ID ${req.params.id} not found.`);
      return res.status(404).json({ msg: "Zgłoszenie nie znalezione" });
    }
    incident.changedBy = req.user.id;

    // Update status
    incident.status = status;

    // If status is 'Rozwiązane', set resolvedAt
    if (status === "Rozwiązane") {
      incident.resolvedAt = new Date();
    } else {
      // If status is changed from 'Rozwiązane' to something else, unset resolvedAt
      incident.resolvedAt = null;
    }
    await incident.save();

    // Create a notification for the user
    if (incident.user) {
      const message = `Twój incydent o kategorii "${incident.category}" został zaktualizowany do statusu "${status}".`;
      const newNotification = new Notification({
        user: incident.user._id,
        message,
        relatedIncident: incident._id,
      });

      await newNotification.save();
      console.log(
        `Notification created for user ${incident.user._id}: ${message}`
      );
    } else {
      console.log(
        `Incident ${incident._id} has no associated user. Notification not created.`
      );
    }

    res.json(incident);
  } catch (error) {
    console.error("Error in updateIncidentStatus:", error.message);
    next(error);
  }
};

//Delete incident

const deleteIncident = async (req, res, next) => {
  try {
    let incident = await Incident.findById(req.params.id);

    if (!incident) {
      return res.status(404).json({ msg: "Zgłoszenie nie znalezione" });
    }

    await Incident.findByIdAndDelete(req.params.id);

    res.json({ msg: "Zgłoszenie usunięte." });
  } catch (error) {
    console.error("Error in deleteIncident:", error.message);
    if (error.kind === "ObjectId") {
      return res.status(404).json({ msg: "Zgłoszenie nie znalezione." });
    }
    next(error);
  }
};

// Download reports as CSV

const downloadReports = async (req, res, next) => {
  try {
    const statusTranslations = {
      Pending: "Oczekujące",
      "In Progress": "W trakcie",
      Resolved: "Rozwiązane",
    };

    // Total number of incidents
    const totalIncidents = await Incident.countDocuments();

    // Average Resolution Time (in hours)
    const avgResolutionTimeResult = await Incident.aggregate([
      {
        $match: { status: "Rozwiązane", resolvedAt: { $exists: true } },
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

    // Status Count
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

    // Construct CSV content
    let csvContent = "";

    // Add UTF-8 to ensure proper encoding in Excel
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
  } catch (error) {
    console.error("Error in downloadReports:", error.message);
    next(error);
  }
};

//Get administrative reports

const getReports = async (req, res, next) => {
  try {
    // Total number of incidents
    const totalIncidents = await Incident.countDocuments();

    // Average resolution time (assuming 'resolutionTime' is in hours)
    const avgResolutionTimeResult = await Incident.aggregate([
      {
        $match: { status: "Rozwiązane", resolvedAt: { $exists: true } },
      },
      {
        $project: {
          resolutionTime: {
            $divide: [
              { $subtract: ["$resolvedAt", "$createdAt"] },
              1000 * 60 * 60, // Convert to hours
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
        ? avgResolutionTimeResult[0].averageResolutionTime
        : 0;

    // Reports by category
    const reportsByCategory = await Incident.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
      { $project: { category: "$_id", count: 1, _id: 0 } },
    ]);

    // Status count
    const statusCount = await Incident.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
      { $project: { status: "$_id", count: 1, _id: 0 } },
    ]);

    // Average incidents per day
    const averagePerDayAgg = await Incident.aggregate([
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: null,
          average: { $avg: "$count" },
        },
      },
    ]);
    const averagePerDay = averagePerDayAgg[0]?.average || 0;

    // Total incidents per day
    const totalIncidentsPerDay = await Incident.aggregate([
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          date: "$_id",
          count: 1,
          _id: 0,
        },
      },
      { $sort: { date: 1 } },
    ]);

    res.json({
      totalIncidents,
      averageResolutionTime: Number(averageResolutionTime.toFixed(2)),
      reportsByCategory,
      statusCount,
      averagePerDay: averagePerDayAgg[0]?.average.toFixed(2) || 0,
      totalIncidentsPerDay,
    });
  } catch (error) {
    console.error("Error fetching reports:", error);
    res.status(500).json({ msg: "Błąd podczas generowania raportów." });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getAllIncidents,
  updateIncidentStatus,
  deleteIncident,
  downloadReports,
  getReports,
};
