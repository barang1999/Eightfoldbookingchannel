import React, { useState } from 'react';
import { Box, Button, Drawer, Typography } from '@mui/material';
import ReservationChat from './ReservationChat';

const GuestReservationChat = ({ reservation }) => {
  const [open, setOpen] = useState(false);

  const toggleDrawer = (state) => () => setOpen(state);

  return (
    <>
      <Button
        variant="outlined"
        sx={{ borderColor: '#A58E63', color: '#A58E63' }}
        onClick={toggleDrawer(true)}
      >
        💬 Chat with Hotel
      </Button>

      <Drawer
        anchor="right"
        open={open}
        onClose={toggleDrawer(false)}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: '420px' },
            maxWidth: '100vw',
            boxShadow: 4,
            borderLeft: '1px solid #ddd',
            p: 2
          },
        }}
      >
        <Typography variant="h6" sx={{ mb: 2, color: '#A58E63' }}>
          {reservation.propertyName || 'Eightfold Urban Resort'}
        </Typography>

        <Typography variant="body2" sx={{ mb: 2, color: '#888' }}>
          {new Date(reservation.checkIn).toLocaleDateString()} → {new Date(reservation.checkOut).toLocaleDateString()}
        </Typography>

        <ReservationChat
          reservationId={reservation._id}
          guestEmail={reservation.email}
          propertyId={reservation.propertyId}
          sender="guest"
        />
      </Drawer>
    </>
  );
};

export default GuestReservationChat;