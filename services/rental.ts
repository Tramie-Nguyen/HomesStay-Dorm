import { RentalData } from "@/types/rental";

export const getRentalDetail = async (
  id: string,
): Promise<RentalData | null> => {
  try {
    const res = await fetch(`/api/rental/${id}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      return null;
    }

    const json = await res.json();

    return {
      ...json,
      GIUONGS: Array.isArray(json?.GIUONGS) ? json.GIUONGS : [],
    };
  } catch (error) {
    console.error("Fetch rental detail error:", error);
    return null;
  }
};
