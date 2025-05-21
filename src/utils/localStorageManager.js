const SELECTED_ROOMS_KEY = 'selectedRooms';

export const saveSelectedRooms = (rooms) => {
  localStorage.setItem(SELECTED_ROOMS_KEY, JSON.stringify(rooms));
};

export const getSelectedRooms = () => {
  const data = localStorage.getItem(SELECTED_ROOMS_KEY);
  return data ? JSON.parse(data) : [];
};

export const clearSelectedRooms = () => {
  localStorage.removeItem(SELECTED_ROOMS_KEY);
};