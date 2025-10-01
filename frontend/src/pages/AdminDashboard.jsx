// src/pages/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

export default function AdminDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState({}); // track comments for each complaint

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/complaints", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setComplaints(res.data);
    } catch (err) {
      console.error("Error fetching complaints:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/complaints/${id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchComplaints();
    } catch (err) {
      console.error("Error updating status:", err.response?.data || err.message);
    }
  };

  const addComment = async (id) => {
    if (!commentText[id]) return;
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:5000/api/complaints/${id}/comments`,
        { body: commentText[id] },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCommentText({ ...commentText, [id]: "" });
      fetchComplaints();
    } catch (err) {
      console.error("Error adding comment:", err.response?.data || err.message);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  // Stats
  const total = complaints.length;
  const pending = complaints.filter(c => c.status === "Pending").length;
  const inProgress = complaints.filter(c => c.status === "In Progress").length;
  const resolved = complaints.filter(c => c.status === "Resolved").length;

  // Complaints resolved this week
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const resolvedThisWeek = complaints.filter(
    c => c.status === "Resolved" && new Date(c.updatedAt) >= oneWeekAgo
  ).length;

  // Show only unresolved complaints
  const activeComplaints = complaints.filter(c => c.status !== "Resolved");

  return (
    <div className="p-8 bg-gradient-to-br from-gray-100 to-gray-200 min-h-screen">
      <h1 className="text-4xl font-bold mb-6 text-gray-800">⚡ Admin Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-xl shadow text-center">
          <div className="text-sm">Pending</div>
          <div className="text-2xl font-bold text-yellow-600">{pending}</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow text-center">
          <div className="text-sm">In Progress</div>
          <div className="text-2xl font-bold text-orange-600">{inProgress}</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow text-center">
          <div className="text-sm">Resolved</div>
          <div className="text-2xl font-bold text-green-600">{resolved}</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow text-center">
          <div className="text-sm">Resolved This Week</div>
          <div className="text-2xl font-bold text-blue-600">{resolvedThisWeek}</div>
        </div>
      </div>

      {/* Complaints */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-4">
          Active Complaints ({activeComplaints.length})
        </h2>
        {activeComplaints.length === 0 ? (
          <div className="text-gray-600">No active complaints 🎉</div>
        ) : (
          <div className="space-y-6">
            {activeComplaints.map(c => (
              <div key={c._id} className="border p-4 rounded-lg bg-gray-50">
                {/* Header */}
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-bold text-lg">{c.title}</div>
                    <div className="text-sm text-gray-600">
                      {c.category} • {new Date(c.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <select
                    value={c.status}
                    onChange={e => updateStatus(c._id, e.target.value)}
                    className="px-3 py-1 border rounded-lg bg-white"
                  >
                    <option>Pending</option>
                    <option>In Progress</option>
                    <option>Resolved</option>
                  </select>
                </div>

                {/* Description */}
                <p className="mt-3 text-gray-700">{c.description}</p>
                <div className="mt-2 text-sm text-gray-500">
                  Citizen: {c.user?.name} ({c.user?.email})
                </div>

                {/* Comments */}
                <div className="mt-4">
                  <h3 className="font-medium">Discussion</h3>
                  {c.comments?.length > 0 ? (
                    <ul className="ml-4 list-disc text-sm text-gray-600">
                      {c.comments.map((com, i) => (
                        <li key={i}>{com.body} – <span className="italic">{new Date(com.date).toLocaleString()}</span></li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-400 text-sm">No comments yet.</p>
                  )}

                  {/* Add Comment */}
                  <div className="flex mt-2 gap-2">
                    <input
                      type="text"
                      placeholder="Write a reply..."
                      value={commentText[c._id] || ""}
                      onChange={e => setCommentText({ ...commentText, [c._id]: e.target.value })}
                      className="flex-1 border px-3 py-1 rounded-lg"
                    />
                    <button
                      onClick={() => addComment(c._id)}
                      className="px-4 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Reply
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

