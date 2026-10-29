export function yearsBetween(date1:Date, date2: Date) {
  let years = date2.getFullYear() - date1.getFullYear();

  // Geburtstag/Jahrestag dieses Jahr noch nicht erreicht
  if (
    date2.getMonth() < date1.getMonth() ||
    (date2.getMonth() === date1.getMonth() &&
      date2.getDate() < date1.getDate())
  ) {
    years--;
  }

  return years;
}