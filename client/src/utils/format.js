import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
dayjs.extend(timezone);

const formatIstDateTime = (value) =>
  dayjs(value).tz("Asia/Kolkata").format("DD MMM YYYY, hh:mm:ss A [IST]");

export { formatIstDateTime };
