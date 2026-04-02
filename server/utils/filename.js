const INVALID_FILENAME_CHARACTERS = /[<>:"/\\|?*\u0000-\u001F]/g;

const sanitizeDownloadName = (value, fallback = "recording") => {
  const sanitizedValue = String(value || "")
    .trim()
    .replace(INVALID_FILENAME_CHARACTERS, "_")
    .replace(/\.+$/g, "");

  return sanitizedValue || fallback;
};

const getUniqueZipFileName = (baseName, usedNames) => {
  const defaultName = `${baseName}.wav`;

  if (!usedNames.has(defaultName)) {
    usedNames.add(defaultName);
    return defaultName;
  }

  let counter = 1;
  let candidateName = `${baseName}_${counter}.wav`;

  while (usedNames.has(candidateName)) {
    counter += 1;
    candidateName = `${baseName}_${counter}.wav`;
  }

  usedNames.add(candidateName);
  return candidateName;
};

const buildAttachmentHeader = (filename) => {
  const fallbackName = filename.replace(/"/g, "");
  const encodedFileName = encodeURIComponent(filename);

  return `attachment; filename="${fallbackName}"; filename*=UTF-8''${encodedFileName}`;
};

module.exports = {
  buildAttachmentHeader,
  getUniqueZipFileName,
  sanitizeDownloadName
};
