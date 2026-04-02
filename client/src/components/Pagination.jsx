function Pagination({ page, totalPages, onPageChange }) {
  return (
    <div className="flex flex-col gap-3 border-t border-ink/10 px-6 py-4 text-sm text-ink/70 sm:flex-row sm:items-center sm:justify-between">
      <p>
        Page {page} of {totalPages}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="rounded-full border border-ink/15 px-4 py-2 font-semibold text-ink transition hover:border-reef hover:text-reef disabled:cursor-not-allowed disabled:opacity-45"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="rounded-full border border-ink/15 px-4 py-2 font-semibold text-ink transition hover:border-reef hover:text-reef disabled:cursor-not-allowed disabled:opacity-45"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default Pagination;
