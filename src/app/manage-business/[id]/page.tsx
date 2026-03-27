/* eslint-disable @next/next/no-img-element */
"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useUser,
  useFirestore,
  useDoc,
  useMemoFirebase,
  updateDocumentNonBlocking,
} from "@/firebase";
import { doc } from "firebase/firestore";
import { Loader2, ArrowLeft } from "lucide-react";
import { Enterprise } from "@/app/lib/types";

const CATEGORIES = [
  "Food & Hospitality",
  "Health & Wellness",
  "Technology & IT",
  "Business & Professional",
  "Home & Lifestyle",
  "Creative & Media",
  "Education & Training",
  "Events & Entertainment",
  "Services",
];
const TOWNS = ["Douala", "Ngaoundéré"];
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const TIMES = Array.from({ length: 24 }).flatMap((_, i) => {
  const hour = i === 0 ? 12 : i > 12 ? i - 12 : i;
  const ampm = i >= 12 ? "PM" : "AM";
  return [`${hour}:00 ${ampm}`, `${hour}:30 ${ampm}`];
});

export default function ManagementConsolePage() {
  const { id } = useParams();
  const router = useRouter();
  const db = useFirestore();
  const { user } = useUser();
  const [isUpdating, setIsUpdating] = useState(false);

  const businessRef = useMemoFirebase(
    () => (db && id ? doc(db, "businesses", id as string) : null),
    [db, id]
  );
  const { data: business, isLoading: isBusinessLoading } = useDoc<Enterprise>(businessRef);

  const [formData, setFormData] = useState({
    businessName: "",
    category: "Food & Hospitality",
    ceoName: "",
    employeeCount: "1-10",
    description: "",
    startDay: "Monday",
    stopDay: "Friday",
    openTime: "08:00 AM",
    closeTime: "06:00 PM",
    city: "Douala",
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

  // Populate form when business loads
  useEffect(() => {
    if (business) {
      const hoursParts = (business.hours || "").split(": ");
      const daysRange = (hoursParts[0] || "").split(" - ");
      const timesRange = (hoursParts[1] || "").split(" - ");

      setFormData({
        businessName: business.businessName || business.name || "",
        category: business.category || "Food & Hospitality",
        ceoName: business.ceoName || "",
        employeeCount: business.employeeCount || "1-10",
        description: business.description || "",
        startDay: daysRange[0] || "Monday",
        stopDay: daysRange[1] || "Friday",
        openTime: timesRange[0] || "08:00 AM",
        closeTime: timesRange[1] || "06:00 PM",
        city: business.city || "Douala",
        address: business.address || "",
        phoneNumber: business.phoneNumber || "",
        whatsapp: business.whatsapp || "",
        email: business.email || "",
        website: business.website || "",
        logo: business.logo || "",
        coverPhoto: business.coverPhoto || "",
        latitude: business.latitude || 4.0511,
        longitude: business.longitude || 9.7679,
      });
    }
  }, [business]);

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>, field: "logo" | "coverPhoto") => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setFormData((prev) => ({ ...prev, [field]: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !business) return;
    setIsUpdating(true);
    const hours = `${formData.startDay} - ${formData.stopDay}: ${formData.openTime} - ${formData.closeTime}`;
    updateDocumentNonBlocking(doc(db, "businesses", business.id), {
      ...formData,
      name: formData.businessName,
      hours,
      updatedAt: new Date().toISOString(),
    });
    setTimeout(() => {
      setIsUpdating(false);
      alert("Changes Saved Successfully");
    }, 1000);
  };

  if (isBusinessLoading)
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin w-10 h-10" />
      </div>
    );

  if (!business || (user && business.ownerId !== user.uid))
    return (
      <div className="h-screen flex items-center justify-center font-black uppercase text-xs">
        No Access sorry
      </div>
    );

  return (
    <div className="min-h-screen bg-white font-body pb-24">
      <Navbar />

      <div className="border-b border-[#E5E5E1] py-6 md:py-10">
        <div className="container mx-auto px-4 max-w-5xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="w-10 h-10 border border-[#E5E5E1] flex items-center justify-center rounded-xl hover:bg-muted transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl md:text-2xl font-black uppercase truncate">{formData.businessName}</h1>
          </div>
          <Button
            onClick={handleSave}
            disabled={isUpdating}
            className="h-12 bg-secondary text-white font-black uppercase text-[10px] px-6 md:px-8 rounded-xl shadow-lg hover:bg-black transition-all"
          >
            {isUpdating ? <Loader2 className="animate-spin w-4 h-4" /> : "Save Changes"}
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-6 md:mt-10 max-w-2xl space-y-8">
        <form onSubmit={handleSave} className="bg-white p-6 md:p-8 rounded-2xl border border-[#E5E5E1] space-y-6 md:space-y-8">
          {/* Business Name & CEO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase opacity-50">Company Name *</label>
              <Input
                required
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                className="h-12 border border-[#E5E5E1] rounded-xl font-bold"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase opacity-50">Boss Name *</label>
              <Input
                required
                value={formData.ceoName}
                onChange={(e) => setFormData({ ...formData, ceoName: e.target.value })}
                className="h-12 border border-[#E5E5E1] rounded-xl font-bold"
              />
            </div>
          </div>

          {/* Category & Employees */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase opacity-50">Category *</label>
              <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                <SelectTrigger className="h-12 border border-[#E5E5E1] rounded-xl font-bold">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase opacity-50">Employee Count *</label>
              <Select
                value={formData.employeeCount}
                onValueChange={(v) => setFormData({ ...formData, employeeCount: v })}
              >
                <SelectTrigger className="h-12 border border-[#E5E5E1] rounded-xl font-bold">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {["1-10", "11-50", "51-200", "200+"].map((size) => (
                    <SelectItem key={size} value={size}>
                      {size} People
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase opacity-50">About the Work *</label>
            <Textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="min-h-25 border border-[#E5E5E1] rounded-xl font-bold italic"
              placeholder="Tell us more about your business..."
            />
          </div>

          {/* Operating Times */}
          <div className="pt-4 border-t border-[#E5E5E1] space-y-2">
            <label className="text-[10px] font-black uppercase text-primary">Operating Times</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
              <Select value={formData.startDay} onValueChange={(v) => setFormData({ ...formData, startDay: v })}>
                <SelectTrigger className="h-10 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DAYS.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={formData.stopDay} onValueChange={(v) => setFormData({ ...formData, stopDay: v })}>
                <SelectTrigger className="h-10 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DAYS.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={formData.openTime} onValueChange={(v) => setFormData({ ...formData, openTime: v })}>
                <SelectTrigger className="h-10 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIMES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={formData.closeTime} onValueChange={(v) => setFormData({ ...formData, closeTime: v })}>
                <SelectTrigger className="h-10 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIMES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              required
              type="email"
              placeholder="Business Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <Input
              placeholder="Website"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              required
              placeholder="Phone Number"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            />
            <Input
              required
              placeholder="WhatsApp Number"
              value={formData.whatsapp}
              onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
            />
          </div>

          {/* Town & Address */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select value={formData.city} onValueChange={(v) => setFormData({ ...formData, city: v })}>
              <SelectTrigger className="h-12 border border-[#E5E5E1] rounded-xl font-bold">
                <SelectValue placeholder="Town" />
              </SelectTrigger>
              <SelectContent>
                {TOWNS.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              required
              placeholder="Address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>

          {/* Location: Latitude & Longitude */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              type="number"
              step="0.0001"
              placeholder="Latitude"
              value={formData.latitude}
              onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
            />
            <Input
              type="number"
              step="0.0001"
              placeholder="Longitude"
              value={formData.longitude}
              onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
            />
          </div>

          {/* Images */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase opacity-50">Logo</label>
              <input type="file" accept="image/*" onChange={(e) => handleImage(e, "logo")} />
              {formData.logo && <img src={formData.logo} className="h-16 mt-2 rounded-xl border" alt="logo" />}
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase opacity-50">Cover Photo</label>
              <input type="file" accept="image/*" onChange={(e) => handleImage(e, "coverPhoto")} />
              {formData.coverPhoto && <img src={formData.coverPhoto} className="h-16 mt-2 rounded-xl border" alt="cover" />}
            </div>
          </div>

          <Button type="submit" disabled={isUpdating} className="w-full h-14 bg-primary text-white font-black uppercase rounded-xl shadow-lg hover:bg-black transition-all">
            {isUpdating ? <Loader2 className="animate-spin" /> : "Save Changes"}
          </Button>
        </form>
      </div>
    </div>
  );
}