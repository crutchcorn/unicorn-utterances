import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export function formatDiscordCreated(date: Date): string {
    if (dayjs(date).isSame(dayjs(), 'day')) {
        return dayjs(date).format("[Today at] HH:mm A");
    }
    return dayjs(date).format("M/D/YY, HH:mm A");
}

export function formatDiscordTimestamp(timestamp: number, format: string): string {
    switch (format) {
        case "t":
            return dayjs.unix(timestamp).format("HH:mm A");
        case "T":
            return dayjs.unix(timestamp).format("HH:mm:ss A");
        case "d":
            return dayjs.unix(timestamp).format("M/D/YY");
        case "D":
            return dayjs.unix(timestamp).format("MMMM DD, YYYY");
        case "f":
            return dayjs.unix(timestamp).format("MMMM DD YYYY [at] HH:mm A");
        case "F":
            return dayjs.unix(timestamp).format("dddd, MMMM DD, YYYY [at] HH:mm A");
        case "R":
        default:
            return dayjs.unix(timestamp).fromNow();
    }
}