const months: string[] = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"];

export function getCompetitionDates(startDate: Date, endDate: Date): string {
    let startDay: number = startDate.getDate();
    let startMonth: number = startDate.getMonth();
    let startYear: number = startDate.getFullYear();
    let endDay: number = endDate.getDate();
    let endMonth: number = endDate.getMonth();
    let endYear: number = endDate.getFullYear();
    if (startDay === endDay && startMonth === endMonth && startYear === endYear) {
        return `il ${startDay} ${months[startMonth]} ${startYear} `;
    } else if (startMonth === endMonth && startYear === endYear) {
        return `dal ${startDay} al ${endDay} ${months[startMonth]} ${startYear} `;
    } else if (startYear === endYear) {
        return `dal ${startDay} ${months[startMonth]} al ${endDay} ${months[endMonth]} ${startYear} `;
    } else {
        return `dal ${startDay} ${months[startMonth]} ${startYear} al ${endDay} ${months[endMonth]} ${endYear} `;
    }
}