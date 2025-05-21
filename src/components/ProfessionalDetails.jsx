import React, { useState, useEffect } from "react";
import { getDoc, doc, getFirestore } from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";
import EditBusinessModal from "./EditBusinessModal";

const ProfessionalDetails = () => {
  const { user } = useAuth();
  const [businessInfo, setBusinessInfo] = useState({
    businessEmail: "",
    businessPhone: "",
    businessAddress: "",
    billingAddress: "",
  });
  const [isEditContactOpen, setIsEditContactOpen] = useState(false);

  useEffect(() => {
    const fetchBusinessInfo = async () => {
      if (!user?.uid) return;
      const db = getFirestore();
      const businessRef = doc(db, "users", user.uid, "profile", "business");
      const businessSnap = await getDoc(businessRef);
      if (businessSnap.exists()) {
        setBusinessInfo(businessSnap.data());
      }
    };

    fetchBusinessInfo();
  }, [user?.uid]);

  return (
    <section className="bg-white rounded shadow-sm p-6 mb-6">
    

      <div className="p-2 rounded">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-md font-semibold">Business contact information</h3>
          <button
            onClick={() => setIsEditContactOpen(true)}
            className="text-sm text-theme hover:underline"
          >
            Edit
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6">
          <div>
            <p className="text-sm font-medium text-gray-500">Email address</p>
            <p className="text-sm">{businessInfo.businessEmail || "-"}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Phone number</p>
            <p className="text-sm">{businessInfo.businessPhone || "-"}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Business address</p>
            <p className="text-sm">{businessInfo.businessAddress || "-"}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Billing address</p>
            <p className="text-sm">{businessInfo.billingAddress || "-"}</p>
          </div>
        </div>
      </div>
      <EditBusinessModal
        isOpen={isEditContactOpen}
        onClose={() => setIsEditContactOpen(false)}
        onSave={(updatedData) => {
          setBusinessInfo(prev => ({ ...prev, ...updatedData }));
          setIsEditContactOpen(false);
        }}
        businessInfo={businessInfo}
      />
    </section>
  );
};

export default ProfessionalDetails;