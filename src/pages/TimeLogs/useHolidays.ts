import { useEffect, useState } from "react";
import {
  getNationalHolidays,
  type HolidayRecord,
} from "../../services/holidays";

export function useHolidays(country: string, year: number) {
  const [holidayDates, setHolidayDates] = useState<HolidayRecord[]>([]);
  const [holidayError, setHolidayError] = useState<string | null>(null);
  const [holidayAutoFilled, setHolidayAutoFilled] = useState(false);

  useEffect(() => {
    if (!country) {
      return;
    }

    const loadHolidays = async () => {
      try {
        setHolidayError(null);
        setHolidayAutoFilled(false);
        const holidays = await getNationalHolidays(country, year);
        setHolidayDates(holidays);
      } catch (error) {
        setHolidayDates([]);
        setHolidayError(
          error instanceof Error
            ? error.message
            : "Unable to load national holidays.",
        );
      }
    };

    void loadHolidays();
  }, [country, year]);

  return {
    holidayDates,
    holidayError,
    holidayAutoFilled,
    setHolidayAutoFilled,
  };
}
