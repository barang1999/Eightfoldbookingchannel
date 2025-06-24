import { useState, useEffect } from "react";
import { motion } from "framer-motion";
const SkeletonBlock = ({ className }) => (
  <motion.div
    className={`bg-gray-200 rounded ${className}`}
    initial={{ backgroundPosition: '100% 0' }}
    animate={{ backgroundPosition: '-100% 0' }}
    transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
    style={{
      backgroundImage: 'linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%)',
      backgroundSize: '200% 100%',
    }}
  />
);
import { useTranslation } from "react-i18next";
import i18n from "../i18n";
import { useCurrency } from "../contexts/CurrencyProvider";
import { formatCurrency } from "../utils/formatCurrency";
import { useSelectedDate } from "../contexts/SelectedDateContext";
import { useSelectedRooms } from "../contexts/SelectedRoomsContext";
import { BedDouble, Users } from "lucide-react";
import RoomDetailModal from "./RoomDetailModal";

const RoomCard = ({ room, propertyId, onAddRoom, loadingRate }) => {
  const isOverbooked = room?.netBooked > (room?.roomsToSell ?? 0);
  const isSoldOut = room?.unavailable || room?.availability === false || room?.roomsToSell === 0 || isOverbooked;
  // Debugging: inspect overbooked/sold out logic
  console.log("🛏️ Room:", room?.roomType);
  console.log("Rooms to Sell:", room?.roomsToSell);
  console.log("Net Booked:", room?.netBooked);
  console.log("Is Overbooked?", isOverbooked);
  console.log("Is Sold Out?", isSoldOut);
  // promoPrice, basePrice, isPromoBookable are defined below, so we add a dummy log here and another after they're declared
  
  const todayDate = new Date();
  const todayStr = todayDate.toISOString().split('T')[0];
  const bookableStartStr = typeof room.promotionBookableStartDate === "string"
    ? room.promotionBookableStartDate.split("T")[0]
    : null;
  const bookableEndStr = typeof room.promotionBookableEndDate === "string"
    ? room.promotionBookableEndDate.split("T")[0]
    : null;

  // Debug: verify date comparison values

  const today = new Date();
  const bookableEndDate = bookableEndStr ? new Date(bookableEndStr + "T23:59:59.999") : null;

  const isPromoBookable =
    (!bookableStartStr || todayStr >= bookableStartStr) &&
    (!bookableEndDate || today <= bookableEndDate);

  const promoPrice = room.promoWithBF ?? room.promotionPrice ?? null;

  const basePrice = room.basePriceWithBreakfast ?? room.originalPriceWithBreakfast ?? room.perNight ?? room.price ?? 0;


  // Show promo badge only if promo is active and price is strictly lower than base
  const hasPromotion =
    isPromoBookable &&
    promoPrice !== null &&
    promoPrice !== undefined &&
    promoPrice >= 0 &&
    promoPrice < basePrice;
  const displayPrice = hasPromotion ? promoPrice : basePrice;
  
  const { dateRange } = useSelectedDate();
  const { addRoom, selectedRooms } = useSelectedRooms();
  const { currency, exchangeRate } = useCurrency();
  const { t } = useTranslation();

  const selectedCount = selectedRooms.filter(
    (r) => r.roomId === room._id || r.id === room._id
  ).length;
  const atLimit = selectedCount >= (room.roomsToSell || 1);

  useEffect(() => {
    const savedLang = localStorage.getItem("language");
    if (savedLang && savedLang !== i18n.language) {
      i18n.changeLanguage(savedLang);
    }
  }, []);
  // startDate and endDate remain as "YYYY-MM-DD" strings
  const startDate = dateRange.startDate;
  const endDate = dateRange.endDate;
  const [open, setOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);


  // Calculate nights as the difference between endDate and startDate
  const nights = Math.max(
    1,
    Math.floor(
      (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)
    )
  );


  const originalPublicRate = room.originalPriceWithBreakfast ?? null;

  

  const perNight = room.perNight ?? displayPrice / nights;
  const totalStayPrice = perNight * nights;
  const discountPercent =
    hasPromotion && originalPublicRate > totalStayPrice
      ? Math.round(((originalPublicRate - totalStayPrice) / originalPublicRate) * 100)
      : 0;
  // Debug log for discount percent calculation



  const formatPrice = (price) => {
    return price ? price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00";
  };

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.3 }}
        className={`bg-white p-4 md:p-5 rounded-xl border border-gray-200 shadow-sm transition grid grid-cols-1 md:grid-cols-5 gap-4 ${isSoldOut ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'}`}
      >
        {/* Left: Image */}
        <div className="md:col-span-2 rounded-xl overflow-hidden">
          <div onClick={() => setOpen(true)} className="relative cursor-pointer overflow-hidden group rounded-xl">
            <img
              src={room.images?.[0] || "/default-room.jpg"}
              alt={room.roomType}
              className="w-full h-56 object-cover rounded-xl transition-transform duration-300 ease-in-out group-hover:scale-105"
            />
            {hasPromotion && originalPublicRate > promoPrice && (
              <div className="absolute top-2 right-2 bg-yellow-400 text-black text-[11px] font-semibold px-2 py-1 rounded shadow-md">
                -{discountPercent}%
              </div>
            )}
            {isSoldOut && (
              <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded shadow-md rotate-[-10deg]">
                Sold Out
              </div>
            )}
            <div className="absolute bottom-2 left-2 text-[11px] bg-black/40 text-white px-2 py-[1px] rounded-sm flex items-center gap-1 z-10">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false" className="w-4 h-4 fill-white">
                <path d="M20 3H7C6.45 3 6 3.45 6 4V18H20C20.55 18 21 17.55 21 17V4C21 3.45 20.55 3 20 3ZM19.5 16.5H7.5V4.5H19.5V16.5ZM4.5 7H4C3.45 7 3 7.45 3 8V20C3 20.55 3.45 21 4 21H16C16.55 21 17 20.55 17 20V19.5H4.5V7Z" />
              </svg>
              {room.images?.length || 0} image{room.images?.length > 1 ? "s" : ""}
            </div>
          </div>
        </div>

        {/* Right: Details */}
        <div className="md:col-span-3 flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-800">{t(`roomTypes.${room.roomType}`, { defaultValue: room.roomType })}</h3>
            <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
              <BedDouble size={16} />
              {room.doubleBedCount > 0 || room.singleBedCount > 0 ? (
                <span>
              {room.doubleBedCount > 0 && `${room.doubleBedCount} ${t("bedTypes.double", { defaultValue: "Double bed" })}`}
              {room.doubleBedCount > 0 && room.singleBedCount > 0 && (
                <span className="px-1 text-gray-400">
                  {room.requiresBedChoice ? t("bedTypes.or", { defaultValue: "or" }) : t("bedTypes.and", { defaultValue: "and" })}
                </span>
              )}
              {room.singleBedCount > 0 && `${room.singleBedCount} ${t("bedTypes.single", { defaultValue: "Single bed" })}`}
                </span>
              ) : null}
            </div>

            <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
              <Users size={16} />
              <span>
                {room.capacity?.maxAdults || 2} {t("capacity.adults", { defaultValue: "adults" })}
                {room.capacity?.maxChildren ? `, ${room.capacity.maxChildren} ${t("capacity.children", { defaultValue: room.capacity.maxChildren > 1 ? "children" : "child" })}` : ""} {t("max", { defaultValue: "max" })}
              </span>
              <span>• {room.surface}m²</span>
              {room.poolAccess && (
                <span>
                  • {t("viewOptions.pool_access", { defaultValue: "Pool Access" })}
                </span>
              )}
              {room.viewOptions?.[0] && (() => {
                const viewOption = room.viewOptions[0];
                const normalizedView = viewOption.toLowerCase().replace(/\s+/g, "_");
                const translated = t(`viewOptions.${normalizedView}`, { defaultValue: viewOption });
                return <span>• {translated}</span>;
              })()}
            </div>

            <div className="flex flex-wrap gap-1.5 mt-2 text-xs">
              {room.roomFeatures?.slice(0, 4).map((feat, i) => {
                return (
                  <span key={i} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md">
                    {t(`roomDetails.features.${feat}`, { defaultValue: feat })}
                  </span>
                );
              })}
              {room.bathroomFeatures?.slice(0, 1).map((b, i) => {
                return (
                  <span key={i} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md">
                    {t(`bathroomFeatures.items.${b}`, { defaultValue: b })}
                  </span>
                );
              })}
            </div>

            {room.roomsToSell <= 5 && room.roomsToSell > 0 && (
              <div className="text-xs text-red-600 font-medium mt-1">
                Only {room.roomsToSell} room{room.roomsToSell > 1 ? "s" : ""} left
              </div>
            )}

            <button
              onClick={() => setOpen(true)}
              className="inline-block mt-4 text-sm text-grey-700 font-medium underline underline-offset-2 hover:text-blue-900"
            >
              {t("actions.seeDetails", { defaultValue: "See the room details" })}
            </button>
          </div>

          {/* Price + CTA */}
          <div className="flex flex-col justify-between mt-3 items-end text-right">
            <div>
              <div className="text-xs font-medium text-gray-700 uppercase tracking-wide mb-1">
                {t("actions.specialOffer", { defaultValue: "Special Offer" })}
              </div>
              <div className="flex flex-col items-end gap-1 mb-1">
                <div>
                  <span className="inline-block text-[11px] font-medium text-emerald-700 border border-emerald-300 px-2 py-0.5 rounded-full shadow-sm">
                    {t("actions.breakfastIncluded", { defaultValue: "Breakfast Included" })}
                  </span>
                </div>
                <div>
                  <span className="inline-block text-[11px] font-medium text-[#A58E63] border border-[#A58E63] px-2 py-0.5 rounded-full shadow-sm">
                    No credit card required
                  </span>
                </div>
                {hasPromotion && (
                  <div>
                    <span className="inline-block text-[11px] font-medium text-red-700 border border-red-300 px-2 py-0.5 rounded-full shadow-sm">
                      {t("actions.promoRate", { defaultValue: "Promo Rate" })}
                    </span>
                  </div>
                )}
              </div>
              {loadingRate ? (
                <SkeletonBlock className="h-6 w-24 mb-1" />
              ) : (
                <div className="text-xl font-semibold text-primary">
                  {formatCurrency(totalStayPrice, exchangeRate, currency)}
                </div>
              )}
              {loadingRate ? (
                <SkeletonBlock className="h-4 w-32" />
              ) : (
                <div className="text-xs text-gray-500">
                  {i18n.language === "ch"
                    ? `${t("perNight", { defaultValue: "每晚" })} ${formatCurrency(perNight, exchangeRate, currency)}`
                    : `(${formatCurrency(perNight, exchangeRate, currency)} ${t("perNight", { defaultValue: "/ night" })})`}
                </div>
              )}
              {hasPromotion && originalPublicRate > displayPrice && (
                <div className="text-xs text-gray-400 line-through">
                  {t("Public rate from {{value}}", { value: formatCurrency(originalPublicRate, exchangeRate, currency) })}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium">{t("actions.rooms", { defaultValue: "Rooms:" })}</span>
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-2 py-1 text-gray-700 hover:text-primary">−</button>
              <button
                onClick={() => setQuantity(prev => Math.min(prev + 1, (room.roomsToSell || 1) - selectedCount))}
                disabled={quantity + selectedCount >= (room.roomsToSell || 1)}
                className={`px-2 py-1 text-gray-700 hover:text-primary ${
                  quantity + selectedCount >= (room.roomsToSell || 1) ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                +
              </button>
              <span className="text-sm">{quantity}</span>
            </div>
            <button
              onClick={() => {
                if (!isSoldOut) {
                  const selectedRoomData = {
                    id: room._id,
                    roomId: room._id,
                    propertyId, // ✅ ensure it's included for rateRefresher.js
                    name: room.roomType,
                    roomName: room.roomType,
                    // Ensure roomType is always set, fallback to other fields or "standard"
                    roomType: room.roomType || room.name || room.roomName || "standard",
                    guests: `${room.capacity?.maxAdults || 2} adults${room.capacity?.maxChildren ? `, ${room.capacity.maxChildren} child${room.capacity.maxChildren > 1 ? "ren" : ""}` : ''}`,
                    startDate: startDate,
                    endDate: endDate,
                    breakfastIncluded: true,
                    price: totalStayPrice,
                    perNight: room.perNight ?? (displayPrice / nights),
                    nights,
                    vat: totalStayPrice * 0.1,
                    image: room.images?.[0] || "/default-room.jpg",
                    images: room.images || [],
                    unavailable: false,
                    maxAdults: room.capacity?.maxAdults || 2,
                    maxChildren: room.capacity?.maxChildren || 0,
                  };
                  for (let i = 0; i < quantity; i++) {
                    const instanceId = `${room._id}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
                    addRoom({ ...selectedRoomData, instanceId });
                  }
                }
              }}
              disabled={isSoldOut || atLimit}
              className={`px-4 py-2 w-fit self-end rounded-full text-sm transition ${
                isSoldOut || atLimit
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-primary text-white hover:opacity-90"
              }`}
            >
              {isSoldOut || atLimit
                ? t("actions.soldOut", { defaultValue: "Sold Out" })
                : t("actions.chooseRoom", { defaultValue: "Choose this room" })}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Modal */}
      {open && <RoomDetailModal room={room} onClose={() => setOpen(false)} />}
    </>
  );
};

export default RoomCard;