import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Container, CircularProgress } from '@mui/material';

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetching announcements from the backend without the /api prefix
    fetch('http://localhost:3002/announcements', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Adding credentials to include cookies if necessary (if you're using sessions)
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => {
        console.log('API response:', data);
        // Adjust this line if your response is nested or has a different structure
        setAnnouncements(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching announcements:', err);
        setLoading(false);
      });
  }, []);

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Barangay Announcements
      </Typography>

      {loading ? (
        <CircularProgress />
      ) : (
        announcements.length > 0 ? (
          announcements.map((a) => (
            <Card key={a._id} sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6">{a.content}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {new Date(a.postedAt).toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          ))
        ) : (
          <Typography>No announcements available.</Typography>
        )
      )}
    </Container>
  );
};

export default Announcements;
