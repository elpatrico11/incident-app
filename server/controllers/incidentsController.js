const Incident = require("../models/Incident");
const Notification = require("../models/Notification");
const { verifyRecaptcha } = require("../services/recaptchaService");

/**
 * @desc    Add a New Incident
 * @route   POST /api/incidents
 * @access  Public (with optional authentication)
 */
const addIncident = async (req, res, next) => {
  try {
    // If user is not authenticated, verify reCAPTCHA
    if (!req.user) {
      const captchaToken = req.body.captcha;
      if (!captchaToken) {
        return res
          .status(400)
          .json({ msg: "Please complete the reCAPTCHA verification." });
      }
      const isHuman = await verifyRecaptcha(captchaToken);
      if (!isHuman) {
        return res.status(400).json({ msg: "reCAPTCHA verification failed." });
      }
    }

    const {
      category,
      description,
      location,
      status,
      dataZdarzenia,
      dniTygodnia,
      poraDnia,
      address,
    } = req.body;

    // Parse and validate location
    let parsedLocation;
    if (location) {
      try {
        parsedLocation = JSON.parse(location);
        if (
          parsedLocation.type !== "Point" ||
          !Array.isArray(parsedLocation.coordinates) ||
          parsedLocation.coordinates.length !== 2
        ) {
          return res.status(400).json({ msg: "Invalid location format." });
        }
      } catch (error) {
        return res
          .status(400)
          .json({ msg: "Location must be a valid JSON string." });
      }
    } else {
      return res.status(400).json({ msg: "Location is required." });
    }

    // Handle image upload
    let images = [];
    if (req.file) {
      images.push(
        `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`
      );
    }

    // Initialize new incident data
    const newIncidentData = {
      category,
      description,
      location: parsedLocation,
      images,
      status: status || "Nowe",
    };

    if (address) newIncidentData.address = address;
    if (dataZdarzenia) newIncidentData.dataZdarzenia = new Date(dataZdarzenia);
    if (dniTygodnia && Array.isArray(dniTygodnia) && dniTygodnia.length > 0) {
      newIncidentData.dniTygodnia = dniTygodnia;
    }
    if (poraDnia) newIncidentData.poraDnia = poraDnia;

    // Assign user if authenticated
    if (req.user) {
      newIncidentData.user = req.user.id;
    }

    const newIncident = new Incident(newIncidentData);

    // Set resolvedAt if status is 'Rozwiązane'
    if (newIncident.status === "Rozwiązane") {
      newIncident.resolvedAt = new Date();
    }

    const incident = await newIncident.save();
    res.json(incident);
  } catch (error) {
    console.error("Error in addIncident:", error.message);
    next(error);
  }
};

/**
 * @desc    Get All Incidents
 * @route   GET /api/incidents
 * @access  Public
 */
const getAllIncidents = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = "date_desc",
      status,
      category,
      search,
    } = req.query;

    const query = {};

    // Apply filters
    if (status && status !== "All") query.status = status;
    if (category && category !== "All") query.category = category;
    if (search) query.description = { $regex: search, $options: "i" };

    // Define sorting criteria
    let sortCriteria = {};
    switch (sort) {
      case "date_desc":
        sortCriteria = { createdAt: -1 };
        break;
      case "date_asc":
        sortCriteria = { createdAt: 1 };
        break;
      case "status_asc":
        sortCriteria = { status: 1 };
        break;
      case "status_desc":
        sortCriteria = { status: -1 };
        break;
      default:
        sortCriteria = { createdAt: -1 };
    }

    const totalIncidents = await Incident.countDocuments(query);
    const totalPages = Math.ceil(totalIncidents / limit);
    const incidents = await Incident.find(query)
      .populate("user", ["firstName", "lastName", "email", "role"])
      .sort(sortCriteria)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ incidents, totalPages });
  } catch (error) {
    console.error("Error in getAllIncidents:", error.message);
    next(error);
  }
};

/**
 * @desc    Get My Incidents
 * @route   GET /api/incidents/my
 * @access  Private
 */
