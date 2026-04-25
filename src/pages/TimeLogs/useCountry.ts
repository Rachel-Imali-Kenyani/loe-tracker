import { useEffect, useState } from "react";
import { getUserCountry } from "../../services/settings";

export function useCountry(userId: string | null) {
  const [country, setCountry] = useState<string>("");
  const [countryError, setCountryError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      return;
    }

    const loadCountry = async () => {
      try {
        const userCountry = await getUserCountry(userId);
        setCountry(userCountry ?? "");
      } catch (error) {
        setCountryError(
          error instanceof Error
            ? error.message
            : "Unable to load country preference.",
        );
      }
    };

    void loadCountry();
  }, [userId]);

  return { country, countryError };
}
