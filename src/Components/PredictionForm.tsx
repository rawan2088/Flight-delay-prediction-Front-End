import React, { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import AutocompleteInput from "../data/Autocomplete";
import { AIRLINES } from "../data/airlinesData";
import { AIRPORTS } from "../data/airportsData";
import { authFetch, errorMessage, PREDICTIONS_URL } from "../utils/api";
import { describeDelay, TONE_CLASSES } from "../utils/format";

const inputCls =
  "w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors";

// Plain-language distance presets, so nobody needs to know exact miles
const DISTANCES = [
  { label: "Short hop", hint: "under 500 mi", miles: 300 },
  { label: "Regional", hint: "about 1,000 mi", miles: 1000 },
  { label: "Cross-country", hint: "about 2,500 mi", miles: 2500 },
  { label: "Very long", hint: "4,000+ mi", miles: 4000 },
];

const Step: React.FC<{
  n: number;
  title: string;
  help: string;
  children: React.ReactNode;
}> = ({ n, title, help, children }) => (
  <fieldset className="space-y-3">
    <legend className="flex items-center gap-3 mb-1">
      <span className="w-7 h-7 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center">
        {n}
      </span>
      <span className="text-lg font-semibold text-white">{title}</span>
    </legend>
    <p className="text-sm text-gray-400 -mt-1">{help}</p>
    {children}
  </fieldset>
);

const PredictionForm: React.FC = () => {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [airline, setAirline] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState("");
  const [distance, setDistance] = useState("");
  const [delay, setDelay] = useState("0");
  const [advanced, setAdvanced] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [minutes, setMinutes] = useState<number | null>(null);

  // Wake the ML service (sleeping Fly.io machine) as soon as the page opens
  useEffect(() => {
    fetch(`${PREDICTIONS_URL}/predict/warmup/`, { method: "POST" }).catch(
      () => {},
    );
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMinutes(null);

    // The autocomplete shows text even when nothing was picked, so check codes
    if (!origin || !destination || !airline) {
      setError("Pick your airports and airline from the suggestions list.");
      return;
    }
    if (origin === destination) {
      setError("Departure and arrival airports must be different.");
      return;
    }

    // Derive everything the API needs from a date and a time
    const [y, m, d] = date.split("-").map(Number);
    const [hh, mm] = time.split(":").map(Number);
    const dayOfWeek = (new Date(y, m - 1, d).getDay() + 6) % 7; // Monday = 0

    setLoading(true);
    try {
      const res = await authFetch(`${PREDICTIONS_URL}/predict/`, {
        method: "POST",
        body: JSON.stringify({
          origin_airport: origin,
          destination_airport: destination,
          airline,
          year: y,
          month: m,
          day: d,
          day_of_week: dayOfWeek,
          departure_delay: parseInt(delay) || 0,
          scheduled_time_minutes: hh * 60 + mm,
          distance: parseInt(distance),
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok)
        throw new Error(errorMessage(body, `Request failed (${res.status})`));
      setMinutes(Number(body.predicted_arrival_delay_minutes));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not get a prediction",
      );
    } finally {
      setLoading(false);
    }
  };

  const result = minutes !== null ? describeDelay(minutes) : null;
  const airlineName = AIRLINES.find((a) => a.code === airline)?.label;

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-5 sm:p-8 shadow-2xl">
      <form onSubmit={handleSubmit} className="space-y-8">
        <Step
          n={1}
          title="Where are you flying?"
          help="Type a city, airport name or code, then pick from the list."
        >
          <div className="grid md:grid-cols-2 gap-4">
            <AutocompleteInput
              label="From"
              name="origin"
              value={origin}
              onChange={setOrigin}
              options={AIRPORTS}
              placeholder="e.g. New York"
              required
            />
            <AutocompleteInput
              label="To"
              name="destination"
              value={destination}
              onChange={setDestination}
              options={AIRPORTS}
              placeholder="e.g. Los Angeles"
              required
            />
          </div>
        </Step>

        <Step n={2} title="Which airline?" help="Search by airline name.">
          <AutocompleteInput
            label="Airline"
            name="airline"
            value={airline}
            onChange={setAirline}
            options={AIRLINES}
            placeholder="e.g. Delta"
            required
          />
        </Step>

        <Step
          n={3}
          title="When does it depart?"
          help="Use the scheduled time on your ticket."
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="date"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Date
              </label>
              <input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={inputCls}
                required
              />
            </div>
            <div>
              <label
                htmlFor="time"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Departure time
              </label>
              <input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className={inputCls}
                required
              />
            </div>
          </div>
        </Step>

        <Step
          n={4}
          title="How long is the flight?"
          help="Pick the closest match, or type the exact miles."
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {DISTANCES.map((o) => (
              <button
                key={o.miles}
                type="button"
                onClick={() => setDistance(String(o.miles))}
                className={`p-3 rounded-lg border text-left transition-colors ${
                  distance === String(o.miles)
                    ? "border-blue-500 bg-blue-500/15"
                    : "border-slate-700 bg-slate-900 hover:border-slate-500"
                }`}
              >
                <span className="block text-sm font-semibold text-white">
                  {o.label}
                </span>
                <span className="block text-xs text-gray-400">{o.hint}</span>
              </button>
            ))}
          </div>
          <input
            type="number"
            min="1"
            value={distance}
            onChange={(e) => setDistance(e.target.value)}
            className={inputCls}
            placeholder="Distance in miles"
            aria-label="Distance in miles"
            required
          />
        </Step>

        <div>
          <button
            type="button"
            onClick={() => setAdvanced((a) => !a)}
            className="flex items-center gap-1 text-sm text-gray-400 hover:text-white"
          >
            <ChevronDown
              className={`w-4 h-4 transition-transform ${advanced ? "rotate-180" : ""}`}
            />
            Already delayed at departure?
          </button>
          {advanced && (
            <div className="mt-3">
              <label
                htmlFor="delay"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Minutes late leaving the gate
              </label>
              <input
                id="delay"
                type="number"
                min="0"
                value={delay}
                onChange={(e) => setDelay(e.target.value)}
                className={inputCls}
              />
              <p className="text-xs text-gray-500 mt-1">
                Leave at 0 if you haven't left yet.
              </p>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Predicting..." : "Predict my delay"}
        </button>
      </form>

      <div aria-live="polite" className="mt-6">
        {error && (
          <div
            role="alert"
            className="p-4 bg-rose-500/15 border border-rose-500/50 rounded-lg text-rose-200 text-sm"
          >
            {error}
          </div>
        )}
        {result && !error && (
          <div
            className={`p-6 rounded-xl border text-center ${TONE_CLASSES[result.tone]}`}
          >
            <p className="text-sm opacity-80 mb-1">
              {origin} to {destination} · {airlineName ?? airline} · {date}
            </p>
            <p className="text-4xl font-bold">{result.label}</p>
            <p className="text-xs opacity-70 mt-2">
              An estimate only. Always check with your airline.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PredictionForm;
