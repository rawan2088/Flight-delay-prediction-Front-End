import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useAuth } from "../Hooks/useAuth";
import type { ProfileUpdate } from "../context/AuthContextType";
import { authFetch, PREDICTIONS_URL } from "../utils/Api";
import FloatingInput from "../Components/FloatingInput";

const ROLE_LABEL = {
  NORMAL: "Traveler",
  AIRLINE_STAFF: "Airline staff",
  AIRLINE_ADMIN: "Airline admin",
};
const FIELDS: { name: keyof ProfileUpdate; label: string; type?: string }[] = [
  { name: "first_name", label: "First name" },
  { name: "last_name", label: "Last name" },
  { name: "username", label: "Username" },
  { name: "email", label: "Email", type: "email" },
];
interface Stats {
  total_predictions: number;
  average_delay_minutes: number | null;
  max_delay_minutes: number | null;
  min_delay_minutes: number | null;
}
const fmt = (n: number | null) => (n == null ? "-" : `${n.toFixed(1)} min`);

const ProfilePage: React.FC = () => {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState<ProfileUpdate>(() => ({
    username: user?.username ?? "",
    email: user?.email ?? "",
    first_name: user?.first_name ?? "",
    last_name: user?.last_name ?? "",
  }));
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);

  const isAirline = user?.role !== "NORMAL";

  // Airline accounts also see collective stats for their airline's flights
  useEffect(() => {
    if (!isAirline) return;
    let ignore = false;
    authFetch(`${PREDICTIONS_URL}/airline-stats/`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => !ignore && d && setStats(d.stats))
      .catch(() => {});
    return () => {
      ignore = true;
    };
  }, [isAirline]);

  if (!user) return null;

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setSaving(true);
    try {
      await updateProfile(form);
      setMsg({ ok: true, text: "Profile saved." });
    } catch (err) {
      setMsg({
        ok: false,
        text: err instanceof Error ? err.message : "Could not save",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    // <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 pt-28 pb-12 px-4">
    <div className="min-h-screen pt-28 pb-12 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <span className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-2xl font-bold text-white">
            {user.username[0]?.toUpperCase()}
          </span>
          <div>
            <h1 className="text-3xl font-bold text-white">
              {user.first_name || user.username} {user.last_name}
            </h1>
            <p className="text-gray-400 text-sm">
              {ROLE_LABEL[user.role]}
              {user.airline_name && ` · ${user.airline_name}`} · member since{" "}
              {new Date(user.created_at).toLocaleDateString(undefined, {
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        {isAirline && stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              ["Predictions", String(stats.total_predictions)],
              ["Average", fmt(stats.average_delay_minutes)],
              ["Worst", fmt(stats.max_delay_minutes)],
              ["Best", fmt(stats.min_delay_minutes)],
            ].map(([k, v]) => (
              <div
                key={k}
                className="p-4 bg-slate-800/50 border border-slate-700 rounded-xl"
              >
                <p className="text-xs text-gray-400">{k}</p>
                <p className="text-xl font-bold text-white">{v}</p>
              </div>
            ))}
          </div>
        )}

        <form
          onSubmit={save}
          className="p-6 bg-slate-800/50 border border-slate-700 rounded-2xl space-y-4"
        >
          <h2 className="text-xl font-semibold text-white">Your details</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {FIELDS.map((f) => (
              <FloatingInput
                key={f.name}
                id={f.name}
                label={f.label}
                type={f.type ?? "text"}
                value={form[f.name]}
                required
                onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
              />
            ))}
          </div>
          {msg && (
            <p
              role="status"
              className={`text-sm ${msg.ok ? "text-emerald-300" : "text-rose-300"}`}
            >
              {msg.text}
            </p>
          )}
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-slate-600"
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </form>

        <button
          onClick={() => {
            logout();
            navigate("/");
          }}
          className="flex items-center gap-2 px-6 py-3 text-rose-300 border border-rose-500/40 rounded-lg hover:bg-rose-500/10"
        >
          <LogOut className="w-4 h-4" /> Sign out
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
