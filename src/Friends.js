import React, { useEffect, useState, useContext } from "react";
import { supabase } from "./supabaseClient";
import PendingRequests from "./PendingRequests";
import { GameContext } from "./GameContext";
import { t } from "./locales/strings";
import { useNavigate } from "react-router-dom";

import InviteFriendsIcon from "./assets/icons/Buttons/Fr+Button.png";
import MsButton from "./assets/icons/Buttons/MsButton.png";
import BButton from "./assets/icons/Buttons/BButton.png";

const Friends = () => {
  const { state } = useContext(GameContext);
  const [friends, setFriends] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [inviteInput, setInviteInput] = useState("");
  const [inviteStatus, setInviteStatus] = useState("");
  const [showRequests, setShowRequests] = useState(false);
  const [hasPending, setHasPending] = useState(false);
  const navigate = useNavigate();

  // 🔁 Обновление списка входящих заявок
  const checkPendingRequests = async () => {
    if (!state.user?.id) return;
    const { count } = await supabase
      .from("friend_requests")
      .select("id", { count: "exact", head: true })
      .eq("to_id", state.user.id)
      .eq("accepted", false);

    setHasPending(count > 0);
  };

  // 🔁 Обновление друзей
  const fetchFriends = async () => {
    if (!state.user?.id) return;

    const { data: friendLinks, error } = await supabase
      .from("friends")
      .select("friend_id")
      .eq("user_id", state.user.id);

    if (error) {
      console.error(t("error_loading_friends"), error);
      return;
    }

    const friendIds = friendLinks.map((f) => f.friend_id);
    if (friendIds.length === 0) {
      setFriends([]);
      return;
    }

    const { data: usersData, error: userError } = await supabase
      .from("users")
      .select("id, username, photo_url, user_stats(level, plum_count, gp)")
      .in("id", friendIds);

    if (userError) {
      console.error(t("error_loading_friends"), userError);
    } else {
      setFriends(usersData || []);
    }
  };

  useEffect(() => {
    fetchFriends();
    checkPendingRequests();
  }, [state.user]);

  useEffect(() => {
    const interval = setInterval(() => {
      checkPendingRequests();
      fetchFriends();
    }, 5000);
    return () => clearInterval(interval);
  }, [state.user]);

  const sendFriendRequest = async () => {
    const term = inviteInput.trim();
    if (!term) return;

    let query = supabase.from("users").select("id");
    if (/^[0-9a-fA-F-]{36}$/.test(term)) {
      query = query.eq("id", term);
    } else {
      query = query.ilike("username", term);
    }

    const { data, error } = await query.single();

    if (error || !data) {
      setInviteStatus(t("user_not_found"));
      return;
    }

    const { error: inviteError } = await supabase.from("friend_requests").insert({
      from_id: state.user.id,
      to_id: data.id,
    });

    if (inviteError) {
      setInviteStatus(t("sending_error") + inviteError.message);
    } else {
      setInviteStatus(t("invite_sent"));
      setInviteInput("");
    }
  };

  return (
    
    <div className="p-6 text-white relative">
      <h1 className="text-center text-[40px] font-extrabold mb-5">{t("friends")}</h1>
      <div className="flex justify-between items-center mb-6">
        
        <button
          onClick={() => setModalOpen(true)}
          className="text-white relative hover:opacity-80 transition"
        >
          <img
            src={InviteFriendsIcon}
            alt={t("invite_friend")}
            className="w-[55px] h-[55px] object-contain"
          />
        </button>

        <button
          onClick={() => setShowRequests(!showRequests)}
          className="text-white relative hover:opacity-80 transition"
        >
          {hasPending && (
            <>
              <span className="absolute top-0 left-0 w-3 h-3 bg-red-500 rounded-full z-10 animate-ping"></span>
              <span className="absolute top-0 left-0 w-3 h-3 bg-red-500 rounded-full z-10"></span>
            </>
          )}
          <img
            src={MsButton}
            alt={t("messages")}
            className="w-[55px] h-[55px] object-contain"
          />
        </button>
      </div>

      {/*Модальное окно заявок в друзья*/}
      {showRequests && (
        <div className="bg-blue-800/70 rounded-xl p-4 mb-6 shadow-md border border-white/10">
          <PendingRequests />
        </div>
      )}

      {friends.length === 0 ? (
        <p className="text-black/60 bg-blue-800/70 rounded-xl text-center shadow-md border border-white/60 italic">
          {t("no_friends_yet")}
        </p>
) : (
  <div className="max-w-3xl mx-auto bg-black/50 p-4 rounded-lg shadow-[0_4px_6px_rgba(0,0,0,0.5)]">
    {friends.map((friend) => (
      <div
        key={friend.id}
        className="flex items-center justify-between p-3 bg-white/10 rounded-md shadow-sm mb-3"
      >
        <div className="flex items-center gap-3">
          <img
            src={friend.photo_url}
            alt="avatar"
            className="w-12 h-12 rounded-full border-2 border-white shadow"
          />
          <div className="flex flex-col">
            <span className="font-semibold text-lg">
              {friend.username || t("no_name")}
            </span>
            <span className="text-sm text-blue-400">
              <b>{t("level")}:</b> {friend.user_stats?.level || 1}
            </span>
            <span className="text-sm text-yellow-400">
              <b>Plum:</b> {friend.user_stats?.plum_count || 0} • GP:{" "}
              {friend.user_stats?.gp || 0}
            </span>
          </div>
        </div>
      </div>
    ))}
  </div>
)}

      {/*Кнопка - Назад*/}
      <button
        onClick={() => navigate(-1)}
        className="back-button mt-6 text-[xl]"
      >
        <img
          src={BButton}
          alt="Закрыть"
          className="w-12 h-12"
        />
      </button>

      {/*Модальное окно заявок в друзья*/}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
          <div className="bg-[#1d2330] p-6 rounded-2xl shadow-2xl w-[350px] max-w-md text-white border border-white/10">
            <h3 className="text-2xl font-bold mb-4 text-center text-yellow-400">{t("add_friend")}</h3>
            <label className="text-sm mb-1 block text-white/80">{t("enter_username_or_id")}</label>
            <input
              type="text"
              value={inviteInput}
              onChange={(e) => setInviteInput(e.target.value)}
              placeholder={t("placeholder_username_or_uuid")}
              className="w-full mb-4 px-4 py-2 rounded-lg bg-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
            <button
              onClick={sendFriendRequest}
              className="w-full bg-yellow-400 hover:bg-yellow-300 text-black px-4 py-2 rounded-lg font-semibold transition"
            >
              {t("send_request")}
            </button>
            {inviteStatus && (
              <p className="text-sm text-white/80 mt-3 text-center">{inviteStatus}</p>
            )}

            {/* Кнопка пригласить по ссылке через Telegram */}
<button
  onClick={() => {
    const inviteLink = `https://t.me/plumtap_bot?start=invite_${state.user.telegram_id}`;
    if (window.Telegram?.WebApp?.shareText) {
      window.Telegram.WebApp.shareText(inviteLink);
    } else {
      navigator.clipboard.writeText(inviteLink);
      setInviteStatus(t("invite_link_copied"));
    }
  }}
  className="mt-[10px] w-full mb-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition"
>
  📩 {t("invite_by_link")}
</button>

            <button
              onClick={() => {
                setModalOpen(false);
                setInviteInput("");
                setInviteStatus("");
              }}
              className="mt-5 text-sm text-red-400 hover:text-red-300 text-center w-full"
            >
              {t("close")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Friends;
