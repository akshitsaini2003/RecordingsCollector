import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api/client";
import Spinner from "../components/Spinner";
import { clearUserSession, getStoredUser } from "../utils/auth";

const getFriendlyErrorMessage = (error, fallbackMessage) =>
  error.response?.data?.message || fallbackMessage;

function UploadPage() {
  const currentUser = getStoredUser();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    if (!name.trim()) {
      setErrorMessage("Please enter your name.");
      return;
    }

    if (!selectedFile) {
      setErrorMessage("Please choose a WAV file to upload.");
      return;
    }

    if (!selectedFile.name.toLowerCase().endsWith(".wav")) {
      setErrorMessage("Only WAV audio files are supported.");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("file", selectedFile);

    try {
      setIsSubmitting(true);
      const response = await api.post("/api/upload", formData, {
        authRole: "user"
      });

      setSuccessMessage(
        response.data?.message || "Recording submitted successfully!"
      );
      setName("");
      setSelectedFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      setErrorMessage(
        getFriendlyErrorMessage(
          error,
          "We could not submit your recording right now. Please try again."
        )
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    clearUserSession();
    navigate("/login", { replace: true });
  };

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="rounded-[2rem] border border-white/80 bg-white/80 px-6 py-5 shadow-panel backdrop-blur">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-display text-sm font-semibold uppercase tracking-[0.28em] text-reef/80">
                Recording Portal
              </p>
              <h1 className="mt-2 font-display text-3xl font-bold text-ink">
                Submit a Recording
              </h1>
            </div>

            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
              <p className="text-sm font-semibold text-ink/75">
                Hello, {currentUser?.username || "User"}
              </p>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full border border-ink/15 px-5 py-2.5 font-semibold text-ink transition hover:border-ember hover:text-ember"
              >
                Logout
              </button>
            </div>
          </div>
        </header>


        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          {/* <section className="rounded-[2rem] border border-white/70 bg-white/60 p-8 shadow-panel backdrop-blur xl:p-10">
            <div className="max-w-xl">
              <p className="font-display text-sm font-semibold uppercase tracking-[0.28em] text-reef/80">
                Authenticated Uploads
              </p>
              <h2 className="mt-4 font-display text-4xl font-bold leading-tight text-ink sm:text-5xl">
                Keep speaker names separate from uploader accounts.
              </h2>
              <p className="mt-4 text-lg leading-8 text-ink/75">
                Your account identifies who uploaded the file, while the form
                below still captures the recording subject's name exactly as
                needed for admin review and download naming.
              </p>
            </div>
          </section> */}

          <section className="rounded-[2rem] border border-ink/10 bg-white/80 p-8 shadow-panel backdrop-blur xl:p-10">
            <div className="mb-8">
              <h2 className="font-display text-2xl font-bold text-ink">
                Upload WAV File
              </h2>
              <p className="mt-2 text-base text-ink/70">
                Please use a WAV file. The server records upload time and your
                logged-in username automatically.
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-semibold text-ink"
                >
                  Your Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Enter the speaker name"
                  disabled={isSubmitting}
                  className="w-full rounded-2xl border border-ink/15 bg-mist/80 px-4 py-3 text-base text-ink outline-none transition focus:border-reef focus:ring-4 focus:ring-reef/10 disabled:cursor-not-allowed disabled:opacity-70"
                />
              </div>

              <div>
                <label
                  htmlFor="file"
                  className="mb-2 block text-sm font-semibold text-ink"
                >
                  WAV File
                </label>
                <input
                  id="file"
                  ref={fileInputRef}
                  type="file"
                  accept=".wav"
                  onChange={handleFileChange}
                  disabled={isSubmitting}
                  className="block w-full rounded-2xl border border-dashed border-ink/20 bg-sand/50 px-4 py-3 text-sm text-ink file:mr-4 file:rounded-full file:border-0 file:bg-reef file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-ink disabled:cursor-not-allowed disabled:opacity-70"
                />
                <p className="mt-2 text-sm text-ink/60">
                  {selectedFile
                    ? `Selected file: ${selectedFile.name}`
                    : "No file selected yet."}
                </p>
              </div>

              {errorMessage ? (
                <div className="rounded-2xl border border-ember/20 bg-ember/10 px-4 py-3 text-sm font-medium text-ember">
                  {errorMessage}
                </div>
              ) : null}

              {successMessage ? (
                <div className="rounded-2xl border border-reef/20 bg-reef/10 px-4 py-3 text-sm font-medium text-reef">
                  {successMessage}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center rounded-2xl bg-ink px-6 py-3.5 font-semibold text-white transition hover:bg-reef disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? (
                  <Spinner label="Uploading..." tone="light" />
                ) : (
                  "Submit"
                )}
              </button>
            </form>
          </section>
        </div>


      </div>
    </main>
  );
}

export default UploadPage;
