export type HolidayRecord = {
  date: string;
  localName: string;
  name: string;
};

export async function getNationalHolidays(countryCode: string, year: number) {
  const response = await fetch(
    `https://date.nager.at/api/v3/PublicHolidays/${year}/${countryCode}`,
  );

  if (!response.ok) {
    throw new Error("Unable to load national holidays.");
  }

  const holidays = (await response.json()) as Array<{
    date: string;
    localName: string;
    name: string;
  }>;

  return holidays.map((holiday) => ({
    date: holiday.date,
    localName: holiday.localName,
    name: holiday.name,
  }));
}
