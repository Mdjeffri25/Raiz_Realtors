import React, { useEffect, useMemo, useState } from "react";
import leadApi from "../api/leadApi";

export default function FollowUps() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadFollowUps();
  }, []);

  const loadFollowUps = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await leadApi.getAll();

      const data = Array.isArray(response.data)
        ? response.data
        : [];

      setLeads(data);
    } catch (err) {
      console.error("Failed to load follow-ups:", err);

      if (err.response?.status === 401) {
        setError("Your session has expired. Please login again.");
      } else if (err.response?.status === 403) {
        setError("You do not have permission to view follow-ups.");
      } else {
        setError("Unable to load follow-ups.");
      }
    } finally {
      setLoading(false);
    }
  };

  const followUps = useMemo(() => {
    return leads
      .filter((lead) => lead.followUpDate)
      .filter((lead) => {
        const text = `${lead.name || ""} ${lead.phone || ""} ${
          lead.email || ""
        }`.toLowerCase();

        return text.includes(search.toLowerCase());
      })
      .sort((a, b) => {
        return (
          new Date(a.followUpDate) -
          new Date(b.followUpDate)
        );
      });
  }, [leads, search]);

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatus = (date) => {
    if (!date) return "No date";

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const followUp = new Date(date);
    followUp.setHours(0, 0, 0, 0);

    if (followUp < today) return "Overdue";

    if (followUp.getTime() === today.getTime()) return "Today";

    return "Upcoming";
  };

  return (
    <div className="min-h-screen bg-[#FAF9F7] p-6 md:p-8">
      
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.25em] text-[#8A8580]">
            Sales Operations
          </p>

          <h1 className="font-serif text-4xl text-[#111111]">
            Follow-ups
          </h1>

          <p className="mt-2 text-sm text-[#6B6865]">
            Stay on top of upcoming and overdue lead follow-ups.
          </p>
        </div>

        <div className="text-sm text-[#6B6865]">
          {followUps.length} scheduled follow-up
          {followUps.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search leads by name, phone or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-[#E5E2DF] bg-white px-4 py-4 text-sm text-[#111111] outline-none transition focus:border-[#111111]"
          />
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="border border-[#E5E2DF] bg-white p-12 text-center">
          <p className="text-sm text-[#6B6865]">
            Loading follow-ups...
          </p>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="border border-[#E5E2DF] bg-white p-12 text-center">
          <p className="mb-4 text-sm text-red-600">
            {error}
          </p>

          <button
            onClick={loadFollowUps}
            className="bg-[#111111] px-5 py-3 text-sm font-medium text-white"
          >
            Try again
          </button>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && followUps.length === 0 && (
        <div className="border border-[#E5E2DF] bg-white p-16 text-center">
          <h2 className="font-serif text-2xl text-[#111111]">
            No follow-ups found
          </h2>

          <p className="mt-2 text-sm text-[#6B6865]">
            Leads with scheduled follow-up dates will appear here.
          </p>
        </div>
      )}

      {/* Table */}
      {!loading && !error && followUps.length > 0 && (
        <div className="overflow-hidden border border-[#E5E2DF] bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-[#E5E2DF] bg-[#FAF9F7]">
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-[#6B6865]">
                    Lead
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-[#6B6865]">
                    Contact
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-[#6B6865]">
                    Follow-up Date
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-[#6B6865]">
                    Stage
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-[#6B6865]">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {followUps.map((lead) => {
                  const status = getStatus(lead.followUpDate);

                  return (
                    <tr
                      key={lead.id}
                      className="border-b border-[#E5E2DF] last:border-b-0 hover:bg-[#FAF9F7]"
                    >
                      <td className="px-6 py-5">
                        <div className="font-medium text-[#111111]">
                          {lead.name}
                        </div>

                        {lead.notes && (
                          <div className="mt-1 max-w-xs truncate text-xs text-[#8A8580]">
                            {lead.notes}
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-5">
                        <div className="text-sm text-[#242424]">
                          {lead.phone || "—"}
                        </div>

                        <div className="mt-1 text-xs text-[#8A8580]">
                          {lead.email || "—"}
                        </div>
                      </td>

                      <td className="px-6 py-5 text-sm text-[#242424]">
                        {formatDate(lead.followUpDate)}
                      </td>

                      <td className="px-6 py-5">
                        <span className="text-sm text-[#242424]">
                          {lead.stage
                            ? lead.stage.replaceAll("_", " ")
                            : "NEW"}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex border px-3 py-1 text-xs font-medium ${
                            status === "Overdue"
                              ? "border-red-200 bg-red-50 text-red-700"
                              : status === "Today"
                              ? "border-[#E7A58C] bg-[#F6E3DA] text-[#111111]"
                              : "border-[#E5E2DF] bg-white text-[#6B6865]"
                          }`}
                        >
                          {status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
// FollowUps.jsx
