export function normalizeSelectedRooms(selectedRooms, availableRooms) {
    if (!Array.isArray(selectedRooms) || !Array.isArray(availableRooms)) {
      return [];
    }
  
    const updatedSelectedRooms = selectedRooms.map((selected) => {
      const matchingRoom = availableRooms.find((room) => 
        room.roomType?.toLowerCase() === selected.roomType?.toLowerCase() ||
        room.roomName?.toLowerCase() === selected.roomName?.toLowerCase()
      );
  
      if (matchingRoom) {
        return {
          ...selected,
          price: matchingRoom.price ?? selected.price,
          vat: matchingRoom.vat ?? selected.vat,
          availability: matchingRoom.availability ?? true,
          originalPrice: matchingRoom.originalPrice ?? selected.originalPrice,
          unavailable: false, // ✅ force reset if available
        };
      } else {
        // Keep the selected room but mark it unavailable
        return {
          ...selected,
          unavailable: true,
        };
      }
    });
  
    return updatedSelectedRooms;
  }