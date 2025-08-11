import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase.js";
import { isTimeOverlapping } from "./overlapCheck";

export async function getAvailablePlots(date, time, duration) {
  const plotSnapshot = await getDocs(collection(db, "parkingPlots"));
  const availablePlots = [];

  for (const plotDoc of plotSnapshot.docs) {
    const plot = plotDoc.data();
    const bookingsSnapshot = await getDocs(
      query(
        collection(db, "bookings"),
        where("plotId", "==", plotDoc.id),
        where("date", "==", date)
      )
    );

    let slotsUsed = {};
    bookingsSnapshot.forEach((doc) => {
      const b = doc.data();
      if (isTimeOverlapping(b.time, time, b.duration, duration)) {
        const key = `${b.slotType}_${b.reservedFor}`;
        slotsUsed[key] = (slotsUsed[key] || 0) + 1;
      }
    });

    const hasAvailableSlot = Object.entries(plot.slots).some(([type, slot]) => {
      return ["general", "ev", "vip", "handicap"].some((res) => {
        const key = `${type}_${res}`;
        const total =
          (plot.reserved?.[res]?.count || 0) +
          (plot.slots?.[type]?.count || 0);
        return (slotsUsed[key] || 0) < total;
      });
    });

    if (hasAvailableSlot) availablePlots.push({ id: plotDoc.id, ...plot });
  }

  return availablePlots;
}
