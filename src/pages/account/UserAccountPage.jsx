import React, { useState, useEffect } from "react";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import EditIdentityModal from "../../components/EditIdentityModal";
import EditContactModal from "../../components/EditContactModal";
import ProfessionalDetails from "../../components/ProfessionalDetails";
import EditBusinessModal from "../../components/EditBusinessModal";
import { useAuth } from "../../contexts/AuthContext";
import { useOutletContext } from "react-router-dom";
import SupportButton from "../../components/SupportButton";
const UserAccount = () => {
  const outletContext = useOutletContext() || {};
  const {
    identityInfo = {},
    setIdentityInfo = () => {},
    contactInfo = {},
    setContactInfo = () => {}
  } = outletContext;
  const { user } = useAuth();
  const [isEditIdentityOpen, setIsEditIdentityOpen] = useState(false);
  const [isEditContactOpen, setIsEditContactOpen] = useState(false);
  const [isEditBusinessOpen, setIsEditBusinessOpen] = useState(false);
  const [businessInfo, setBusinessInfo] = useState({});

  useEffect(() => {
    const fetchBusinessInfo = async () => {
      const db = getFirestore();
      const auth = getAuth();
      const uid = auth.currentUser?.uid;
      if (!uid) return;
      const ref = doc(db, "users", uid, "profile", "business");
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setBusinessInfo(snap.data());
      }
    };
    fetchBusinessInfo();
  }, []);

  return (
    <>
      <h1 className="text-2xl mt-4 font-bold mb-6 text-center md:text-left md:mt-0">Personal details</h1>

      <section className="bg-white rounded shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Identity</h2>
          <button
            onClick={() => setIsEditIdentityOpen(true)}
            className="text-sm text-theme hover:underline"
          >
            Edit
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Title</p>
            <p className="text-sm">{identityInfo.title}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">First and last name</p>
            <p className="text-sm">{identityInfo.fullName}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Date of birth</p>
            <p className="text-sm">{identityInfo.dob || "-"}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Nationality</p>
            <p className="text-sm">{identityInfo.nationality || "-"}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Place of birth</p>
            <p className="text-sm">{identityInfo.placeOfBirth || "-"}</p>
          </div>
        </div>
      </section>

      <section className="bg-white rounded shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Contact details</h2>
          <button
            onClick={() => setIsEditContactOpen(true)}
            className="text-sm text-theme hover:underline"
          >
            Edit
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Email address</p>
            <p className="text-sm">{user?.email || "-"}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Phone number</p>
            <p className="text-sm">
              {contactInfo.phone
                ? `${contactInfo.countryCode || ""} ${contactInfo.phone}`
                : "-"}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Address</p>
            <p className="text-sm">{contactInfo.address || "-"}</p>
          </div>
        </div>
      </section>

      <h1 className="text-2xl font-bold mb-6 mt-7 text-center md:text-left">Professional Detail</h1>
      <section className="mt-6">
        <ProfessionalDetails />
      </section>

      <EditIdentityModal
        isOpen={isEditIdentityOpen}
        onClose={() => setIsEditIdentityOpen(false)}
        onSave={(updatedInfo) => {
          setIdentityInfo(updatedInfo);
          setIsEditIdentityOpen(false);
        }}
        user={user}
        identityInfo={identityInfo}
        initialData={identityInfo}
        closeOnOverlayClick={false}
        closeOnEsc={false}
        shouldCloseOnOverlayClick={false}
      />

      <EditContactModal
        isOpen={isEditContactOpen}
        onClose={() => setIsEditContactOpen(false)}
        onSave={(updated) => {
          setContactInfo(updated);
          setIsEditContactOpen(false);
        }}
        user={user}
        contactInfo={contactInfo}
        closeOnOverlayClick={false}
        closeOnEsc={false}
        shouldCloseOnOverlayClick={false}
      />
      <div className="fixed bottom-6 right-0 z-50">
        <SupportButton />
      </div>
    </>
  );
};

export default UserAccount;