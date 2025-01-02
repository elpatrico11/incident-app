import { useState, useEffect, useCallback } from "react";
import {
  fetchIncidentDetails,
  fetchCommentsByIncidentId,
  submitComment,
} from "../../api/services/incidentService";
import { point, polygon, booleanPointInPolygon } from "@turf/turf";
import useAuthStore from "../../models/stores/useAuthStore";

/**
 * Custom hook to manage incident details, comments, and boundary data.
 * @param {string} id - The ID of the incident.
 * @returns {Object} - State and handler functions.
 */
const useIncidentDetail = (id) => {
  const { user } = useAuthStore();

  // Incident States
  const [incident, setIncident] = useState(null);
  const [loadingIncident, setLoadingIncident] = useState(true);
  const [incidentError, setIncidentError] = useState("");

  // Comments States
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [commentsError, setCommentsError] = useState("");

  // Comment Submission States
  const [comment, setComment] = useState("");
  const [commentError, setCommentError] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Boundary States
  const [boundary, setBoundary] = useState(null);
  const [loadingBoundary, setLoadingBoundary] = useState(true);
  const [boundaryError, setBoundaryError] = useState("");

  /**
   * Fetch incident details.
   */
  const loadIncident = useCallback(async () => {
    setLoadingIncident(true);
    try {
      const data = await fetchIncidentDetails(id);
      setIncident(data);
    } catch (err) {
      console.error(err);
      setIncidentError(
        err.response?.data?.msg || "Błąd podczas pobierania zgłoszenia."
      );
    }
    setLoadingIncident(false);
  }, [id]);

  /**
   * Fetch comments for the incident.
   */
  const loadComments = useCallback(async () => {
    setLoadingComments(true);
    try {
      const data = await fetchCommentsByIncidentId(id);

      // Determine where the comments array is located based on response structure
      let commentsArray = [];

      if (Array.isArray(data)) {
        // Direct array
        commentsArray = data;
      } else if (data.comments && Array.isArray(data.comments)) {
        // Nested within 'comments' property
        commentsArray = data.comments;
      } else if (data.data && Array.isArray(data.data)) {
        // Nested within 'data' property (common in pagination)
        commentsArray = data.data;
      } else {
        console.error("Unexpected comments data structure:", data);
        setCommentsError("Nieprawidłowy format danych komentarzy.");
      }

      setComments(commentsArray);
    } catch (err) {
      console.error(err);
      setCommentsError("Błąd podczas pobierania komentarzy.");
    }
    setLoadingComments(false);
  }, [id]);

  /**
   * Fetch boundary GeoJSON data.
   */
  const loadBoundary = useCallback(async () => {
    const boundaryGeoJSONUrl = "/assets/geo/bielsko-biala-boundary.geojson";

    try {
      const response = await fetch(boundaryGeoJSONUrl);
      if (!response.ok) throw new Error("Failed to load boundary data");
      const data = await response.json();
      setBoundary(data);
    } catch (err) {
      console.error("Error loading boundary GeoJSON:", err);
      setBoundaryError("Błąd podczas ładowania danych granicy.");
    } finally {
      setLoadingBoundary(false);
    }
  }, []);

  /**
   * Submit a new comment.
   */
  const handleCommentSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!comment.trim()) {
        setCommentError("Komentarz nie może być pusty.");
        return;
      }

      setIsSubmittingComment(true);
      try {
        const data = await submitComment(id, { text: comment });

        // Determine how to update comments based on API response
        if (Array.isArray(data)) {
          // Option 2: API returns updated comments list
          setComments(data);
        } else if (typeof data === "object" && data !== null) {
          // Option 1: API returns the new comment
          setComments((prevComments) => [...prevComments, data]);
        } else {
          console.error("Unexpected response from submitComment:", data);
          setCommentsError(
            "Nieoczekiwany format danych po dodaniu komentarza."
          );
        }

        setComment("");
        setCommentError("");
      } catch (err) {
        console.error(err);
        setCommentError(
          err.response?.data?.msg || "Błąd podczas dodawania komentarza."
        );
      } finally {
        setIsSubmittingComment(false);
      }
    },
    [id, comment]
  );

  /**
   * Determine if the incident is within the boundary.
   */
  const isIncidentWithinBoundary = useCallback(() => {
    if (
      boundary &&
      incident &&
      incident.location &&
      incident.location.coordinates
    ) {
      const [lng, lat] = incident.location.coordinates;
      const incidentPoint = point([lng, lat]);
      const boundaryPolygon = polygon(
        boundary.features[0].geometry.coordinates
      );
      return booleanPointInPolygon(incidentPoint, boundaryPolygon);
    }
    return false;
  }, [boundary, incident]);

  // Fetch data on mount
  useEffect(() => {
    loadIncident();
    loadComments();
    loadBoundary();
  }, [loadIncident, loadComments, loadBoundary]);

  return {
    // Incident Data
    incident,
    loadingIncident,
    incidentError,

    // Comments Data
    comments,
    loadingComments,
    commentsError,

    // Comment Submission
    comment,
    setComment,
    handleCommentSubmit,
    commentError,
    isSubmittingComment,

    // Boundary Data
    boundary,
    loadingBoundary,
    boundaryError,

    // Utility
    isIncidentWithinBoundary,
    user,
  };
};

export default useIncidentDetail;
