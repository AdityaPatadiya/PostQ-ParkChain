export const slotKeyFrom = (slotType, reservedFor) => {
  const key = `${slotType}_${reservedFor}`; // e.g., "compact_ev"
  return key;
};

export const getPricePerHour = (plot, slotType, reservedFor) => {
  if (!plot?.slots) return 0;
  const primaryKey = slotKeyFrom(slotType, reservedFor);
  const fallbackKey = slotKeyFrom(slotType, "general");
  const slot = plot.slots[primaryKey] || plot.slots[fallbackKey];
  return Number(slot?.price || 0);
};

export const calcTotalPriceINR = (plot, slotType, reservedFor, hours) => {
  const pph = getPricePerHour(plot, slotType, reservedFor);
  const h = Number(hours || 0);
  return Math.max(0, pph * h);
};
