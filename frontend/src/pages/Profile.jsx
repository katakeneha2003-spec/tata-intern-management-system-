import React, { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import API from "../services/api";
import Alert from "../components/Alert.jsx";

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone || "");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState("");
  const [passwordErr, setPasswordErr] = useState("");

  const saveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg("");
    const res = await API.put("/auth/me", { name, phone });
    updateUser(res.data.data);
    setProfileMsg("Profile updated successfully.");
    setSavingProfile(false);
  };

  const savePassword = async (e) => {
    e.preventDefault();
    setSavingPassword(true);
    setPasswordMsg("");
    setPasswordErr("");
    try {
      await API.put("/auth/password", { currentPassword, newPassword });
      setPasswordMsg("Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      setPasswordErr(err.response?.data?.message || "Could not change password");
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="max-w-xl">
      <div className="mb-6">
        <h1 className="text-2xl font-display font-semibold text-navy-950">Profile</h1>
        <p className="text-sm text-steel-600 mt-1">Manage your account details.</p>
      </div>

      <div className="card p-6 mb-6">
        <h3 className="font-display font-semibold text-navy-950 mb-4">Account details</h3>
        {profileMsg && <Alert type="success">{profileMsg}</Alert>}
        <form onSubmit={saveProfile} className="space-y-4">
          <div><label className="label">Full name</label><input className="input" value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div><label className="label">Email</label><input disabled className="input" value={user.email} /></div>
          <div><label className="label">Phone</label><input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
          <div><label className="label">Role</label><input disabled className="input capitalize" value={user.role} /></div>
          <button disabled={savingProfile} className="btn-primary">{savingProfile ? "Saving..." : "Save changes"}</button>
        </form>
      </div>

      <div className="card p-6">
        <h3 className="font-display font-semibold text-navy-950 mb-4">Change password</h3>
        {passwordMsg && <Alert type="success">{passwordMsg}</Alert>}
        {passwordErr && <Alert type="error">{passwordErr}</Alert>}
        <form onSubmit={savePassword} className="space-y-4">
          <div><label className="label">Current password</label><input type="password" required className="input" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} /></div>
          <div><label className="label">New password</label><input type="password" required minLength={6} className="input" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} /></div>
          <button disabled={savingPassword} className="btn-outline">{savingPassword ? "Saving..." : "Update password"}</button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