const getMyIncidents = async (req, res, next) => {
  try {
    const incidents = await Incident.find({ user: req.user.id }).populate(
      "user",
      ["firstName", "lastName", "email", "role"]
    );
    res.json(incidents);
  } catch (error) {
    console.error("Error in getMyIncidents:", error.message);
    next(error);
  }
};

/**
 * @desc    Get Single Incident
 * @route   GET /api/incidents/:id
 * @access  Public
 */
const getSingleIncident = async (req, res, next) => {
  try {
    const incident = await Incident.findById(req.params.id)
      .populate("user", ["firstName", "lastName", "email", "role"])
      .populate("statusLogs.changedBy", ["firstName", "lastName", "email"]);

    if (!incident) {
      return res.status(404).json({ msg: "Incident not found." });
    }

    // Format createdAt
    const formattedIncident = incident.toObject();
    formattedIncident.createdAt = incident.createdAt.toLocaleString("pl-PL", {
      dateStyle: "short",
      timeStyle: "short",
    });

    res.json(formattedIncident);
  } catch (error) {
    console.error("Error in getSingleIncident:", error.message);
    if (error.kind === "ObjectId") {
      return res.status(404).json({ msg: "Incident not found." });
    }
    next(error);
  }
};

/**
 * @desc    Update an Incident
 * @route   PUT /api/incidents/:id
 * @access  Private (Admin or Incident Creator)
 */
const updateIncident = async (req, res, next) => {
  try {
    const {
      category,
      description,
      location,
      status,
      dataZdarzenia, // New field
      dniTygodnia, // New field
      poraDnia, // New field
    } = req.body;

    const incidentFields = {};

    if (category) incidentFields.category = category;
    if (description) incidentFields.description = description;
    if (status) incidentFields.status = status;

    // Handle new fields
    if (dataZdarzenia) incidentFields.dataZdarzenia = new Date(dataZdarzenia);
    if (dniTygodnia && Array.isArray(dniTygodnia) && dniTygodnia.length > 0) {
      incidentFields.dniTygodnia = dniTygodnia;
    }
    if (poraDnia) incidentFields.poraDnia = poraDnia;

    // Parse and validate location
    if (location) {
      try {
        const parsedLocation = JSON.parse(location);
        if (
          parsedLocation.type !== "Point" ||
          !Array.isArray(parsedLocation.coordinates) ||
          parsedLocation.coordinates.length !== 2
        ) {
          return res.status(400).json({ msg: "Invalid location format." });
        }
        incidentFields.location = parsedLocation;
      } catch (error) {
        return res
          .status(400)
          .json({ msg: "Location must be a valid JSON string." });
      }
    }

    // Handle image upload
    if (req.file) {
      incidentFields.images = [
        `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`,
      ]; // Replace existing images with the new one
    }

    // Fetch the incident to verify ownership
    let incident = await Incident.findById(req.params.id);
    if (!incident) {
      return res.status(404).json({ msg: "Incident not found." });
    }

    // Check permissions
    if (
      incident.user &&
      incident.user.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(401).json({ msg: "Unauthorized." });
    }

    // Handle resolvedAt based on status
    if (status === "Rozwiązane" && incident.status !== "Rozwiązane") {
      incidentFields.resolvedAt = new Date();
    } else if (
      status &&
      status !== "Rozwiązane" &&
      incident.status === "Rozwiązane"
    ) {
      incidentFields.resolvedAt = undefined; // Remove resolvedAt if status changes from 'Rozwiązane'
    }

    // Update the incident
    incident = await Incident.findByIdAndUpdate(
      req.params.id,
      { $set: incidentFields },
      { new: true }
    ).populate("user", ["firstName", "lastName", "email", "role"]);

    res.json(incident);
  } catch (error) {
    console.error("Error in updateIncident:", error.message);
    next(error);
  }
};

/**
 * @desc    Delete an Incident
 * @route   DELETE /api/incidents/:id
 * @access  Private (Admin or Incident Creator)
 */
