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

/**
 * @route   POST /api/incidents/:id/comments
 * @desc    Add a Comment to an Incident
 * @access  Private
 */
router.post("/:id/comments", authMiddleware, incidentsController.addComment);

/**
 * @route   GET /api/incidents/:id/comments
 * @desc    Get Comments for an Incident
 * @access  Public
 */
router.get("/:id/comments", incidentsController.getComments);

/**
 * @route   PUT /api/incidents/:id/status
 * @desc    Update Incident Status
 * @access  Private (Admin only)
 */
router.put(
  "/:id/status",
  authMiddleware,
  authorize("admin"),
  incidentsController.updateIncidentStatus
);

module.exports = router;
