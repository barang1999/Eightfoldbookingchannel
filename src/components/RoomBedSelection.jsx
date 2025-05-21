import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useSelectedRooms } from '../contexts/SelectedRoomsContext';

const RoomBedSelection = ({ bedPreferences, onBedChange, bedSelectionErrors = {}, showError }) => {
  const { selectedRooms } = useSelectedRooms();
  const [fullRoomDataMap, setFullRoomDataMap] = useState({});
  const [internalBedSelectionErrors, setBedSelectionErrors] = useState({});
  const [selectedBeds, setSelectedBeds] = useState({});

  // Restore selectedBeds from localStorage on mount
  useEffect(() => {
    const storedBeds = localStorage.getItem('selectedBeds');
    if (storedBeds) {
      try {
        setSelectedBeds(JSON.parse(storedBeds));
      } catch (err) {
        console.error("Failed to parse selectedBeds from localStorage", err);
      }
    }
    // Auto-default bed selection if none exists
    const defaultBeds = {};
    selectedRooms.forEach(room => {
      if (room.requiresBedChoice && Array.isArray(room.bedTypes) && room.bedTypes.length > 0) {
        defaultBeds[room.instanceId] = room.bedTypes[0]; // default to first bedType
      }
    });
    setSelectedBeds(prev => ({ ...defaultBeds, ...prev }));
    localStorage.setItem('selectedBeds', JSON.stringify({ ...defaultBeds, ...selectedBeds }));
  }, []);

  const prevBedsRef = useRef({});
  const didMountRef = useRef(false);

  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      prevBedsRef.current = selectedBeds;
      return;
    }

    if (typeof onBedChange === 'function') {
      const allBedsSelected = selectedRooms.every(room => {
        return !room.requiresBedChoice || selectedBeds[room.id];
      });

      const hasChanged = JSON.stringify(prevBedsRef.current) !== JSON.stringify(selectedBeds);

      if (hasChanged && allBedsSelected) {
        prevBedsRef.current = selectedBeds;
        onBedChange(selectedBeds);
      }
    }
  // Only trigger this useEffect when selectedBeds changes
  }, [selectedBeds]);

  useEffect(() => {
    const fetchRoomDetails = async () => {
      const map = {};
      for (const room of selectedRooms) {
        const { roomId, propertyId } = room;
        try {
          const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/rooms/${roomId}?propertyId=${propertyId}`);
          const data = await res.json();
          map[roomId] = data;
        } catch (err) {
          console.error(`[RoomBedSelection] Failed to fetch room ${roomId}:`, err);
        }
      }
      setFullRoomDataMap(map);
    };

    if (selectedRooms.length > 0) {
      fetchRoomDetails();
    }
  }, [selectedRooms]);


  const roomsWithBeds = useMemo(() => {
    return selectedRooms.map(room => {
      const roomDetails = fullRoomDataMap[room.roomId] || {};
      const fullRoom = {
        ...roomDetails,
        ...room,
        bedTypes: Array.isArray(roomDetails.bedTypes) && roomDetails.bedTypes.length > 0
          ? roomDetails.bedTypes
          : Array.isArray(roomDetails.fixedBedSetup)
          ? roomDetails.fixedBedSetup
          : [],
        requiresBedChoice: roomDetails.requiresBedChoice === true
      };


      return fullRoom;
    });
  }, [selectedRooms, fullRoomDataMap]);

  // Default bed selection after roomsWithBeds is available
  useEffect(() => {
    if (roomsWithBeds.length > 0 && Object.keys(selectedBeds).length === 0) {
      const defaultBeds = {};
      roomsWithBeds.forEach(room => {
        if (room.requiresBedChoice && Array.isArray(room.bedTypes) && room.bedTypes.length > 0) {
          defaultBeds[room.instanceId] = room.bedTypes[0]; // default to first bed option
        }
      });
      setSelectedBeds(defaultBeds);
      localStorage.setItem('selectedBeds', JSON.stringify(defaultBeds));
    }
  }, [roomsWithBeds]);

  useEffect(() => {
    if (roomsWithBeds.length === 0) return;

    const missing = {};
    for (const room of roomsWithBeds) {
      if (
        room.requiresBedChoice &&
        (!selectedBeds[room.instanceId] || selectedBeds[room.instanceId].trim() === '')
      ) {
        missing[room.instanceId] = true;
      }
    }

    if (showError || Object.keys(missing).length > 0) {
      setBedSelectionErrors(missing);
    }
  }, [roomsWithBeds, selectedBeds, showError]);

const handleBedChange = (roomInstanceId, bed) => {
  const updated = { ...selectedBeds, [roomInstanceId]: bed };
  setSelectedBeds(updated);
  localStorage.setItem('selectedBeds', JSON.stringify(updated));
  setBedSelectionErrors(prev => ({ ...prev, [roomInstanceId]: false }));

  const matchedRoom = roomsWithBeds.find(r => r.instanceId === roomInstanceId);
  if (typeof onBedChange === 'function' && matchedRoom) {
    onBedChange(roomInstanceId, bed, {
      bedTypes: matchedRoom.bedTypes,
      doubleBedCount: matchedRoom.doubleBedCount,
      singleBedCount: matchedRoom.singleBedCount,
    });
  }
};

  return (
    <div className="space-y-6 pt-2 mt-2">
      {roomsWithBeds.map((room, idx) => {
        if (!room.requiresBedChoice) {
          return (
            <div key={room.id || idx} className="rounded-xl border border-gray-200 p-7 pl-8 bg-white">
              <h3 className="text-lg font-semibold text-gray-800 mb-1">{room.name}</h3>
              <p className="text-sm text-gray-600 mb-2">
                Guests: 
                {room.capacity?.maxAdults > 0 ? ` ${room.capacity.maxAdults} adult${room.capacity.maxAdults > 1 ? 's' : ''}` : ''}
                {room.capacity?.maxChildren > 0 ? `, ${room.capacity.maxChildren} child${room.capacity.maxChildren > 1 ? 'ren' : ''}` : ''}
              </p>
              <p className="text-sm text-gray-600 mb-4 flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" className="text-red-600">
                  <path d="M19.5 9h2.25a.75.75 0 0 1 .75.75v3a.75.75 0 0 1-.75.75h-7.5a.75.75 0 0 0 0 1.5h7.5A2.25 2.25 0 0 0 24 12.75v-3a2.25 2.25 0 0 0-2.25-2.25H19.5a.75.75 0 0 0 0 1.5M5.25 13.5h-1.5l.75.75v-6L3.75 9h7.5a.75.75 0 0 0 0-1.5h-7.5a.75.75 0 0 0-.75.75v6c0 .414.336.75.75.75h1.5a.75.75 0 0 0 0-1.5M15 12v2.25a.75.75 0 0 0 1.5 0V12a.75.75 0 0 0-1.5 0M0 8.25v6a.75.75 0 0 0 1.5 0v-6a.75.75 0 0 0-1.5 0m1.28 15.53 22.5-22.5A.75.75 0 0 0 22.72.22L.22 22.72a.75.75 0 1 0 1.06 1.06M4.5.75A2.25 2.25 0 0 1 2.25 3 2.25 2.25 0 0 0 0 5.25a.75.75 0 0 0 1.5 0 .75.75 0 0 1 .75-.75A3.75 3.75 0 0 0 6 .75a.75.75 0 0 0-1.5 0"/>
                </svg>
                No smoking
              </p>
              <p className="text-sm text-gray-700">
                {[
                  room.doubleBedCount > 0 ? `${room.doubleBedCount} large double bed${room.doubleBedCount > 1 ? 's' : ''}` : '',
                  room.singleBedCount > 0 ? `${room.singleBedCount} single bed${room.singleBedCount > 1 ? 's' : ''}` : ''
                ].filter(Boolean).join(', ')}
              </p>
            </div>
          );
        }

        return (
          <div
            key={room.id || idx}
            className={`rounded-xl p-5 pl-8 bg-white border ${
              ((bedSelectionErrors[room.instanceId] ?? internalBedSelectionErrors[room.instanceId]) &&
              (!selectedBeds[room.instanceId] || selectedBeds[room.instanceId].trim() === '')) ? 'border-red-500' : 'border-gray-200'
            }`}
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-1">{room.name}</h3>
            <p className="text-sm text-gray-600 mb-2">
              Guests: 
              {room.capacity?.maxAdults > 0 ? ` ${room.capacity.maxAdults} adult${room.capacity.maxAdults > 1 ? 's' : ''}` : ''}
              {room.capacity?.maxChildren > 0 ? `, ${room.capacity.maxChildren} child${room.capacity.maxChildren > 1 ? 'ren' : ''}` : ''}
            </p>
            <p className="text-sm text-gray-600 mb-4 flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" className="text-red-600">
                <path d="M19.5 9h2.25a.75.75 0 0 1 .75.75v3a.75.75 0 0 1-.75.75h-7.5a.75.75 0 0 0 0 1.5h7.5A2.25 2.25 0 0 0 24 12.75v-3a2.25 2.25 0 0 0-2.25-2.25H19.5a.75.75 0 0 0 0 1.5M5.25 13.5h-1.5l.75.75v-6L3.75 9h7.5a.75.75 0 0 0 0-1.5h-7.5a.75.75 0 0 0-.75.75v6c0 .414.336.75.75.75h1.5a.75.75 0 0 0 0-1.5M15 12v2.25a.75.75 0 0 0 1.5 0V12a.75.75 0 0 0-1.5 0M0 8.25v6a.75.75 0 0 0 1.5 0v-6a.75.75 0 0 0-1.5 0m1.28 15.53 22.5-22.5A.75.75 0 0 0 22.72.22L.22 22.72a.75.75 0 1 0 1.06 1.06M4.5.75A2.25 2.25 0 0 1 2.25 3 2.25 2.25 0 0 0 0 5.25a.75.75 0 0 0 1.5 0 .75.75 0 0 1 .75-.75A3.75 3.75 0 0 0 6 .75a.75.75 0 0 0-1.5 0"/>
              </svg>
              No smoking
            </p>

            {room.requiresBedChoice ? (
              <>
                <label className="block text-sm font-medium text-gray-700 mb-2">Choose your bed (if available):</label>
                <div className="space-y-2">
                  {room.bedTypes.map((bed, i) => (
                    <label key={i} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`bed-${room.instanceId}`}
                        value={bed}
                        checked={selectedBeds?.[room.instanceId] === bed}
                        onChange={() => handleBedChange(room.instanceId, bed)}
                        className="accent-blue-600"
                      />
                      <span className="text-sm text-gray-700">
                        {bed === 'large double bed' && room.doubleBedCount ? `${room.doubleBedCount}  ${bed}` :
                         bed === 'single beds' && room.singleBedCount ? `${room.singleBedCount}  ${bed}` :
                         bed}
                      </span>
                    </label>
                  ))}
                  {((bedSelectionErrors[room.instanceId] ?? internalBedSelectionErrors[room.instanceId]) &&
                    (!selectedBeds[room.instanceId] || selectedBeds[room.instanceId].trim() === '')) && (
                    <p className="text-sm text-red-500 mt-1">Please select a bed option</p>
                  )}
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-700">
                Bed type: {room.doubleBedCount > 0 && room.bedTypes[0] === 'large double bed'
                  ? `${room.doubleBedCount}  ${room.bedTypes[0]}`
                  : room.singleBedCount > 0 && room.bedTypes[0] === 'single beds'
                  ? `${room.singleBedCount}  ${room.bedTypes[0]}`
                  : room.bedTypes[0]}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default RoomBedSelection;
