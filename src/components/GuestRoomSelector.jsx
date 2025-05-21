import React, { useState, useRef } from "react";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { useClickOutside } from "../hooks/useClickOutside";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { Minus, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";

const GuestRoomSelector = ({ onSubmit }) => {
  const { t } = useTranslation("translation");
  const [showPopup, setShowPopup] = useState(false);
  const [rooms, setRooms] = useState([{ adults: 1, children: 0, childrenAges: [] }]);
  useEffect(() => {
    const storedRooms = localStorage.getItem("guestRoomSelection");
    if (storedRooms) {
      try {
        const parsed = JSON.parse(storedRooms);
        if (Array.isArray(parsed)) {
          setRooms(parsed);
        }
      } catch (e) {
        console.warn("⚠️ Could not parse stored guestRoomSelection", e);
      }
    }
  }, []);
  const ref = useRef();
  useClickOutside(ref, () => setShowPopup(false));

  const updateRoom = (index, type, value) => {
    setRooms((prev) =>
      prev.map((room, i) =>
        i === index ? { ...room, [type]: value } : room
      )
    );
  };

  const addRoom = () => {
    setRooms([...rooms, { adults: 1, children: 0, childrenAges: [] }]);
  };

  const totalAdults = rooms.reduce((sum, r) => sum + r.adults, 0);
  const totalChildren = rooms.reduce((sum, r) => sum + r.children, 0);

  return (
    <div className="relative">
      <button
        onClick={() => setShowPopup((prev) => !prev)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl shadow-sm text-sm text-gray-700 "
      >
        <span>
          {`${rooms.length} ${t("actions.rooms", "Rooms")} - ${totalAdults} ${t("capacity.adults", "Adults")}`}
        </span>
      </button>

      {showPopup && (
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10}}
          className="absolute top-full mt-2 right-0 bg-white shadow-xl rounded-xl w-[420px] p-6 z-50"
        >
          {rooms.map((room, index) => (
            <div key={index} className="mb-4">
              {index > 0 && (
                <div
                  onClick={() => setRooms(rooms.filter((_, i) => i !== index))}
                  className="text-grey-600 text-sm font-medium cursor-pointer hover:underline text-right mb-2"
                >
                  Delete
                </div>
              )}
              <div className="text-xs text-gray-500 mb-2 font-semibold">{t("roomLabel", { index: index + 1, defaultValue: "ROOM {{index}}" })}</div>

              <div className="flex justify-between items-center mb-4">
                <span className="font-medium">{t("capacity.adults", "Adults")}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateRoom(index, "adults", Math.max(1, room.adults - 1))}
                    className="w-8 h-8 rounded-full border flex items-center justify-center text-gray-700"
                  >
                    <Minus size={16} />
                  </button>
                  <span>{room.adults}</span>
                  <button
                    onClick={() => updateRoom(index, "adults", room.adults + 1)}
                    className="w-8 h-8 rounded-full border flex items-center justify-center text-gray-700"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center mb-4">
                <div>
                  <span className="font-medium block">{t("capacity.children", "Children")}</span>
                  <span className="text-xs text-gray-400">{t("capacity.childAgeNote", "From 0 to 11 years")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const newChildren = Math.max(0, room.children - 1);
                      const newChildrenAges = room.childrenAges ? [...room.childrenAges] : [];
                      if (newChildrenAges.length > newChildren) {
                        newChildrenAges.splice(newChildren);
                      }
                      updateRoom(index, "childrenAges", newChildrenAges);
                      updateRoom(index, "children", newChildren);
                    }}
                    className="w-8 h-8 rounded-full border flex items-center justify-center text-gray-700"
                  >
                    <Minus size={16} />
                  </button>
                  <span>{room.children}</span>
                  <button
                    onClick={() => {
                      const newChildren = room.children + 1;
                      const newChildrenAges = room.childrenAges ? [...room.childrenAges] : [];
                      while (newChildrenAges.length < newChildren) {
                        newChildrenAges.push("");
                      }
                      updateRoom(index, "childrenAges", newChildrenAges);
                      updateRoom(index, "children", newChildren);
                    }}
                    className="w-8 h-8 rounded-full border flex items-center justify-center text-gray-700"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              {room.children > 0 && (
                <div className="space-y-2 mt-2">
                  {Array.from({ length: room.children }).map((_, childIdx) => (
                    <div key={childIdx} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{t("capacity.child", "Child")} {childIdx + 1} {t("capacity.age", "Age")}</span>
                      <select
                        value={room.childrenAges?.[childIdx] ?? ""}
                        onChange={(e) => {
                          const updatedAges = [...(room.childrenAges || [])];
                          updatedAges[childIdx] = parseInt(e.target.value);
                          updateRoom(index, "childrenAges", updatedAges);
                        }}
                        className="border rounded-md p-1 text-sm"
                      >
                        <option value="">{t("capacity.age", "Age")}</option>
                        {Array.from({ length: 12 }).map((_, age) => (
                          <option key={age} value={age}>{age}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          <div
            onClick={addRoom}
            className="text-grey-600 text-sm font-medium cursor-pointer hover:underline mb-4"
          >
            {t("actions.addRoom", "+ Add a room")}
          </div>
          <button
            onClick={() => {
              if (onSubmit) {
                const totalAdults = rooms.reduce((sum, r) => sum + r.adults, 0);
                const totalChildren = rooms.reduce((sum, r) => sum + r.children, 0);
                onSubmit(rooms);
                localStorage.setItem("guestRoomSelection", JSON.stringify(rooms));
                localStorage.setItem("numAdults", totalAdults);
                localStorage.setItem("numChildren", totalChildren);
                setShowPopup(false);
              }
            }}
            className="bg-[#a18b62] text-white font-medium w-full py-2 rounded-xl text-sm hover:bg-[#8a774f] active:bg-[#6f5f3d] transition-all duration-150"
          >
            {t("actions.submit", "Submit")}
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default GuestRoomSelector;