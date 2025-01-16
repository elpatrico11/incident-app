const express = require("express");
const router = express.Router();
const incidentsController = require("../controllers/incidentsController");
const authMiddleware = require("../middlewares/auth");
const authorize = require("../middlewares/authorize");
const upload = require("../middlewares/upload");
const optionalAuth = require("../middlewares/optionalAuth");
/**
 * @route   POST /api/incidents
 * @desc    Add a New Incident
 * @access  Public (with optional authentication)
 */
router.post(
  "/",
  upload.single("image"),
  optionalAuth, // Apply optionalAuth middleware
  incidentsController.addIncident
);

/**
 * @route   GET /api/incidents
 * @desc    Get All Incidents
 * @access  Public
 */
router.get("/", incidentsController.getAllIncidents);

/**
 * @route   GET /api/incidents/my
 * @desc    Get My Incidents
 * @access  Private
 */
router.get("/my", authMiddleware, incidentsController.getMyIncidents);

/**
 * @route   GET /api/incidents/:id
 * @desc    Get Single Incident
 * @access  Public
 */
router.get("/:id", incidentsController.getSingleIncident);

/**
 * @route   PUT /api/incidents/:id
 * @desc    Update an Incident
 * @access  Private (Admin or Incident Creator)
 */
router.put(
  "/:id",
  authMiddleware,
  authorize(["admin", "user"]),
  upload.single("image"),
  incidentsController.updateIncident
);

/**
 * @route   DELETE /api/incidents/:id
 * @desc    Delete an Incident
 * @access  Private (Admin or Incident Creator)
 */
router.delete(
  "/:id",
  authMiddleware,
  authorize(["admin", "user"]),
  incidentsController.deleteIncident
);

//Add a Comment to an Incident

router.post("/:id/comments", authMiddleware, incidentsController.addComment);

//Get Comments for an Incident

router.get("/:id/comments", incidentsController.getComments);

//Update Incident Status

router.put(
  "/:id/status",
  authMiddleware,
  authorize("admin"),
  incidentsController.updateIncidentStatus
);

module.exports = router;
