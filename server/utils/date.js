const dayjs = require("dayjs");
const customParseFormat = require("dayjs/plugin/customParseFormat");
const timezone = require("dayjs/plugin/timezone");
const utc = require("dayjs/plugin/utc");

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

const IST_TIMEZONE = "Asia/Kolkata";

const getUtcBoundaryFromIstDate = (dateString, endOfDay = false) => {
  if (!dateString) {
    return null;
  }

  const parsedDate = dayjs.tz(dateString, "YYYY-MM-DD", IST_TIMEZONE);

  if (!parsedDate.isValid()) {
    return null;
  }

  return (endOfDay ? parsedDate.endOf("day") : parsedDate.startOf("day"))
    .utc()
    .toDate();
};

module.exports = {
  dayjs,
  IST_TIMEZONE,
  getUtcBoundaryFromIstDate
};
