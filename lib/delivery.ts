export const DELIVERY_ZONES = {
  beirut: { label: "Within Beirut", fee: 3 },
  outside: { label: "Outside Beirut", fee: 5 },
} as const;

export type DeliveryZone = keyof typeof DELIVERY_ZONES;
