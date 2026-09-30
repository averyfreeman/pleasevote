import { useEffect, useState } from "react";
import { MapPin, Search, Trash2 } from "lucide-react";
import { useNavigate } from "react-router";
import type { ElectionSummary } from "~/lib/types";

const ADDRESS_STORAGE_KEY = "pleasevote.address";

/** Collect one address and navigate to the voter-information workflow. */
export default function AddressInput({ elections = [] }: { readonly elections?: readonly ElectionSummary[] }) {
  const [address, setAddress] = useState("");
  const [electionId, setElectionId] = useState("");
  const [saved, setSaved] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const storedAddress = localStorage.getItem(ADDRESS_STORAGE_KEY);
    if (storedAddress) {
      setAddress(storedAddress);
      setSaved(true);
    }
  }, []);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const trimmedAddress = address.trim();
    if (!trimmedAddress) {
      setMessage("Enter a full street address, city, state, and ZIP code.");
      return;
    }

    localStorage.setItem(ADDRESS_STORAGE_KEY, trimmedAddress);
    setSaved(true);
    setMessage("We’ll remember this address on this device.");
    const electionQuery = electionId ? `&electionId=${encodeURIComponent(electionId)}` : "";
    navigate(`/voterinfo?address=${encodeURIComponent(trimmedAddress)}${electionQuery}`);
  }

  function clearSavedAddress(): void {
    localStorage.removeItem(ADDRESS_STORAGE_KEY);
    setAddress("");
    setSaved(false);
    setMessage("Saved address removed.");
  }

  return (
    <div className="w-full max-w-3xl">
      <form onSubmit={handleSubmit} noValidate>
        <label className="mb-2 block text-left text-sm font-bold text-base-content" htmlFor="address">
          Your address
        </label>
        {elections.length ? (
          <div className="mb-3 text-left">
            <label className="mb-2 block text-sm font-bold text-base-content" htmlFor="election-id">Election (optional)</label>
            <select id="election-id" className="select select-bordered w-full bg-base-100 text-base-content" value={electionId} onChange={(event) => setElectionId(event.target.value)}>
              <option value="">Use the next upcoming election</option>
              {elections.map((election) => <option key={election.id} value={election.id}>{election.name} — {election.electionDay}{election.id === "2000" ? " (test data)" : ""}</option>)}
            </select>
          </div>
        ) : null}
        <div className="join flex w-full flex-col gap-3 sm:flex-row sm:gap-0">
          <div className="relative flex-1">
            <MapPin aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-primary" size={22} />
            <input
              id="address"
              name="address"
              type="text"
              autoComplete="street-address"
              placeholder="123 Main St, City, State ZIP"
              className="input input-lg join-item w-full border-base-300 bg-base-100 pl-12 text-base-content placeholder:text-base-content/50 focus:border-primary focus:outline-4 focus:outline-primary/25"
              value={address}
              onChange={(event) => {
                setAddress(event.target.value);
                if (message) setMessage("");
              }}
              aria-describedby="address-help address-status"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary btn-lg join-item px-7">
            <Search aria-hidden="true" size={20} />
            Find my information
          </button>
        </div>
        <p id="address-help" className="mt-3 text-left text-sm text-base-content/65">
          We use this address to find local election information. We don’t register you or submit a ballot.
        </p>
        <p id="address-status" className="mt-2 min-h-6 text-left text-sm font-semibold text-success" aria-live="polite">
          {message}
        </p>
      </form>
      {saved ? (
        <button type="button" className="btn btn-ghost btn-sm mt-2 gap-2 text-base-content/70" onClick={clearSavedAddress}>
          <Trash2 aria-hidden="true" size={15} />
          Forget saved address
        </button>
      ) : null}
    </div>
  );
}
