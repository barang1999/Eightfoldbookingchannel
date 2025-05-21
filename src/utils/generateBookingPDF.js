import jsPDF from "jspdf";

/**
 * Generates a reservation confirmation PDF
 * @param {object} booking - Booking object with full details
 */
export async function generateBookingPDF(booking) {
  const doc = new jsPDF({ format: "a4" });
  const rooms = Array.isArray(booking.rooms) ? booking.rooms : [];
  const lineHeight = 7;
  let y = 20;

  const addLine = (label, value) => {
    doc.text(`${label}: ${value}`, 20, y);
    y += lineHeight;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const options = { day: "2-digit", month: "short", year: "numeric" };
    return new Date(dateStr).toLocaleDateString("en-US", options);
  };

  doc.setFontSize(16);
  doc.text("Booking Confirmation", 105, 10, null, null, "center");

  doc.setFillColor(165, 142, 99); // gold tone
  doc.rect(0, 20, 210, 10, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.text(booking.hotelName || "Your Hotel", 105, 27, null, null, "center");
  doc.setTextColor(0, 0, 0); // reset to black
  y = 35;

  if (booking.logo) {
    doc.addImage(booking.logo, "PNG", 160, 8, 35, 12);
  } // Positioned top right

  doc.setFontSize(12);

  // Guest Information Section Box
  doc.setDrawColor(220);
  doc.rect(15, y, 180, 45, 'S');
  if (booking.mapImage) {
    const convertImageToBase64 = (url) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          canvas.getContext("2d").drawImage(img, 0, 0);
          resolve(canvas.toDataURL("image/png"));
        };
        img.onerror = reject;
        img.src = url;
      });
    };

    try {
      const imgBase64 = await convertImageToBase64(booking.mapImage);
      doc.addImage(imgBase64, "PNG", 145, y + 8, 45, 34);
    } catch (err) {
      console.warn("Hotel image unavailable");
    }
  }
  doc.setFont("helvetica", "bold");
  doc.text("Guest Information", 20, y + 10);
  doc.setFont("helvetica", "normal");
  y += 20;
  addLine("Booking Ref", booking.referenceNumber || "N/A");
  addLine("Guest Name", booking.fullName || "Guest");
  addLine("Hotel", booking.hotelName || "Your Hotel");
  // y += 5;
  // Adjust y to exactly after Guest Info box (height 45)
  y += 5;

  // Stay Details Section Box (dynamic height)
  // Calculate dynamic height based on rooms
  const baseStayDetailsHeight = 40;
  const linesPerRoom = 5;
  const totalLines = rooms.length * linesPerRoom;
  const dynamicStayHeight = baseStayDetailsHeight + totalLines * lineHeight + 5;

  if (y + dynamicStayHeight > 275) { doc.addPage(); y = 20; }

  doc.setDrawColor(220);
  doc.rect(15, y, 180, dynamicStayHeight, 'S');
  doc.setFont("helvetica", "bold");
  doc.text("Stay Details", 20, y + 10);
  doc.setFont("helvetica", "normal");
  y += 20;
  doc.setFontSize(11);
  addLine("Check-in", formatDate(booking.checkIn));
  addLine("Check-out", formatDate(booking.checkOut));
  addLine("Nights", booking.nights || "N/A");

  rooms.forEach((room, index) => {
    if (y > 250) {
      doc.addPage();
      y = 20;
      doc.setFontSize(11);
    }
    doc.text(`Room ${index + 1}:`, 20, y); y += lineHeight;
    addLine("Type", room.roomType || "N/A");
    addLine("Bed", room.bedCountLabel || "N/A");
    const adults = room.capacity?.maxAdults || 0;
    const children = room.capacity?.maxChildren || 0;
    addLine("Guests", `${adults} adults, ${children} children`);
    const breakfastText = room.breakfastIncluded ? `Yes (${adults} guests)` : "No";
    addLine("Breakfast", breakfastText);
    y += 1;
  });

  y += 2;

  if (y + 38 > 287) { doc.addPage(); y = 20; }

  // Price Summary Section Box
  doc.setDrawColor(220);
  doc.rect(15, y, 180, 38, 'S');
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Price Summary", 20, y + 10);
  doc.setFont("helvetica", "normal");
  y += 15;

  const totalBaseRate = rooms.reduce((sum, r) => sum + (r.baseRate || 0), 0);
  const totalVAT = rooms.reduce((sum, r) => {
    const rate = r.baseRate || 0;
    const vat = r.vat || 10;
    return sum + (rate * vat / (100 + vat));
  }, 0);

  addLine("Total Base Rate (incl. VAT)", `$${totalBaseRate.toFixed(2)}`);
  addLine("Total VAT", `$${totalVAT.toFixed(2)}`);
  const totalBoxX = 20;
  const totalBoxWidth = 80;
  doc.setFillColor(245, 245, 245);
  doc.rect(totalBoxX, y - 2.5, totalBoxWidth, 9, 'F');
  doc.text(`Grand Total: $${totalBaseRate.toFixed(2)}`, totalBoxX + 2, y + 5);
  y += 2;

  if (y + 45 > 287) { doc.addPage(); y = 20; }

    y += 8;

  // Additional Notes + Hotel Policy in 2-column grid
  const boxHeight = 45;
  const leftColWidth = 90;
  const rightColWidth = 90;
  const leftColX = 15;
  const rightColX = leftColX + leftColWidth;
  doc.setDrawColor(220);
  doc.rect(leftColX, y, leftColWidth, boxHeight, 'S'); // Left column
  doc.rect(rightColX, y, rightColWidth, boxHeight, 'S');

  // Left: Additional Notes
  doc.setFont("helvetica", "bold");
  const leftTextStartY = y + 12;
  doc.text("Additional Notes", 20, leftTextStartY);
  doc.setFont("helvetica", "normal");
  doc.text(`Arrival Time: ${booking.estimatedArrivalTime || "N/A"}`, 20, leftTextStartY + 8);
  doc.text(`Special Request: ${booking.specialRequest || "None"}`, 20, leftTextStartY + 15);

  // Right: Hotel Policy
  const policy = booking.policy || {};
  const cancellation = policy.cancellationPolicy?.cancellationAllowed
    ? `Allowed (within ${policy.cancellationPolicy?.cancellationNoticeDays || 0} days)`
    : "Not allowed";
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  const policyX = rightColX + 5;
  const rightTextStartY = y + 8;
  doc.text("Hotel Policy", policyX, rightTextStartY);
  doc.setFont("helvetica", "normal");
  doc.text(`Check-in Time: ${policy.checkIn || "N/A"}`, policyX, rightTextStartY + 7);
  doc.text(`Check-out Time: ${policy.checkOut || "N/A"}`, policyX, rightTextStartY + 14);
  doc.text(`Cancellation Policy: ${cancellation}`, policyX, rightTextStartY + 21);
  doc.text("Payment Method: Pay upon arrival at the property", policyX, rightTextStartY + 28);
  // End of Hotel Policy box

  // Ensure QR+footer can fit after Additional Notes grid, only add page if absolutely needed
  y += boxHeight + 5;

  // Accepted Payments - moved outside policy box
  if (Array.isArray(policy.paymentMethods)) {
    const payments = policy.paymentMethods.join(", ");
    doc.text(`Accepted Payments: ${payments} (Currency: Khmer Riel or USD only)`, 20, y);
    y += 7;
  }

  const remainingContentHeight = 28 + 16 + 5; // QR + footer + buffer
  if (rooms.length > 1 && y + remainingContentHeight > 297) {
    doc.addPage();
    y = 20;
  }

  // QR code block moved after Additional Notes + Hotel Policy grid
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(booking.referenceNumber || "UNKNOWN")}`;
  try {
    const res = await fetch(qrUrl);
    const blob = await res.blob();
    const qrBase64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Scan QR for Booking Ref:", 20, y + 5);
    doc.addImage(qrBase64, "PNG", 20, y + 8, 20, 20);
    y += 28;

    // Always anchor footer near bottom of page 1
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text(`Address: ${booking.hotelAddress || ""}`, 105, y + 4, null, null, "center");
    doc.text(`Phone: ${booking.hotelPhone || ""} • Website: ${booking.hotelWebsite || ""}`, 105, y + 8, null, null, "center");

    return doc.save(`booking-${booking.referenceNumber || "unknown"}.pdf`);
  } catch (err) {
    doc.text("QR code unavailable", 20, y + 15);
  }
}