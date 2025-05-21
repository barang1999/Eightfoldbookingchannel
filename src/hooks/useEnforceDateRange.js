import { useEffect } from "react";

// Patch: Ensure checkIn/checkOut from new dateRange override persisted room values in ModifyReservationPage
export function useEnforceDateRange(selectedRooms, dateRange, setSelectedRooms) {
  useEffect(() => {
    if (!selectedRooms.length || !dateRange.startDate || !dateRange.endDate) return;

    const normalizedStart = new Date(dateRange.startDate);
    const normalizedEnd = new Date(dateRange.endDate);
    normalizedStart.setHours(12, 0, 0, 0);
    normalizedEnd.setHours(12, 0, 0, 0);

    const patched = selectedRooms.map((room) => ({
      ...room,
      checkIn: normalizedStart,
      checkOut: normalizedEnd,
    }));

    // Only apply patch if any date mismatch exists
    const needsPatch = selectedRooms.some(
      (room) =>
        new Date(room.checkIn).getTime() !== normalizedStart.getTime() ||
        new Date(room.checkOut).getTime() !== normalizedEnd.getTime()
    );

    if (needsPatch) {
      console.log("✅ Patch applied: Room dates synchronized to selected dateRange.");
      setSelectedRooms(patched);
    } else {
      console.log("ℹ️ Room dates already match selected dateRange. No patch needed.");
    }
  }, [selectedRooms, dateRange, setSelectedRooms]);
}
