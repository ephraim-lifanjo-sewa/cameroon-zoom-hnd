/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Loader2, Search, CheckCircle2, ImageIcon } from "lucide-react";
import {
  useUser,
  useFirestore,
  setDocumentNonBlocking,
  useDoc,
  useMemoFirebase,
  updateDocumentNonBlocking,
} from "@/firebase";
import { collection, doc, query, where, getDocs } from "firebase/firestore";
import { Enterprise } from "@/app/lib/types";
import { type } from './../../lib/placeholder-images';

const CATEGORIES = [
  "Food & Restaurants",
  "Health & Wellness",
  "Technology & IT",
  "Business & Professional",
  "Home & Lifestyle",
  "Education & Training",
  "Events & Entertainment",
  "Retail & Shops",
  "Services",
];
const TOWNS = ["Douala", "Ngaoundéré"];
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const TIMES = Array.from({ length: 24 }).flatMap((_, i) => {
  const hour = i === 0 ? 12 : i > 12 ? i - 12 : i;
  const ampm = i >= 12 ? "PM" : "AM";
  return [`${hour}:00 ${ampm}`, `${hour}:30 ${ampm}`];
});

export default function BusinessPage() {
  const { id } = useParams();
  const router = useRouter();
  const db = useFirestore();
  const { user } = useUser();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [registryStep, setRegistryStep] = useState<"search" | "form">("search");
  const [isChecking, setIsChecking] = useState(false);
  const [checkError, setCheckError] = useState("");

  const businessRef = useMemoFirebase(
    () => (db && id ? doc(db, "businesses", id as string) : null),
    [db, id]
  );
  const { data: business, isLoading: isBusinessLoading } = useDoc<Enterprise>(businessRef);

  const [formData, setFormData] = useState({
    businessName: "",
    category: CATEGORIES[0],
    ceoName: "",
    employeeCount: "1-10",
    description: "",
    startDay: "Monday",
    stopDay: "Friday",
    openTime: "08:00 AM",
    closeTime: "06:00 PM",
    city: TOWNS[0],
    address: "",
    phoneNumber: "",
    whatsapp: "",
    email: "",
    website: "",
    logo: "",
    coverPhoto: "",
    latitude: 4.0511,
    longitude: 9.7679,
  });

  // Populate form if editing
  useEffect(() => {
    if (business) {
      const hoursParts = (business.hours || "").split(": ");
      const daysRange = (hoursParts[0] || "").split(" - ");
      const timesRange = (hoursParts[1] || "").split(" - ");

      setFormData({
        businessName: business.businessName || business.name || "",
        category: business.category || CATEGORIES[0],
        ceoName: business.ceoName || "",
        employeeCount: business.employeeCount || "1-10",
        description: business.description || "",
        startDay: daysRange[0] || "Monday",
        stopDay: daysRange[1] || "Friday",
        openTime: timesRange[0] || "08:00 AM",
        closeTime: timesRange[1] || "06:00 PM",
        city: business.city || TOWNS[0],
        address: business.address || "",
        phoneNumber: business.phoneNumber || "",
        whatsapp: business.whatsapp || "",
        email: business.email || "",
        website: business.website || "",
        logo: business.logo || "",
        coverPhoto: business.coverPhoto || "",
        latitude: business.latitude || 6.0511,
        longitude: business.longitude || 8.7679,
      });
      setRegistryStep("form");
    }
  }, [business]);

  // Check name availability
  const handleRegistryCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.businessName.trim() || !db) return;

    setIsChecking(true);
    setCheckError("");

    try {
      const q = query(collection(db, "businesses"), where("businessName", "==", formData.businessName));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        setCheckError("This name is already registered. Please choose another.");
      } else {
        setRegistryStep("form");
      }
    } catch {
      setRegistryStep("form");
    } finally {
      setIsChecking(false);
    }
  };

  // Handle image upload
  const handleImage = (e: React.ChangeEvent<HTMLInputElement>, field: "logo" | "coverPhoto") => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setFormData((prev) => ({ ...prev, [field]: reader.result as string }));
    reader.readAsDataURL(file);
  };

  // Submit business
  const finalize = () => {
    if (!user || !db) return;
    setIsSubmitting(true);

    const bizId = id || doc(collection(db, "businesses")).id;
    const data = {
      ...formData,
      id: bizId,
      name: formData.businessName,
      ownerId: user.uid,
      averageRating: 0,
      totalReviews: 0,
      isVerified: false,
      isActive: true,
      createdDate: new Date().toISOString(),
      hours: `${formData.startDay} - ${formData.stopDay}: ${formData.openTime} - ${formData.closeTime}`,
    };

    if (id) {
      updateDocumentNonBlocking(doc(db, "businesses", bizId), data);
      setTimeout(() => {
        setIsSubmitting(false);
        alert("Business Updated Successfully");
      }, 1000);
    } else {
      setDocumentNonBlocking(doc(db, "businesses", bizId), data, { merge: true });
      router.push(`/business/${bizId}?new=true`);
    }
  };

  if (isBusinessLoading)
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin w-10 h-10" />
      </div>
    );

  return (
    <div className="min-h-screen bg-white font-body pb-24">
      <Navbar />
      <div className="container mx-auto px-4 py-12 max-w-2xl space-y-10">
        <h1 className="text-3xl font-black uppercase text-center">{id ? "Edit Business" : "Add Business"}</h1>

        {/* Name check step */}
        {!id && registryStep === "search" ? (
          <div className="space-y-8 bg-[#F9F9FB] p-10 rounded-2xl border border-[#E5E5E1]">
            <h2 className="text-lg font-black uppercase text-center">Check Business Name</h2>
            <form onSubmit={handleRegistryCheck} className="space-y-6">
              <div className="relative">
                <Input
                  required
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  placeholder="Search name..."
                  className="h-14 pl-12 font-bold rounded-xl"
                  
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-20" />
              </div>
              {checkError && <p className="text-red-600 text-[11px] font-bold text-center uppercase">{checkError}</p>}
              <Button type="submit" className="w-full h-14" disabled={isChecking}>
                {isChecking ? <Loader2 className="animate-spin mx-auto" /> : "Check Availability"}
              </Button>
            </form>
          </div>
        ) : (
          // Form step
          <form onSubmit={(e) => { e.preventDefault(); setShowConfirm(true); }} className="space-y-8 bg-white p-10 rounded-2xl border border-[#E5E5E1] shadow-sm">
            {!id && (
              <div className="flex items-center gap-3 text-green-700">
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-[10px] font-black uppercase">Available: {formData.businessName}</span>
              </div>
            )}

            <div className="grid gap-6">
              {/* Business Name & CEO */}
              <div className="grid grid-cols-2 gap-4">
                <Input required value={formData.businessName} onChange={(e) => setFormData({ ...formData, businessName: e.target.value })} placeholder="Company Name *" className="h-12 rounded-xl font-bold" />
                <Input required value={formData.ceoName} onChange={(e) => setFormData({ ...formData, ceoName: e.target.value })} placeholder="CEO Name *" className="h-12 rounded-xl font-bold" />
              </div>

              {/* Category & Employee Count */}
              <div className="grid grid-cols-2 gap-4">
                <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                  <SelectTrigger className="h-12 rounded-xl font-bold"><SelectValue placeholder="Category *" /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
                <Select value={formData.employeeCount} onValueChange={(v) => setFormData({ ...formData, employeeCount: v })}>
                  <SelectTrigger className="h-12 rounded-xl font-bold"><SelectValue placeholder="Employee Count *" /></SelectTrigger>
                  <SelectContent>{["1-10","11-50","51-200","200+"].map(s => <SelectItem key={s} value={s}>{s} People</SelectItem>)}</SelectContent>
                </Select>
              </div>

              <Textarea required type="text" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Description *" className="min-h-25 rounded-xl font-bold italic" />

              {/* Contact info */}
              <Input required type="email" placeholder="Email *" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
              <Input placeholder="Website" value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} />
              <Input required placeholder="Phone Number *" value={formData.phoneNumber} onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })} />
              <Input required placeholder="WhatsApp Number *" value={formData.whatsapp} onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })} />

              <Select value={formData.city} onValueChange={(v) => setFormData({ ...formData, city: v })}>
                <SelectTrigger className="h-12 rounded-xl font-bold"><SelectValue placeholder="City *" /></SelectTrigger>
                <SelectContent>{TOWNS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
              <Input required placeholder="Address *" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />

              {/* Latitude & Longitude */}
              <div className="grid grid-cols-2 gap-4">
                <Input required type="number" step="0.0001" placeholder="Latitude *" value={formData.latitude} onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })} />
                <Input required type="number" step="0.0001" placeholder="Longitude *" value={formData.longitude} onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) })} />
              </div>

              {/* Images */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase flex items-center gap-2"><ImageIcon className="w-3 h-3" /> Logo *</label>
                  <input required type="file" accept="image/*" onChange={(e) => handleImage(e, "logo")} />
                  {formData.logo && <img src={formData.logo} className="h-20 w-20 object-contain border rounded-xl" alt="Logo" />}
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase flex items-center gap-2"><ImageIcon className="w-3 h-3" /> Cover Photo *</label>
                  <input required type="file" accept="image/*" onChange={(e) => handleImage(e, "coverPhoto")} />
                  {formData.coverPhoto && <img src={formData.coverPhoto} className="h-20 w-full object-cover border rounded-xl" alt="Cover" />}
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full h-16 mt-10">{id ? "Save Changes" : "Save Business"}</Button>
          </form>
        )}

        {/* Confirm Dialog */}
        <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
          <DialogContent hideClose className="sm:max-w-100 p-10 rounded-2xl border-none shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-black uppercase text-center">{id ? "Confirm Update?" : "Post Now?"}</DialogTitle>
              <DialogDescription className="text-[10px] font-bold uppercase opacity-40 text-center mt-2">
                {id ? `Updating ${formData.businessName}` : `Publishing ${formData.businessName}`}
              </DialogDescription>
            </DialogHeader>
            <div className="py-10 text-center space-y-4">
              <Button onClick={finalize} className="w-full h-16" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="animate-spin mx-auto" /> : "Confirm & Post"}
              </Button>
              <button onClick={() => setShowConfirm(false)} className="mt-4 text-[10px] font-black uppercase opacity-30">
                Back
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}