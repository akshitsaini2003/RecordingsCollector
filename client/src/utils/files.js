const INVALID_FILENAME_CHARACTERS = /[<>:"/\\|?*\u0000-\u001F]/g;

const sanitizeClientFileName = (value, fallback = "recording") => {
  const sanitizedValue = String(value || "")
    .trim()
    .replace(INVALID_FILENAME_CHARACTERS, "_")
    .replace(/\.+$/g, "");

  return sanitizedValue || fallback;
};

const downloadBlob = (blob, fileName) => {
  const objectUrl = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = objectUrl;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  window.setTimeout(() => {
    window.URL.revokeObjectURL(objectUrl);
  }, 100);
};

export { downloadBlob, sanitizeClientFileName };
