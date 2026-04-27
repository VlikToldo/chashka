import Discount from "../../models/Discount.js";

const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

function isDiscountActiveNow(discount) {
  if (!discount.enabled) return false;
  if (!discount.schedule || discount.schedule.length === 0)
    return discount.enabled;

  const offsetMs = (discount.utcOffset ?? 0) * 60 * 60 * 1000;
  const local = new Date(Date.now() + offsetMs);
  const localDay = DAY_KEYS[local.getUTCDay()];
  const localH = local.getUTCHours().toString().padStart(2, "0");
  const localM = local.getUTCMinutes().toString().padStart(2, "0");
  const localTime = `${localH}:${localM}`;

  return discount.schedule.some((slot) => {
    if (!slot.days.includes(localDay)) return false;
    return localTime >= slot.startTime && localTime <= slot.endTime;
  });
}

export async function getActiveDiscounts(_req, res) {
  const all = await Discount.find({ enabled: true });
  const active = all.filter(isDiscountActiveNow);

  // Flatten to a map: itemId → discountPrice
  const result = {};
  for (const d of active) {
    for (const entry of d.items) {
      result[entry.itemId.toString()] = entry.discountPrice;
    }
  }
  res.json(result);
}
