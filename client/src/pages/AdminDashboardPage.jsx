import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api/client";
import Pagination from "../components/Pagination";
import Spinner from "../components/Spinner";
import { clearAdminToken } from "../utils/auth";
import { downloadBlob, sanitizeClientFileName } from "../utils/files";
import { formatIstDateTime } from "../utils/format";

const PAGE_SIZE = 10;

const getFriendlyErrorMessage = (error, fallbackMessage) =>
  error.response?.data?.message || fallbackMessage;

function AdminDashboardPage() {
  const navigate = useNavigate();

  const [recordings, setRecordings] = useState([]);
  const [uploaderOptions, setUploaderOptions] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 1
  });
  const [page, setPage] = useState(1);
  const [filterInputs, setFilterInputs] = useState({
    search: "",
    uploadedBy: "",
    fromDate: "",
    toDate: ""
  });
  const [appliedFilters, setAppliedFilters] = useState({
    search: "",
    uploadedBy: "",
    fromDate: "",
    toDate: ""
  });
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isZipDownloading, setIsZipDownloading] = useState(false);
  const [downloadingId, setDownloadingId] = useState("");

  useEffect(() => {
    const fetchUploaderOptions = async () => {
      try {
        const response = await api.get("/api/admin/users", {
          authRole: "admin"
        });

        setUploaderOptions(response.data.users || []);
      } catch (error) {
        setErrorMessage(
          getFriendlyErrorMessage(
            error,
            "We could not load the uploader filter options."
          )
        );
      }
    };

    fetchUploaderOptions();
  }, []);

  useEffect(() => {
    const fetchRecordings = async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const response = await api.get("/api/admin/recordings", {
          authRole: "admin",
          params: {
            page,
            limit: PAGE_SIZE,
            search: appliedFilters.search || undefined,
            uploadedBy: appliedFilters.uploadedBy || undefined,
            fromDate: appliedFilters.fromDate || undefined,
            toDate: appliedFilters.toDate || undefined
          }
        });

        setRecordings(response.data.recordings || []);
        setPagination(response.data.pagination);
      } catch (error) {
        setErrorMessage(
          getFriendlyErrorMessage(
            error,
            "We could not load recordings right now."
          )
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecordings();
  }, [appliedFilters, page]);

  const visibleIds = recordings.map((recording) => recording._id);
  const selectedCount = selectedIds.size;
  const areAllVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selectedIds.has(id));

  const handleFilterInputChange = (event) => {
    const { name, value } = event.target;

    setFilterInputs((current) => ({
      ...current,
      [name]: value
    }));
  };

  const handleApplyFilters = () => {
    if (
      filterInputs.fromDate &&
      filterInputs.toDate &&
      filterInputs.fromDate > filterInputs.toDate
    ) {
      setErrorMessage("From Date cannot be later than To Date.");
      return;
    }

    setErrorMessage("");
    setSelectedIds(new Set());
    setPage(1);
    setAppliedFilters({
      search: filterInputs.search.trim(),
      uploadedBy: filterInputs.uploadedBy,
      fromDate: filterInputs.fromDate,
      toDate: filterInputs.toDate
    });
  };

  const handleResetFilters = () => {
    setFilterInputs({
      search: "",
      uploadedBy: "",
      fromDate: "",
      toDate: ""
    });
    setAppliedFilters({
      search: "",
      uploadedBy: "",
      fromDate: "",
      toDate: ""
    });
    setSelectedIds(new Set());
    setErrorMessage("");
    setPage(1);
  };

  const handleToggleRecording = (recordingId) => {
    setSelectedIds((current) => {
      const nextSelection = new Set(current);

      if (nextSelection.has(recordingId)) {
        nextSelection.delete(recordingId);
      } else {
        nextSelection.add(recordingId);
      }

      return nextSelection;
    });
  };

  const handleToggleVisibleSelection = () => {
    setSelectedIds((current) => {
      const nextSelection = new Set(current);

      if (areAllVisibleSelected) {
        visibleIds.forEach((id) => nextSelection.delete(id));
      } else {
        visibleIds.forEach((id) => nextSelection.add(id));
      }

      return nextSelection;
    });
  };

  const handleDownloadRecording = async (recording) => {
    try {
      setDownloadingId(recording._id);

      const response = await api.get(
        `/api/admin/recordings/${recording._id}/download`,
        {
          authRole: "admin",
          responseType: "blob"
        }
      );

      downloadBlob(
        response.data,
        `${sanitizeClientFileName(recording.name)}.wav`
      );
    } catch (error) {
      setErrorMessage(
        getFriendlyErrorMessage(
          error,
          "We could not download this recording right now."
        )
      );
    } finally {
      setDownloadingId("");
    }
  };

  const handleDownloadSelected = async () => {
    if (selectedIds.size === 0) {
      return;
    }

    try {
      setIsZipDownloading(true);
      setErrorMessage("");

      const response = await api.post(
        "/api/admin/download-zip",
        { ids: Array.from(selectedIds) },
        {
          authRole: "admin",
          responseType: "blob"
        }
      );

      downloadBlob(response.data, "recordings.zip");
    } catch (error) {
      setErrorMessage(
        getFriendlyErrorMessage(
          error,
          "We could not download the selected ZIP right now."
        )
      );
    } finally {
      setIsZipDownloading(false);
    }
  };

  const handleLogout = () => {
    clearAdminToken();
    navigate("/admin/login", { replace: true });
  };

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-[2rem] border border-white/80 bg-white/80 px-6 py-5 shadow-panel backdrop-blur">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-display text-sm font-semibold uppercase tracking-[0.28em] text-reef/80">
                Secure Workspace
              </p>
              <h1 className="mt-2 font-display text-3xl font-bold text-ink">
                Admin Dashboard
              </h1>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full border border-ink/15 px-5 py-2.5 font-semibold text-ink transition hover:border-ember hover:text-ember"
            >
              Logout
            </button>
          </div>
        </header>

        <section className="rounded-[2rem] border border-ink/10 bg-white/85 p-6 shadow-panel backdrop-blur">
          <div className="grid gap-4 xl:grid-cols-[1.7fr_1.2fr_1fr_1fr_auto_auto]">
            <div>
              <label
                htmlFor="search"
                className="mb-2 block text-sm font-semibold text-ink"
              >
                Search by Name
              </label>
              <input
                id="search"
                name="search"
                type="text"
                value={filterInputs.search}
                onChange={handleFilterInputChange}
                placeholder="Type a speaker name"
                className="w-full rounded-2xl border border-ink/15 bg-mist/80 px-4 py-3 text-base text-ink outline-none transition focus:border-reef focus:ring-4 focus:ring-reef/10"
              />
            </div>

            <div>
              <label
                htmlFor="uploadedBy"
                className="mb-2 block text-sm font-semibold text-ink"
              >
                Filter by Uploaded By
              </label>
              <select
                id="uploadedBy"
                name="uploadedBy"
                value={filterInputs.uploadedBy}
                onChange={handleFilterInputChange}
                className="w-full rounded-2xl border border-ink/15 bg-mist/80 px-4 py-3 text-base text-ink outline-none transition focus:border-reef focus:ring-4 focus:ring-reef/10"
              >
                <option value="">All Users</option>
                {uploaderOptions.map((username) => (
                  <option key={username} value={username}>
                    {username}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="fromDate"
                className="mb-2 block text-sm font-semibold text-ink"
              >
                From Date
              </label>
              <input
                id="fromDate"
                name="fromDate"
                type="date"
                value={filterInputs.fromDate}
                onChange={handleFilterInputChange}
                className="w-full rounded-2xl border border-ink/15 bg-mist/80 px-4 py-3 text-base text-ink outline-none transition focus:border-reef focus:ring-4 focus:ring-reef/10"
              />
            </div>

            <div>
              <label
                htmlFor="toDate"
                className="mb-2 block text-sm font-semibold text-ink"
              >
                To Date
              </label>
              <input
                id="toDate"
                name="toDate"
                type="date"
                value={filterInputs.toDate}
                onChange={handleFilterInputChange}
                className="w-full rounded-2xl border border-ink/15 bg-mist/80 px-4 py-3 text-base text-ink outline-none transition focus:border-reef focus:ring-4 focus:ring-reef/10"
              />
            </div>

            <button
              type="button"
              onClick={handleApplyFilters}
              className="self-end rounded-2xl bg-ink px-5 py-3 font-semibold text-white transition hover:bg-reef"
            >
              Apply Filters
            </button>

            <button
              type="button"
              onClick={handleResetFilters}
              className="self-end rounded-2xl border border-ink/15 px-5 py-3 font-semibold text-ink transition hover:border-reef hover:text-reef"
            >
              Clear Filters
            </button>
          </div>
        </section>

        <section className="overflow-hidden rounded-[2rem] border border-ink/10 bg-white/90 shadow-panel backdrop-blur">
          <div className="flex flex-col gap-4 border-b border-ink/10 px-6 py-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-display text-xl font-bold text-ink">
                Recordings
              </p>
              <p className="mt-1 text-sm text-ink/70">
                {selectedCount} of {pagination.total} recordings selected
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleToggleVisibleSelection}
                disabled={visibleIds.length === 0}
                className="rounded-full border border-ink/15 px-5 py-2.5 font-semibold text-ink transition hover:border-reef hover:text-reef disabled:cursor-not-allowed disabled:opacity-45"
              >
                {areAllVisibleSelected ? "Clear Visible" : "Select Visible"}
              </button>
              <button
                type="button"
                onClick={handleDownloadSelected}
                disabled={selectedCount === 0 || isZipDownloading}
                className="rounded-full bg-reef px-5 py-2.5 font-semibold text-white transition hover:bg-ink disabled:cursor-not-allowed disabled:opacity-45"
              >
                {isZipDownloading ? "Preparing ZIP..." : "Download Selected as ZIP"}
              </button>
            </div>
          </div>

          {errorMessage ? (
            <div className="border-b border-ember/10 bg-ember/10 px-6 py-4 text-sm font-medium text-ember">
              {errorMessage}
            </div>
          ) : null}

          {isLoading ? (
            <div className="px-6 py-10">
              <Spinner label="Loading recordings..." />
            </div>
          ) : recordings.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <p className="font-display text-2xl font-bold text-ink">
                No recordings found
              </p>
              <p className="mt-3 text-base text-ink/70">
                Try adjusting the active filters to find matching uploads.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full border-separate border-spacing-0">
                  <thead>
                    <tr className="bg-mist/80 text-left text-sm uppercase tracking-[0.18em] text-ink/65">
                      <th className="px-4 py-4">Sr. No.</th>
                      <th className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={areAllVisibleSelected}
                          onChange={handleToggleVisibleSelection}
                          className="h-4 w-4 rounded border-ink/20 text-reef focus:ring-reef"
                        />
                      </th>
                      <th className="px-4 py-4">Name</th>
                      <th className="px-4 py-4">Uploaded By</th>
                      <th className="px-4 py-4">Original File</th>
                      <th className="px-4 py-4">Uploaded At</th>
                      <th className="px-4 py-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recordings.map((recording, index) => (
                      <tr
                        key={recording._id}
                        className="border-t border-ink/10 text-sm text-ink"
                      >
                        <td className="px-4 py-4 align-top font-semibold text-ink/70">
                          {(pagination.page - 1) * pagination.limit + index + 1}
                        </td>
                        <td className="px-4 py-4 align-top">
                          <input
                            type="checkbox"
                            checked={selectedIds.has(recording._id)}
                            onChange={() => handleToggleRecording(recording._id)}
                            className="mt-1 h-4 w-4 rounded border-ink/20 text-reef focus:ring-reef"
                          />
                        </td>
                        <td className="px-4 py-4 align-top font-semibold">
                          {recording.name}
                        </td>
                        <td className="px-4 py-4 align-top text-ink/75">
                          {recording.uploadedBy}
                        </td>
                        <td className="px-4 py-4 align-top text-ink/75">
                          {recording.originalFileName}
                        </td>
                        <td className="px-4 py-4 align-top text-ink/75">
                          {formatIstDateTime(recording.uploadedAt)}
                        </td>
                        <td className="px-4 py-4 align-top">
                          <button
                            type="button"
                            onClick={() => handleDownloadRecording(recording)}
                            disabled={downloadingId === recording._id}
                            className="rounded-full border border-reef/20 bg-reef/10 px-4 py-2 font-semibold text-reef transition hover:border-reef hover:bg-reef hover:text-white disabled:cursor-not-allowed disabled:opacity-45"
                          >
                            {downloadingId === recording._id
                              ? "Downloading..."
                              : "Download"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Pagination
                page={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={setPage}
              />
            </>
          )}
        </section>
      </div>
    </main>
  );
}

export default AdminDashboardPage;
