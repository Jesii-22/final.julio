export default function ActionToast({
  message,
  type = "success",
  visible,
}) {
  if (!message) {
    return null;
  }

  const styles = {
    success:
      "border-emerald-200 bg-emerald-50 text-emerald-900",
    error:
      "border-red-200 bg-red-50 text-red-900",
    info:
      "border-blue-200 bg-blue-50 text-blue-900",
  };

  const icons = {
    success: "✓",
    error: "!",
    info: "i",
  };

  return (
    <div
      className={`pointer-events-none fixed inset-x-4 bottom-5 z-80 flex justify-center transition-all duration-300 ease-out md:inset-x-auto md:bottom-auto md:right-6 md:top-24 ${
        visible
          ? "translate-y-0 opacity-100 md:translate-x-0"
          : "translate-y-4 opacity-0 md:translate-x-4 md:translate-y-0"
      }`}
    >
      <div
        aria-live="polite"
        className={`flex w-full max-w-sm items-center gap-3 rounded-2xl border px-4 py-3 shadow-xl shadow-slate-950/15 ${styles[type]}`}
        role={type === "error" ? "alert" : "status"}
      >
        <span
          aria-hidden="true"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-lg font-bold shadow-sm"
        >
          {icons[type]}
        </span>

        <p className="text-sm font-semibold leading-5">
          {message}
        </p>
      </div>
    </div>
  );
}