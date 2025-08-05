export function isTimeOverlapping(start1, start2, duration1, duration2) {
  const toMinutes = (timeStr) => {
    const [h, m] = timeStr.split(":").map(Number);
    return h * 60 + m;
  };
  const s1 = toMinutes(start1);
  const s2 = toMinutes(start2);
  const e1 = s1 + Number(duration1) * 60;
  const e2 = s2 + Number(duration2) * 60;

  return Math.max(s1, s2) < Math.min(e1, e2);
}

