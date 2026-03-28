"use client";

import { fetchUserFromSession, updateUser } from "@/services/auth.service";
import { UserIcon, X, Mail, Pencil, Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

function EditProfile({
  setEditProfile,
  user_id,
}: {
  setEditProfile: (value: boolean) => void;
  user_id: string | null;
}) {
  const [email, setEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async (user_id: string) => {
    try {
      setLoading(true);
      const response = await fetchUserFromSession(user_id);
      setEmail(response?.data.user.email);
      setNewName(response?.data.user.name);
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await updateUser(user_id!, newName);
      if (res?.status === 200) {
        toast.success("Profile updated.");
        setEditProfile(false);
      }
    } catch (error) {
      toast.error("Failed to update profile.");
      console.error("Error updating profile:", error);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (user_id) fetchUserData(user_id);
  }, []);

  return (
    <div className="md:w-md w-xs bg-[#0d1117] border border-[rgba(255,255,255,0.06)] rounded-2xl shadow-[0_32px_64px_rgba(0,0,0,0.6)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-[rgba(255,255,255,0.06)]">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[rgba(99,179,237,0.08)] border border-[rgba(99,179,237,0.2)]">
            <UserIcon size={14} className="text-[#63b3ed]" />
          </div>
          <div>
            <h1 className="text-[14px] font-bold tracking-[-0.02em] text-[#e8edf5] font-[Syne,sans-serif]">
              Edit Profile
            </h1>
            <p className="text-[10px] font-mono text-[#3d4a5c] mt-0.5">
              account · settings
            </p>
          </div>
        </div>
        <button
          onClick={() => setEditProfile(false)}
          className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#111620] border border-[rgba(255,255,255,0.06)] text-[#7a8a9e] hover:text-[#e8edf5] hover:border-[rgba(255,255,255,0.12)] transition-all duration-150 cursor-pointer"
        >
          <X size={13} />
        </button>
      </div>

      {/* Form body */}
      <form onSubmit={handleEditProfile} className="px-6 py-6 space-y-5">
        {/* Email field */}
        <div className="space-y-2">
          <label
            htmlFor="email"
            className="flex items-center gap-1.5 text-[10px] font-mono font-semibold uppercase tracking-[0.1em] text-[#3d4a5c]"
          >
            <Mail size={10} />
            Email address
          </label>
          <div className="relative flex items-center">
            <input
              id="email"
              type="email"
              value={loading ? "" : email}
              disabled
              placeholder="—"
              className={`
                w-full px-4 py-3 rounded-xl text-[13px] font-[Syne,sans-serif]
                bg-[#080a0f] border border-[rgba(255,255,255,0.04)]
                text-[#3d4a5c] placeholder-[#3d4a5c]
                cursor-not-allowed outline-none select-none
                ${loading ? "animate-pulse" : ""}
              `}
            />
            <span className="absolute right-3 text-[9px] font-mono text-[#3d4a5c] bg-[#111620] border border-[rgba(255,255,255,0.06)] px-1.5 py-0.5 rounded-md">
              readonly
            </span>
          </div>
        </div>

        {/* Name field */}
        <div className="space-y-2">
          <label
            htmlFor="name"
            className="flex items-center gap-1.5 text-[10px] font-mono font-semibold uppercase tracking-[0.1em] text-[#7a8a9e]"
          >
            <Pencil size={10} />
            Display name
          </label>
          <input
            id="name"
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Enter your name"
            required
            className="
              w-full px-4 py-3 rounded-xl text-[13px] font-[Syne,sans-serif] font-medium
              bg-[#111620] border border-[rgba(255,255,255,0.06)]
              text-[#e8edf5] placeholder-[#3d4a5c]
              outline-none transition-all duration-200
              focus:border-[rgba(99,179,237,0.3)] focus:shadow-[0_0_0_3px_rgba(99,179,237,0.06)]
              hover:border-[rgba(255,255,255,0.1)]
            "
          />
        </div>

        {/* Divider */}
        <div className="border-t border-[rgba(255,255,255,0.04)]" />

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving || loading}
            className="
              flex-1 flex items-center justify-center gap-2
              px-4 py-2.5 rounded-xl
              text-[12px] font-bold tracking-[0.02em] font-[Syne,sans-serif]
              bg-gradient-to-r from-[#1a6fdb] to-[#2d8ed4]
              border border-[rgba(99,179,237,0.3)]
              text-white
              shadow-[0_4px_16px_rgba(26,111,219,0.25)]
              hover:shadow-[0_4px_24px_rgba(26,111,219,0.35)]
              disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none
              transition-all duration-200 cursor-pointer
            "
          >
            {saving ? <Loader2 size={13} className="animate-spin" /> : null}
            {saving ? "Saving…" : "Save changes"}
          </button>

          <button
            type="button"
            onClick={() => setEditProfile(false)}
            className="
              flex items-center justify-center
              px-4 py-2.5 rounded-xl
              text-[12px] font-semibold tracking-[0.02em] font-[Syne,sans-serif]
              bg-[#111620] border border-[rgba(255,255,255,0.06)]
              text-[#7a8a9e]
              hover:text-[#e8edf5] hover:border-[rgba(255,255,255,0.1)]
              transition-all duration-150 cursor-pointer
            "
          >
            Discard
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditProfile;
