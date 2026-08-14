"use client";

import { useEffect, useState } from "react";

export default function useLocation() {
  const [location, setLocation] = useState<any>(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;

      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
      );

      const data = await res.json();

      setLocation(data.address);
    });
  }, []);

  return location;
}