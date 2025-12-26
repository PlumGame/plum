import React, { useEffect, useState, useContext } from "react";
import { supabase } from "./supabaseClient";
import { GameContext } from "./GameContext";
import { t } from "./locales/strings";

const PendingRequests = () => {
  const { state } = useContext(GameContext);
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const fetchRequests = async () => {
      if (!state.user?.id) return;

      const { data, error } = await supabase
        .from("friend_requests")
        .select("id, from_id, users:from_id(username, photo_url)")
        .eq("to_id", state.user.id)
        .eq("accepted", false);

      if (error) {
        console.error(t("error_loading_requests"), error);
      } else {
        setRequests(data || []);
      }
    };

    fetchRequests();
  }, [state.user]);

  const acceptRequest = async (requestId, fromId) => {
    await supabase.rpc("add_friend_pair", {
      user_id: state.user.id,
      friend_id: fromId,
    });

    await supabase
      .from("friend_requests")
      .update({ accepted: true })
      .eq("id", requestId);

    setRequests((prev) => prev.filter((r) => r.id !== requestId));
  };

  const declineRequest = async (requestId) => {
    await supabase
      .from("friend_requests")
      .delete()
      .eq("id", requestId);

    setRequests((prev) => prev.filter((r) => r.id !== requestId));
  };

  if (requests.length === 0) {
    return <p className="text-white/60">{t("no_incoming_requests")}</p>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-white mb-2">📥 {t("friend_requests")}</h3>
      {requests.map((req) => (
        <div
          key={req.id}
          className="bg-white/10 p-4 rounded-xl space-y-3"
        >
          <div className="flex items-center gap-3">
            <img
              src={req.users?.photo_url}
              alt="avatar"
              className="w-8 h-8 rounded-full border border-white"
            />
            <span className="text-white font-medium">
              {req.users?.username || t("no_name")}
            </span>
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => acceptRequest(req.id, req.from_id)}
              className="text-sm bg-green-600 hover:bg-green-700 px-3 py-1 rounded-lg"
            >
              ✅ {t("accept")}
            </button>
            <button
              onClick={() => declineRequest(req.id)}
              className="text-sm bg-red-600 hover:bg-red-700 px-3 py-1 rounded-lg"
            >
              ❌ {t("decline")}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PendingRequests;
