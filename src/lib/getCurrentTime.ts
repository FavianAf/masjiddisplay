export function getCurrentTime() {
    const now = new Date();
    const day = new Intl.DateTimeFormat('id-ID', {weekday: 'long'}).format(now);
    const month = new Intl.DateTimeFormat('id-ID', {month: 'long'}).format(now);
    const monthAngka = new Intl.DateTimeFormat('id-ID', {month: 'numeric'}).format(now);
    const date = new Intl.DateTimeFormat('id-ID', {day: 'numeric'}).format(now);
    const year = new Intl.DateTimeFormat('id-ID', {year: 'numeric'}).format(now);
    const hour = now.getHours().toString().padStart(2, '0');
    const minute = now.getMinutes().toString().padStart(2, '0');
    const second = now.getSeconds().toString().padStart(2, '0');


    return {
        day,
        month,
        monthAngka,
        date,
        year,
        hour,
        minute,
        second
    };
}