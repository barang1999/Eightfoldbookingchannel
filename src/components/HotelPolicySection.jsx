import React, { useEffect, useState } from 'react';

// Reusable key-value line display
const PolicyItem = ({ title, content }) => (
  <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 space-y-2">
    <h3 className="text-lg text-[#8a6b41] font-serif">{title}</h3>
    <p className="text-sm text-gray-700">{content}</p>
  </div>
);

// HotelPolicySection: displays hotel policies in a clean 2-column layout
const HotelPolicySection = ({ propertyId }) => {
  const [policy, setPolicy] = useState(null);

  // Fetch hotel policy data from backend
  useEffect(() => {
    if (!propertyId) return;

    const fetchPolicy = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_ADMIN_API_URL}/api/policy/${propertyId}`);
        const data = await res.json();
        setPolicy(data);
      } catch (err) {
        console.error("❌ Failed to fetch hotel policy:", err);
      }
    };

    fetchPolicy();
  }, [propertyId]);

  if (!policy) return null;

  return (
    <section className="py-12 ">
      <h2 className="text-3xl font-serif text-center mb-12 text-[#8a6b41]">Hotel Policies</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-5xl mx-auto px-6">
        <PolicyItem title="Check-in / Check-out" content={`Check-in: ${policy.checkIn || 'N/A'}, Check-out: ${policy.checkOut || 'N/A'}`} />
        <PolicyItem
          title="Cancellation"
          content={
            policy.cancellationPolicy?.cancellationAllowed
              ? `Cancellations are permitted with a minimum notice of ${policy.cancellationPolicy.cancellationNoticeDays} days.`
              : 'Cancellations are not permitted.'
          }
        />
        <PolicyItem
          title="Children & Beds"
          content={`Children are ${policy.childrenAndBeds?.childrenAllowed ? 'welcome' : 'not permitted'}. Cribs available at $${policy.childrenAndBeds?.cribPrice}, extra beds at $${policy.childrenAndBeds?.extraBedPrice}.`}
        />
        <PolicyItem title="Pets" content={policy.petsPolicy || 'Pets are not permitted.'} />
        <PolicyItem
          title="Age Restriction"
          content={
            policy.ageRestriction?.required
              ? `Minimum age requirement is ${policy.ageRestriction.minimumAge} years.`
              : 'No age restrictions apply.'
          }
        />
        <PolicyItem
          title="Smoking"
          content={
            policy.smokingPolicy?.allowed
              ? 'Smoking is permitted in designated areas.'
              : `Smoking is not permitted. ${policy.smokingPolicy?.notes || ''}`
          }
        />
        <PolicyItem
          title="Damage Deposit"
          content={
            policy.damageDeposit?.required
              ? `A damage deposit of $${policy.damageDeposit.amount} is required. Refundable via ${policy.damageDeposit.refundMethod}.`
              : 'No damage deposit is required.'
          }
        />
        <PolicyItem
          title="Quiet Hours"
          content={
            policy.quietHours?.enabled
              ? `Quiet hours are observed from ${policy.quietHours.start} to ${policy.quietHours.end}.`
              : 'No quiet hours are enforced.'
          }
        />
        <PolicyItem
          title="Parties"
          content={
            policy.partyPolicy?.allowed
              ? 'Events and parties are allowed on the premises.'
              : `Events and parties are not allowed. ${policy.partyPolicy?.notes || ''}`
          }
        />
        <PolicyItem
          title="Internet"
          content={
            policy.internet?.available
              ? `Internet is available in ${policy.internet.coverage}, and is ${policy.internet.isFree ? 'complimentary' : 'subject to additional charges'}.`
              : 'Internet access is not available.'
          }
        />
        <PolicyItem
          title="Parking"
          content={
            policy.parking?.available
              ? `${policy.parking.type.charAt(0).toUpperCase() + policy.parking.type.slice(1)} parking is available${policy.parking.requiresReservation ? ', and reservation is required' : ''}. ${policy.parking.isFree ? ' Complimentary for all guests.' : ''}`
              : 'No parking is available on the premises.'
          }
        />
        <PolicyItem
          title="Payment Methods"
          content={
            policy.paymentMethods?.length
              ? `We accept the following payment methods: ${policy.paymentMethods.join(', ')}.`
              : 'No payment methods specified.'
          }
        />
        <PolicyItem
          title="VAT"
          content={
            policy.vat?.enabled
              ? `All rooms fee include VAT at ${policy.vat.percentage}%.`
              : 'VAT is not applied to our pricing.'
          }
        />
      </div>
    </section>
  );
};

export default HotelPolicySection;