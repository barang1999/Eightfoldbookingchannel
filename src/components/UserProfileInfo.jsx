// src/components/UserProfileInfo.jsx
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail } from "lucide-react";

const UserProfileInfo = () => {
  const { profile, user } = useAuth();

  const displayName = profile?.fullName?.trim()
    ? profile.fullName.trim().split(" ")[0]
    : user?.email
    ? user.email.charAt(0).toUpperCase()
    : "Guest";

  return (
    <div className="mb-6 px-4 text-gray-800">
      <div className="flex items-center px-1 gap-3 mb-2">
        <User className="w-5 h-5 text-[#A58E63] shrink-0" />
        <span className="leading-[1.2] px-1 align-middle">{displayName}</span>
      </div>
      <div className="flex items-center px-1 gap-3 mb-2">
        <Mail className="w-5 h-5 text-[#A58E63] shrink-0 " />
        <span className="leading-[1.2] px-1 align-middle">{user?.email}</span>
      </div>
    </div>
  );
};

export default UserProfileInfo;