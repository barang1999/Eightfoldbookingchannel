// src/utils/calculateRates.js
export const filterAndCalculateTotal = (rates, breakfastIncluded, nights) => {
  const filteredRates = rates.filter(rate => {
    return breakfastIncluded ? rate.breakfastGuests > 0 : true;
  });

  const total = filteredRates.reduce((sum, rate) => {
    const pricePerNight = breakfastIncluded
      ? (rate.promotionPrice || rate.price) // use promotion price if exists
      : (rate.promotionRoomOnlyRate || rate.roomOnlyRate);

    return sum + (pricePerNight || 0);
  }, 0);

  return (total * nights).toFixed(2); // USD format
};