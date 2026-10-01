import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { authFetch, errorMessage, PREDICTIONS_URL } from "../utils/Api";
import { describeDelay, TONE_CLASSES } from "../utils/Format";

interface Item {
  id: number;
  flight_number: string;
  airline_name: string | null;
  origin: string;
  destination: string;
  scheduled_departure: string;
  predicted_delay_minutes: number;
  created_at: string;
}
interface Paged {
  count: number;
  results: Item[];
}

const PAGE_SIZE = 20; // matches PredictionPagination.page_size in views.py

const HistoryPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Paged | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false; // avoids updating state from an outdated request
    authFetch(`${PREDICTIONS_URL}/history/?page=${page}`)
      .then(async (res) => {
        const body = await res.json().catch(() => ({}));
        if (!res.ok)
          throw new Error(errorMessage(body, "Could not load history"));
        if (!ignore) {
          setData(body);
          setError("");
        }
      })
      .catch((e: Error) => !ignore && setError(e.message))
      .finally(() => !ignore && setLoading(false));
    return () => {
      ignore = true;
    };
  }, [page]);

  const goTo = (p: number) => {
    setLoading(true);
    setPage(p);
  };
  const totalPages = data ? Math.max(1, Math.ceil(data.count / PAGE_SIZE)) : 1;

  return (
    // <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 pt-28 pb-12 px-4 sm:px-6 lg:px-8">
    <div className="min-h-screen pt-28 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-2">Your predictions</h1>
        <p className="text-gray-400 mb-8">
          Every flight you have checked, newest first.
        </p>

        {error && (
          <div
            role="alert"
            className="p-4 bg-rose-500/15 border border-rose-500/50 rounded-lg text-rose-200 mb-4"
          >
            {error}
          </div>
        )}
        {loading && (
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-500 border-t-transparent mx-auto my-12" />
        )}

        {!loading && data && data.results.length === 0 && (
          <div className="text-center py-16 bg-slate-800/50 rounded-2xl border border-slate-700">
            <p className="text-gray-300 mb-4">
              You haven't predicted any flights yet.
            </p>
            <Link
              to="/predict"
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
            >
              Predict a flight
            </Link>
          </div>
        )}

        {!loading && data && data.results.length > 0 && (
          <ul className="space-y-3">
            {data.results.map((p) => {
              const r = describeDelay(p.predicted_delay_minutes);
              return (
                <li
                  key={p.id}
                  className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-800/50 border border-slate-700 rounded-xl"
                >
                  <div>
                    <p className="text-white font-semibold text-lg">
                      {p.origin} to {p.destination}
                    </p>
                    <p className="text-sm text-gray-400">
                      {p.airline_name ?? "Unknown airline"} · departs{" "}
                      {new Date(p.scheduled_departure).toLocaleString(
                        undefined,
                        {
                          dateStyle: "medium",
                          timeStyle: "short",
                          timeZone: "UTC",
                        },
                      )}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Checked {new Date(p.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`px-4 py-1.5 rounded-full border text-sm font-semibold ${TONE_CLASSES[r.tone]}`}
                  >
                    {r.label}
                  </span>
                </li>
              );
            })}
          </ul>
        )}

        {data && totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 text-gray-300">
            <button
              disabled={page <= 1}
              onClick={() => goTo(page - 1)}
              className="px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-sm">
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => goTo(page + 1)}
              className="px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
