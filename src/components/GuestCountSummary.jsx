import React from 'react';
import { useSelectedRooms } from '../contexts/SelectedRoomsContext';

const OtherGuestNames = ({ form, setForm }) => {
  const { selectedRooms } = useSelectedRooms();
  const totalAdults = selectedRooms.reduce((sum, room) => sum + (room.adults || 0), 0);

  if (totalAdults <= 1) return null;

  const handleChange = (index, value) => {
    const updated = [...(form.otherGuests || [])];
    updated[index] = value;
    setForm({ ...form, otherGuests: updated });
  };

  return (
    <div className="space-y-3 mt-0">
      <label className="text-sm font-medium text-gray-700">Other Guest Names</label>
      {[...Array(totalAdults - 1)].map((_, idx) => (
        <input
          key={idx}
          type="text"
          className="border p-2 rounded w-full"
          placeholder={`Guest ${idx + 2} Full Name`}
          value={(form.otherGuests && form.otherGuests[idx]) || ''}
          onChange={(e) => handleChange(idx, e.target.value)}
        />
      ))}
    </div>
  );
};

export default OtherGuestNames;
