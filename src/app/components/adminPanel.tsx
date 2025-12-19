"use client";
import { useState, useEffect } from "react";

export default function AdminPanel() {
  const [user, setUser] = useState<{ name: string; roles: string } | null>(
    null
  );
  const [input, setInput] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");


type Reports = {
  id: string;
  reportedId: string;
  reporterId: string;
  reason: string;
};

  const [reportsData, setReportsData] = useState<Reports[]>([]);

  const [fakeUsersEnabled, setFakeUsersEnabled] = useState<boolean>();

  useEffect(() => {
    fetch("/api/auth")
      .then((res) => {
        if (!res.ok) throw new Error("Nicht eingeloggt oder Fehler");
        return res.json();
      })
      .then((data) => setUser(data))
      .catch(() => setUser(null));

    fetch("/api/report")
      .then((res) => res.json())
      .then((data) => {
        setReportsData(data.reports);
      })
      .catch((error) => {
        console.error("Error fetching reports:", error);
      });

    fetch("/api/enableFakeUsers")
      .then((res) => res.json())
      .then((data) => {
        setFakeUsersEnabled(data.Fake[0].fakeUsersEnabled);
      })
      .catch((error) => {
        console.error("Error fetching fakeUsersEnabled:", error);
      });
  }, []);

  const toggleFakeUser = async () => {
    const isFakeUserEnabled = !fakeUsersEnabled;
    setFakeUsersEnabled(isFakeUserEnabled);

    const res = await fetch("/api/enableFakeUsers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fakeUsersEnabled: isFakeUserEnabled }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.log(errorText);
    } else {
      const successText = await res.text();
      console.log(successText);
    }
  };

  const createFakeProfile = async () => {
    console.log(input);
    setError("");
    setSuccess("");

    const res = await fetch("/api/createFakeProfiles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ count: input }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      setError(errorText);
    } else {
      const successText = await res.text();
      setSuccess(successText);
    }
  };

  return (
    <div className="space-y-4">
      {/* --- fake users ein/aus für alle zugänglich --- */}
      <div className="p-6 rounded-xl border-2 border-blue-300 space-y-3 bg-white shadow-lg shadow-blue-600/20">
        <div className="text-blue-400 font-bold w-full text-center">
          Fake Users
        </div>
        <div className="text-blue-300 text-xs w-full text-center">
          Hier kannst du die fake Benutzer ein- und ausschalten.
        </div>

        <div className="shadow-lg px-2 rounded-lg shadow-blue-800/10">
          <button
            onClick={toggleFakeUser}
            className={`px-4 py-1 min-w-40 w-full rounded transition ${
              fakeUsersEnabled
                ? "bg-blue-500 hover:bg-blue-600 text-white"
                : "bg-gray-200 hover:bg-gray-300 text-gray-800"
            }`}
          >
            {fakeUsersEnabled ? "Eingeschaltet" : "Ausgeschaltet"}
          </button>
        </div>
      </div>

      {/* --- admin panel --- */}
      {user?.roles === "admin" && (
        <div className="p-6 rounded-xl border-2 border-blue-300 space-y-3 bg-white shadow-lg shadow-blue-600/20">
          <div className="space-y-4">
            {/* fake users erstellen */}
            <div>
              <div className="text-blue-400 font-bold w-full text-center">
                Admin panel
              </div>
              <div className="text-gray-400 text-xs ">Fake User erstellen</div>

              <div className="flex items-center border border-blue-600 rounded-lg overflow-hidden w-full ">
                <div className="flex-1">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    type="number"
                    max={100}
                    className="w-full px-3 py-1 text-gray-700 outline-none"
                  />
                </div>

                <button
                  onClick={createFakeProfile}
                  type="button"
                  className="bg-blue-600 border border-blue-600 text-white px-4 py-1 hover:bg-blue-700 hover:border-blue-700"
                >
                  +
                </button>
              </div>
              {error && (
                <div className="text-rose-600/80 font-bold text-sm">
                  {error}
                </div>
              )}
              {success && (
                <div className="text-emerald-600 font-bold text-sm">
                  {success}
                </div>
              )}
            </div>

            {/* gemeldete users */}
            <div className="text-gray-400 font-bold text-sm">
              Gemeldete User:
              <div className=" max-h-90 overflow-auto">
                {reportsData.length === 0 ? (
                  <div className="text-gray-500 font-bold text-sm ">
                    Keine Meldungen.
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {reportsData.map((report) => (
                      <li
                        key={report.id}
                        className="border-gray-200 shadow-md p-2 border rounded-sm"
                      >
                        <div className="text-red-400">
                          {report.reportedId}
                        </div>
                        <div className="">
                          from: {report.reporterId}
                        </div>
                        <div className="text-sm text-gray-500">
                          {report.reason}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>



          </div>
        </div>
      )}
    </div>
  );
}
