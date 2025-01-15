import React from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Grid,
  Link,
  Alert,
  Button,
  TextField,
  Chip,
} from '@mui/material';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON } from 'react-leaflet';
import useIncidentDetail from '../../controllers/hooks/useIncidentDetail';
import AlertMessage from '../components/common/AlertMessage';
import Loader from '../components/common/Loader';

const IncidentDetailPage = () => {
  const { id } = useParams();
  const {
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
  } = useIncidentDetail(id);

  // Destructure the incident data for easier access
  const {
    category,
    description,
    status,
    images,
    location,
    address,     
    dataZdarzenia,
    dniTygodnia,
    poraDnia,
    statusLogs,
  } = incident || {};

  // Define colors for different statuses
  const statusColors = {
    Nowe: 'text-blue-500',
    Weryfikacja: 'text-yellow-500',
    Potwierdzone: 'text-green-500',
    Wstrzymane: 'text-gray-500',
    Eskalowane: 'text-orange-500',
    Rozwiązane: 'text-teal-500',
    Nierozwiązane: 'text-red-500',
    Zamknięte: 'text-purple-500',
    Odrzucone: 'text-pink-500',
    default: 'text-gray-500',
  };

  // Determine loading state
  const isLoading = loadingIncident || loadingBoundary;

  // Check if the incident is inside the boundary
  const isWithinBoundary = isIncidentWithinBoundary();

  return (
    <Container className="mt-4">
      {/* Loading State */}
      {isLoading && <Loader />}

      {/* Error State for Incident */}
      {(!isLoading && incidentError) && (
        <AlertMessage type="error" message={incidentError} />
      )}

      {/* Error State for Boundary */}
      {(!isLoading && boundaryError) && (
        <AlertMessage type="error" message={boundaryError} />
      )}

      {/* No Incident Found */}
      {(!isLoading && !incident && !incidentError) && (
        <Alert severity="warning">Nie znaleziono zgłoszenia.</Alert>
      )}

      {/* Main Content */}
      {(!isLoading && incident) && (
        <>
          {/* Incident Title and Description */}
          <Typography variant="h4" gutterBottom className="text-white">
            {category}
          </Typography>
          <Typography variant="body1" gutterBottom className="text-gray-300">
            {description}
          </Typography>

          {/* Additional Fields: Data Zdarzenia, Dni Tygodnia, Pora Dnia */}
          <Box className="mt-2">
            <Grid container spacing={2}>
              {/* Data Zdarzenia */}
              {dataZdarzenia && (
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2" className="text-gray-400">
                    Data Zdarzenia:
                  </Typography>
                  <Typography variant="body2" className="text-gray-300">
                    {new Date(dataZdarzenia).toLocaleDateString('pl-PL')}
                  </Typography>
                </Grid>
              )}

              {/* Dni Tygodnia */}
              {dniTygodnia && dniTygodnia.length > 0 && (
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2" className="text-gray-400">
                    Dni Tygodnia:
                  </Typography>
                  <Box className="flex flex-wrap gap-2 mt-1">
                    {dniTygodnia.map((day, index) => (
                      <Chip
                        key={index}
                        label={day}
                        className="bg-gray-700 text-white"
                      />
                    ))}
                  </Box>
                </Grid>
              )}

              {/* Pora Dnia */}
              {poraDnia && (
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2" className="text-gray-400">
                    Pora Dnia:
                  </Typography>
                  <Typography variant="body2" className="text-gray-300">
                    {poraDnia}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Box>

          {/* Incident Status */}
          <Typography
            variant="caption"
            display="block"
            gutterBottom
            className="mt-2 text-gray-400"
          >
            Status:{' '}
            <span className={statusColors[status] || statusColors.default}>
              {status}
            </span>
          </Typography>

          {incident?.createdAt && (
          <Typography
            variant="caption"
            display="block"
            gutterBottom
            className="mt-2 text-gray-400"
          >
            Data dodania:{' '}
            <span className="text-gray-300">
              {new Date(incident.createdAt).toLocaleDateString('pl-PL', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              })}
            </span>
          </Typography>
        )}

          {/* Incident Images */}
          {images && images.length > 0 && (
            <Grid container spacing={2} className="mt-2">
              {images.map((src, index) => (
                <Grid item key={index} xs={12} sm={6} md={4}>
                  <img
                    src={src}
                    alt={`Incydent ${index + 1}`}
                    className="w-full h-auto rounded-lg"
                    loading="lazy"
                  />
                </Grid>
              ))}
            </Grid>
          )}

          {/* Incident Location Map */}
          <Box className="mt-4">
            <Typography variant="h6" gutterBottom className="text-white">
              Lokalizacja
            </Typography>
            <Box className="h-64 w-full">
              <MapContainer
                center={[location.coordinates[1], location.coordinates[0]]}
                zoom={13}
                className="h-full w-full rounded-lg"
              >
                <TileLayer
                  attribution='&copy; OpenStreetMap contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {/* Boundary GeoJSON Layer */}
                {boundary && (
                  <GeoJSON
                    data={boundary}
                    style={{
                      color: '#0000FF',
                      weight: 2,
                      fillColor: '#0000FF',
                      fillOpacity: 0.1,
                    }}
                  />
                )}
                {/* Marker for Incident Location */}
                <Marker
                  position={[location.coordinates[1], location.coordinates[0]]}
                >
                  <Popup>
                    <Typography variant="h6" className="text-black">
                      {category}
                    </Typography>
                    <Typography variant="body2" className="text-black">
                      {description}
                    </Typography>
                    {address && (
                      <Typography variant="body2" className="text-black">
                        Adres: {address}
                      </Typography>
                    )}
                    <Typography variant="caption" className="text-black">
                      Status: {status}
                    </Typography>
                  </Popup>
                </Marker>
              </MapContainer>
            </Box>
          </Box>

          {/* Instead of "Zgłoszenie wewnątrz granic miasta" -> show exact address or "outside" */}
          <Box className="mt-2">
            {isWithinBoundary ? (
              // If it's inside the boundary, show the stored address
              address ? (
                <Typography variant="body2" className="text-gray-300">
                  Dokładna lokalizacja: {address}
                </Typography>
              ) : (
                <Typography variant="body2" className="text-gray-300">
                  Brak dostępnego adresu
                </Typography>
              )
            ) : (
              <Typography variant="body2" className="text-red-500">
                Zgłoszenie znajduje się poza granicami miasta.
              </Typography>
            )}
          </Box>

          {/* Status Logs Section */}
          <Box className="mt-4">
            <Typography variant="h6" gutterBottom className="text-white">
              Historia Zmian Statusów
            </Typography>
            {statusLogs && statusLogs.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-gray-800 rounded-lg">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left text-gray-300">
                        Zmieniono przez
                      </th>
                      <th className="px-4 py-2 text-left text-gray-300">
                        Z Statusu
                      </th>
                      <th className="px-4 py-2 text-left text-gray-300">
                        Na Status
                      </th>
                      <th className="px-4 py-2 text-left text-gray-300">
                        Kiedy
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {statusLogs.map((log, index) => (
                      <tr
                        key={index}
                        className={`hover:bg-gray-700 ${
                          index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-700'
                        }`}
                      >
                        <td className="border px-4 py-2 text-gray-300">
                          {log.changedBy
                            ? `${log.changedBy.firstName} ${log.changedBy.lastName}`
                            : 'System'}
                        </td>
                        <td className="border px-4 py-2 text-gray-300">
                          {log.previousStatus}
                        </td>
                        <td
                          className={`border px-4 py-2 ${
                            statusColors[log.newStatus] || statusColors.default
                          }`}
                        >
                          {log.newStatus}
                        </td>
                        <td className="border px-4 py-2 text-gray-300">
                          {new Date(log.changedAt).toLocaleString('pl-PL', {
                            dateStyle: 'short',
                            timeStyle: 'short',
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <Typography variant="body2" className="mt-1 text-gray-300">
                Brak zmian statusów.
              </Typography>
            )}
          </Box>

          {/* Comments Section */}
          <Box className="mt-4">
            <Typography variant="h6" className="text-white">
              Komentarze
            </Typography>

            {/* Loading State for Comments */}
            {loadingComments && (
              <Box className="flex justify-center items-center my-4">
                <CircularProgress />
              </Box>
            )}

            {/* Error State for Comments */}
            {(!loadingComments && commentsError) && (
              <Alert severity="error" className="mb-4">
                {commentsError}
              </Alert>
            )}

           {/* Comments List */}
            <div className="space-y-4">
              {Array.isArray(comments) && comments.length > 0 ? (
                comments.map((commentItem, index) => (
                  <Box
                    key={index}
                    className="flex items-start bg-gray-800 rounded-lg p-4 border border-gray-600"
                  >
                    {/* Avatar */}
                    <Box className="flex-shrink-0">
                      {commentItem.user && commentItem.user.avatarUrl ? (
                        <img
                          src={commentItem.user.avatarUrl}
                          alt={`${commentItem.user.firstName} ${commentItem.user.lastName}`}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <Box className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center text-white font-semibold">
                          {commentItem.user
                            ? `${commentItem.user.firstName.charAt(0)}${commentItem.user.lastName.charAt(0)}`
                            : 'A'}
                        </Box>
                      )}
                    </Box>
                    {/* Comment Content */}
                    <Box className="ml-4">
                      <Typography
                        variant="body2"
                        className="text-gray-300"
                      >
                        <strong>
                          {commentItem.user
                            ? `${commentItem.user.firstName} ${commentItem.user.lastName}`
                            : 'Anonimowy'}
                        </strong>
                      </Typography>
                      <Typography
                        variant="body2"
                        className="text-gray-200 mt-1"
                      >
                        {commentItem.text}
                      </Typography>
                      <Typography
                        variant="caption"
                        className="text-gray-400 mt-1"
                      >
                        {new Date(commentItem.createdAt).toLocaleString('pl-PL', {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                      </Typography>
                    </Box>
                  </Box>
                ))
              ) : (
                <Typography variant="body2" className="mt-1 text-gray-300">
                  Brak komentarzy.
                </Typography>
              )}
            </div>

            {/* Comment Submission Form */}
            {user ? (
              <Box
                component="form"
                onSubmit={handleCommentSubmit}
                className="mt-4"
              >
                <TextField
                  fullWidth
                  label="Dodaj komentarz"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  error={!!commentError}
                  helperText={commentError}
                  multiline
                  rows={3}
                  className="bg-gray-700 text-white"
                  InputLabelProps={{
                    className: 'text-gray-300',
                  }}
                  InputProps={{
                    className: 'text-gray-200',
                  }}
                  disabled={isSubmittingComment}
                />
                <Button
                  type="submit"
                  variant="contained"
                  className="mt-2 bg-blue-600 hover:bg-blue-700"
                  disabled={isSubmittingComment}
                >
                  {isSubmittingComment ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'Dodaj'
                  )}
                </Button>
              </Box>
            ) : (
              <Typography
                variant="body2"
                className="mt-4 text-gray-300"
              >
                <Link
                  component={RouterLink}
                  to="/login"
                  className="text-blue-400 hover:underline"
                >
                  Zaloguj się
                </Link>{' '}
                aby dodać komentarz.
              </Typography>
            )}
          </Box>
        </>
      )}
    </Container>
  );
};

export default IncidentDetailPage;
