function Spinner({ label = "Loading...", tone = "accent" }) {
  const textColor = tone === "light" ? "text-white" : "text-reef";
  const borderColor =
    tone === "light"
      ? "border-white/30 border-t-white"
      : "border-reef/25 border-t-reef";

  return (
    <div className={`flex items-center gap-3 text-sm font-semibold ${textColor}`}>
      <span
        className={`h-5 w-5 animate-spin rounded-full border-2 ${borderColor}`}
      />
      <span>{label}</span>
    </div>
  );
}

export default Spinner;
