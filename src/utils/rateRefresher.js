// src/utils/rateRefresher.js

import { normalizeDate, parseLocalDateString } from './dateUtils.js';

// Helper to coerce a date or string to a Date (local, no time)
const coerceDate = (d) => {
  return typeof d === 'string'
    ? parseLocalDateString(d)
    : new Date(d.getFullYear(), d.getMonth(), d.getDate());
};

export async function refreshSelectedRooms(selectedRooms, stayPeriod, breakfastIncluded) {
  const start = new Date(stayPeriod.startDate);
  const end = new Date(stayPeriod.endDate);

  const nights = Math.max(
    Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)),
    1
  );

  const refreshedRooms = await Promise.all(
    selectedRooms.map(async (room) => {
      try {
        const params = new URLSearchParams({
          roomType: (room.roomType || room.name || '').toLowerCase(),
          roomId: room.roomId || room._id?.toString(),
          propertyId: room.propertyId,
          startDate: stayPeriod.startDate,
          endDate: stayPeriod.endDate,
          breakfast: room.breakfastIncluded === true ? "true" : "false",
        });


        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/rates/search?${params.toString()}`);
        const updatedData = await response.json();


        const matchedRate = updatedData;

        if (!matchedRate) {
          console.warn("⚠️ No matched rate for", room.roomType, "in:", updatedData);
        }

        if (matchedRate && matchedRate.totalPrice > 0) {
          const qty = room.quantity || 1;

          return {
            ...room,
            _id: room._id?.toString(), // overwrite _id for merging
            price: matchedRate.totalPrice,
            originalPrice: matchedRate.originalPrice,
            roomOnlyRate: matchedRate.roomOnlyRate,
            promotionPrice: matchedRate.promotionPrice,
            promotionRoomOnlyRate: matchedRate.promotionRoomOnlyRate,
            promotionBookableStartDate: matchedRate.promotionBookableStartDate,
            promotionBookableEndDate: matchedRate.promotionBookableEndDate,
            originalRoomOnlyRate: matchedRate.originalRoomOnlyRate,
            perNight: matchedRate.perNight,
            nights: nights,
            vat: matchedRate.totalPrice * (10 / 110), // VAT already included in price
            basePriceWithBreakfast: matchedRate.basePriceWithBreakfast,
            basePriceRoomOnly: matchedRate.basePriceRoomOnly,
            promotionPriceWithBreakfast: matchedRate.promotionPriceWithBreakfast ?? matchedRate.promotionPrice,
            promotionRoomOnlyRate: matchedRate.promotionRoomOnlyRate ?? matchedRate.promotionPrice,
            originalPriceWithBreakfast:
              matchedRate.originalPrice,
            originalPriceRoomOnly:
              matchedRate.originalRoomOnlyRate,
            unavailable: matchedRate.availability === false,
            quantity: qty,
            promoWithBF: matchedRate.promotionPriceWithBreakfast ?? matchedRate.promotionPrice ?? updatedData.promotionPrice ?? null,
            promoRoomOnly: matchedRate.promotionRoomOnlyRate ?? matchedRate.promotionPrice ?? updatedData.promotionRoomOnlyRate ?? updatedData.promotionPrice ?? null,
          };
        } else {
          console.warn("⚠️ No matched rate for roomId:", room._id, room.roomType);
          console.warn("⚠️ Room unavailable after refresh:", room.roomType);
          return { ...room, unavailable: true };
        }
      } catch (error) {
        console.error("❌ Failed to fetch refreshed rate for room:", room.roomType, error);
        return { ...room, unavailable: true }; // If no match
      }
    })
  );

  return refreshedRooms;
}

export async function refreshAllRoomRates(allRooms, stayPeriod, breakfastIncluded) {

  const start = new Date(stayPeriod.startDate);
  const end = new Date(stayPeriod.endDate);

  const nights = Math.max(
    Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)),
    1
  );

  const refreshed = await Promise.all(
    allRooms.map(async (room) => {
      try {
        // Skip rooms with missing roomType and name to avoid 400 Bad Request
        if (!room.roomType && !room.name) {
          console.warn("⚠️ Skipping room with missing roomType and name:", room);
          return { ...room, price: 0, unavailable: true, breakfastIncluded, promotionBookableStartDate: null, promotionBookableEndDate: null };
        }
        const params = new URLSearchParams({
          roomType: (room.roomType || room.name || "").toLowerCase(),
          roomId: room.roomId || room._id?.toString(),
          propertyId: room.propertyId,
          startDate: stayPeriod.startDate,
          endDate: stayPeriod.endDate,
          breakfast: breakfastIncluded ? "true" : "false",
        });

        

        let updatedData = null;
        try {
          const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/rates/search?${params.toString()}`);
          updatedData = await response.json();
        } catch (fetchError) {
          console.error("❌ Fetch error for room:", room.roomType || room.name, fetchError);
          return { ...room, price: 0, unavailable: true, breakfastIncluded: breakfastIncluded, promotionBookableStartDate: null, promotionBookableEndDate: null };
        }

        const qty = room.quantity || 1;
        const baseRoom = {
          ...room,
          _id: room._id?.toString() || room.roomId,
          roomId: room._id?.toString() || room.roomId,
          roomType: room.roomType || room.name || "",
          propertyId: room.propertyId,
          nights: nights,
          breakfastIncluded: breakfastIncluded,
          unavailable: updatedData?.availability === false || updatedData?.roomsToSell === 0,
          availability: updatedData?.availability ?? true,
          roomsToSell: updatedData?.roomsToSell ?? 0,
          quantity: qty,
        };

       

        if (updatedData?.totalPrice > 0) {
          return {
            ...baseRoom,
            price: updatedData.totalPrice,
            originalPrice: updatedData.originalPrice,
            roomOnlyRate: updatedData.roomOnlyRate,
            promotionPrice: updatedData.promotionPrice,
            promotionRoomOnlyRate: updatedData.promotionRoomOnlyRate,
            promotionBookableStartDate: updatedData.promotionBookableStartDate,
            promotionBookableEndDate: updatedData.promotionBookableEndDate,
            originalRoomOnlyRate: updatedData.originalRoomOnlyRate,
            perNight: updatedData.perNight,
            vat: updatedData.totalPrice * (10 / 110), // VAT already included in price
            basePriceWithBreakfast: updatedData.basePriceWithBreakfast,
            basePriceRoomOnly: updatedData.basePriceRoomOnly,
            promotionPriceWithBreakfast:
              updatedData.promotionPriceWithBreakfast ??
              (breakfastIncluded ? updatedData.promotionPrice : updatedData.promotionRoomOnlyRate) ??
              updatedData.promotionPrice,
            promotionRoomOnlyRate: updatedData.promotionRoomOnlyRate ?? updatedData.promotionPrice,
            originalPriceWithBreakfast:
              updatedData.originalPrice,
            originalPriceRoomOnly:
              updatedData.originalRoomOnlyRate,
            promoWithBF:
              updatedData.promotionPriceWithBreakfast ??
              (breakfastIncluded ? updatedData.promotionPrice : updatedData.promotionRoomOnlyRate) ??
              updatedData.promotionPrice ?? null,
            promoRoomOnly: updatedData.promotionRoomOnlyRate ?? updatedData.promotionPrice ?? null,
          };
        } else {
          return {
            ...baseRoom,
            price: 0,
            promotionBookableStartDate: null,
            promotionBookableEndDate: null,
          };
        }
      } catch (error) {
        console.error("❌ Unexpected error refreshing room:", room.roomType || room.name, error);
        return { ...room, price: 0, unavailable: true, breakfastIncluded: breakfastIncluded, promotionBookableStartDate: null, promotionBookableEndDate: null };
      }
    })
  );


  return refreshed;
}