import React from "react";
import { Dialog } from "@headlessui/react";
import { X } from "lucide-react";

const HotelPolicyModal = ({ isOpen, onClose, policy }) => {
  if (!policy) return null;

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed z-50 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm" aria-hidden="true" />

        <Dialog.Panel className="relative bg-white max-w-3xl w-full mx-auto rounded-lg shadow-xl z-50 p-6">
          <div className="flex justify-between items-start mb-4">
            <Dialog.Title className="text-2xl font-semibold text-gray-800">Hotel Policies</Dialog.Title>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={20} />
            </button>
          </div>

          <p className="text-sm text-gray-700 space-y-4 leading-relaxed">
            <strong>Check-In / Check-Out:</strong><br />
            Guests may check in from <strong>{policy.checkIn || "14:00"}</strong> and are kindly requested to check out by <strong>{policy.checkOut || "12:00"}</strong>.
            <br /><br />

            <strong>Cancellation Policy:</strong><br />
            Free cancellation is available up to <strong>{policy.cancellationPolicy?.cancellationNoticeDays || 0}</strong> day(s) before arrival.
            <br /><br />

            <strong>Children & Extra Beds:</strong><br />
            Children of all ages are welcome. Cribs are available for <strong>${policy.childrenAndBeds?.cribPrice || 0}</strong> and extra beds for <strong>${policy.childrenAndBeds?.extraBedPrice || 0}</strong> per night. A maximum of <strong>{policy.childrenAndBeds?.maxChildrenPerRoom || "N/A"}</strong> children are allowed per room.
            <br /><br />

            <strong>Damage Deposit & Pets:</strong><br />
            No damage deposit is required. <strong>Pets Policy:</strong> {!policy.petsPolicy || policy.petsPolicy.toLowerCase().includes("not allowed") || policy.petsPolicy.toLowerCase().includes("now allowed")
              ? "Unfortunately, pets are not allowed on the property, with the exception of certified service animals."
              : "Well-behaved pets are welcome at the property. Please inform us in advance to ensure a comfortable stay for all guests."}
            <br /><br />

            <strong>Internet & Parking:</strong><br />
            Complimentary Wi-Fi is available in all areas. Parking is provided on-site as <strong>{policy.parking?.isFree ? "free" : "paid"}</strong> {policy.parking?.type || "parking"} and does not require reservation.
            <br /><br />

            <strong>House Rules:</strong><br />
            Parties and events are not permitted. Quiet hours are {policy.quietHours?.enabled ? `enforced from ${policy.quietHours.start} to ${policy.quietHours.end}` : "not enforced"}, but guests are asked to maintain a peaceful environment.
            <br /><br />

            <strong>Smoking Policy:</strong><br />
            Smoking is {policy.smokingPolicy?.allowed ? "permitted in designated areas" : "not allowed in indoor areas"}.
            <br /><br />

            <strong>Payment & Tax:</strong><br />
            Accepted payment methods include: {(policy.paymentMethods || []).join(", ")}. VAT of <strong>{policy.vat?.percentage || 0}%</strong> is included in the total price.
          </p>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default HotelPolicyModal;