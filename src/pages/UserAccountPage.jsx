import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getDoc, doc, getFirestore } from "firebase/firestore";
import EditIdentityModal from "../components/EditIdentityModal";
import EditContactModal from "../components/EditContactModal";
import Header from "../components/Header";
import { useAuth } from "../contexts/AuthContext";
import ProfessionalDetails from "../components/ProfessionalDetails";
import { Outlet, Link, useLocation } from "react-router-dom";
import SupportButton from "../components/SupportButton";

const SkeletonBlock = ({ className }) => (
  <motion.div
    className={`bg-gray-200 rounded ${className}`}
    initial={{ backgroundPosition: '100% 0' }}
    animate={{ backgroundPosition: '-100% 0' }}
    transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
    style={{
      backgroundImage: 'linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%)',
      backgroundSize: '200% 100%',
    }}
  />
);

const UserAccountPage = () => {
  const { user } = useAuth();
  const [isEditIdentityOpen, setIsEditIdentityOpen] = useState(false);
  const [isEditContactOpen, setIsEditContactOpen] = useState(false);
  const [identityInfo, setIdentityInfo] = useState({
    title: "Mr.",
    fullName: user?.displayName || "",
    dob: "",
    nationality: "",
    placeOfBirth: "",
  });
  const [contactInfo, setContactInfo] = useState({ phoneNumber: "", address: "" });
  const [loading, setLoading] = useState(true);

  const location = useLocation();

  useEffect(() => {
    const fetchIdentity = async () => {
      if (!user?.uid) return;
      try {
        const db = getFirestore();
        const identityRef = doc(db, "users", user.uid, "profile", "identity");
        const identitySnap = await getDoc(identityRef);
        if (identitySnap.exists()) {
          setIdentityInfo(identitySnap.data());
        }

        const contactRef = doc(db, "users", user.uid, "profile", "contact");
        const contactSnap = await getDoc(contactRef);
        if (contactSnap.exists()) {
          setContactInfo(contactSnap.data());
        }
      } finally {
        setLoading(false);
      }
    };

    fetchIdentity();
  }, [user?.uid]);

  const propertyId = localStorage.getItem("propertyId") || "default-property-id";
  console.log("UserAccountPage loaded with propertyId:", propertyId);

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-md border-r border-l-4 border-[#c4a875] px-6 py-8 hidden md:block rounded-tr-lg rounded-br-lg">
          <h2 className="text-xl font-bold mb-6 text-gray-800 tracking-wide">{identityInfo?.fullName || user?.displayName || "Guest"}</h2>
           {/* Status card */}
          <div className="bg-gray-100 p-4 rounded-xl mb-3">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shrink-0 border-[1px] border-[#9b875d]">
                <img src="/Logo.png" alt="Status Logo" className="w-9 h-9" />
              </div>
              <p className="text-xs text-gray-500">
                <span className="font-medium text-gray-800">Exclusive access. Elevated experience.</span>
              </p>
            </div>
          </div>
          <nav className="text-sm space-y-3 font-medium">
            <Link to="/account/information" className={`block rounded px-3 py-2 transition-colors duration-200 ${location.pathname === "/account/information" ? "bg-gray-100 text-black font-semibold" : "text-gray-700 hover:bg-gray-100 hover:text-black"}`}>Your information</Link>
            {/*<Link to="/account" className={`block rounded px-3 py-2 transition-colors duration-200 ${location.pathname === "/account/overview" ? "bg-gray-100 text-black font-semibold" : "text-gray-700 hover:bg-gray-100 hover:text-black"}`}>Overview</Link>*/}
            <Link to="/account/reservations" className={`block rounded px-3 py-2 transition-colors duration-200 ${location.pathname === "/account/reservations" ? "bg-gray-100 text-black font-semibold" : "text-gray-700 hover:bg-gray-100 hover:text-black"}`}>Your reservations</Link>
            {/*<Link to="/account/loyalty" className={`block rounded px-3 py-2 transition-colors duration-200 ${location.pathname === "/account/loyalty" ? "bg-gray-100 text-black font-semibold" : "text-gray-700 hover:bg-gray-100 hover:text-black"}`}>Your loyalty account</Link</div>>*/}
            {/*<Link to="/account/points" className={`block rounded px-3 py-2 transition-colors duration-200 ${location.pathname === "/account/points" ? "bg-gray-100 text-black font-semibold" : "text-gray-700 hover:bg-gray-100 hover:text-black"}`}>Your points statement</Link>*/}
             {/*<Link to="/account/stay-preferences" className={`block rounded px-3 py-2 transition-colors duration-200 ${location.pathname === "/account/stay-preferences" ? "bg-gray-100 text-black font-semibold" : "text-gray-700 hover:bg-gray-100 hover:text-black"}`}>Your stay preferences</Link>*/}
             {/*<Link to="/account/communication" className={`block rounded px-3 py-2 transition-colors duration-200 ${location.pathname === "/account/communication" ? "bg-gray-100 text-black font-semibold" : "text-gray-700 hover:bg-gray-100 hover:text-black"}`}>Your communication preferences</Link>*/}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 px-0 py-0 sm:py-10 sm:px-6">
          {loading ? (
            <div className="space-y-2">
              <SkeletonBlock className="h-6 w-1/4" />
              <SkeletonBlock className="h-40 w-full" />
              <SkeletonBlock className="h-40 w-full" />
              <SkeletonBlock className="h-6 w-1/4 mt-8" />
              <SkeletonBlock className="h-40 w-full" />
            </div>
          ) : (
            <Outlet context={{ identityInfo, setIdentityInfo, contactInfo, setContactInfo }} />
          )}
         
        </main>
      </div>
    </>
  );
};

export default UserAccountPage;