const deleteIncident = async (req, res, next) => {
  try {
    const incident = await Incident.findById(req.params.id);
    if (!incident) {
      return res.status(404).json({ msg: "Incident not found." });
    }

    // Check permissions
    if (
      incident.user &&
      incident.user.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(401).json({ msg: "Unauthorized." });
    }

    await Incident.findByIdAndDelete(req.params.id);
    res.json({ msg: "Incident deleted successfully." });
  } catch (error) {
    console.error("Error in deleteIncident:", error.message);
    if (error.kind === "ObjectId") {
      return res.status(404).json({ msg: "Incident not found." });
    }
    next(error);
  }
};

/**
 * @desc    Add a Comment to an Incident
 * @route   POST /api/incidents/:id/comments
 * @access  Private
 */
const addComment = async (req, res, next) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ msg: "Comment text is required." });
  }

  try {
    const incident = await Incident.findById(req.params.id);
    if (!incident) {
      return res.status(404).json({ msg: "Incident not found." });
    }

    const newComment = {
      user: req.user.id,
      text,
    };

    incident.comments.unshift(newComment);
    await incident.save();

    const populatedComment = await incident.populate("comments.user", [
      "firstName",
      "lastName",
      "email",
    ]);

    res.json(populatedComment.comments);
  } catch (error) {
    console.error("Error in addComment:", error.message);
    next(error);
  }
};

/**
 * @desc    Get Comments for an Incident
 * @route   GET /api/incidents/:id/comments
 * @access  Public
 */
const getComments = async (req, res, next) => {
  try {
    const incident = await Incident.findById(req.params.id).populate(
      "comments.user",
      ["firstName", "lastName", "email"]
    );

    if (!incident) {
      return res.status(404).json({ msg: "Incident not found." });
    }

    res.json(incident.comments);
  } catch (error) {
    console.error("Error in getComments:", error.message);
    next(error);
  }
};

/**
 * @desc    Update Incident Status
 * @route   PUT /api/incidents/:id/status
 * @access  Private (Admin only)
 */
const updateIncidentStatus = async (req, res, next) => {
  let { status } = req.body;

  if (!status) {
    return res.status(400).json({ msg: "Status is required." });
  }

  // Normalize status
  status = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();

  const validStatuses = [
    "Nowe",
    "Weryfikacja",
    "Potwierdzone",
    "Wstrzymane",
    "Eskalowane",
    "Rozwiązane",
    "Nierozwiązane",
    "Zamknięte",
    "Odrzucone",
  ];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ msg: "Invalid status value." });
  }

  try {
    let incident = await Incident.findById(req.params.id).populate("user", [
      "firstName",
      "lastName",
      "email",
      "role",
    ]);

    if (!incident) {
      return res.status(404).json({ msg: "Incident not found." });
    }

    // Update status and handle resolvedAt
    const updateData = {
      status,
      changedBy: req.user.id, // Add the user ID here
    };

    const finalStatuses = [
      "Rozwiązane",
      "Nierozwiązane",
      "Zamknięte",
      "Odrzucone",
    ];
    if (finalStatuses.includes(status)) {
      updateData.resolvedAt = new Date();
    } else {
      updateData.resolvedAt = undefined; // Remove resolvedAt if status is not final
    }

    // Perform the update using findOneAndUpdate to trigger middleware
    incident = await Incident.findOneAndUpdate(
      { _id: req.params.id },
      { $set: updateData },
      { new: true }
    ).populate("user", ["firstName", "lastName", "email", "role"]);

    // Create a notification for the user
    if (incident.user) {
      const message = `Twój incydent o kategorii "${incident.category}" został zaktualizowany do statusu "${status}".`;
      const newNotification = new Notification({
        user: incident.user._id,
        message,
        relatedIncident: incident._id,
      });

      await newNotification.save();
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

module.exports = {
  addIncident,
  getAllIncidents,
  getMyIncidents,
  getSingleIncident,
  updateIncident,
  deleteIncident,
  addComment,
  getComments,
  updateIncidentStatus,
};
