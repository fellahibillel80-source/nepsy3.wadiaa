"use client";

import type React from "react";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { apiPost } from "@/lib/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiGet } from "@/lib/api";
import { clearAllDeduplicationFlags } from "@/lib/result-deduplication";
import Link from "next/link";

type Child = {
  id: number;
  firstName: string;
  lastName: string;
  iq: number;
  gender?: string;
};

export default function RegistrationPage() {
  const [isStarted, setIsStarted] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [iq, setIq] = useState("");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [isLoading, setIsLoading] = useState(false);
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    apiGet<Child[]>("/children")
      .then((data) => {
        // Map gender from local storage fallback if not returned by backend
        const mapped = data.map((c) => ({
          ...c,
          gender: c.gender || localStorage.getItem(`child_gender_${c.id}`) || "male",
        }));
        setChildren(mapped);
      })
      .catch(() => {});
  }, []);

  const selectedChild = useMemo(
    () => children.find((c) => String(c.id) === selectedId) || null,
    [children, selectedId]
  );

  useEffect(() => {
    if (selectedChild) {
      const selectedGender = selectedChild.gender === "female" ? "female" : "male";
      setGender(selectedGender);
    }
  }, [selectedChild]);

  useEffect(() => {
    localStorage.setItem("tempGender", gender);
    window.dispatchEvent(new Event("gender-change"));
  }, [gender, selectedChild]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);

    if (selectedChild) {
      const finalGender = selectedChild.gender || gender;
      // Use existing child
      localStorage.setItem(
        "childData",
        JSON.stringify({
          id: selectedChild.id,
          firstName: selectedChild.firstName,
          lastName: selectedChild.lastName,
          iq: selectedChild.iq,
          gender: finalGender,
          startTime: new Date().toISOString(),
        })
      );
      localStorage.removeItem("tempGender");
      // Clear any previous test result deduplication flags
      clearAllDeduplicationFlags();
      router.push("/tests");
      return;
    }

    // Validate new child fields
    if (!firstName.trim() || !lastName.trim() || !iq.trim()) {
      alert("يرجى ملء جميع الحقول المطلوبة");
      setIsLoading(false);
      return;
    }

    const iqNumber = Number.parseInt(iq);
    if (isNaN(iqNumber) || iqNumber < 50 || iqNumber > 200) {
      alert("يرجى إدخال معدل ذكاء صحيح (50-200)");
      setIsLoading(false);
      return;
    }

    // Create child in backend and store child id locally
    try {
      const created = await apiPost("/children", {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        iq: iqNumber,
        gender: gender,
      });
      
      const finalGender = created.gender || gender;
      localStorage.setItem(`child_gender_${created.id}`, finalGender);

      localStorage.setItem(
        "childData",
        JSON.stringify({
          id: created.id,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          iq: iqNumber,
          gender: finalGender,
          startTime: new Date().toISOString(),
        })
      );
      localStorage.removeItem("tempGender");
      // Clear any previous test result deduplication flags
      clearAllDeduplicationFlags();
      router.push("/tests");
      return;
    } catch (err) {
      alert("فشل حفظ بيانات الطفل في الخادم");
      setIsLoading(false);
      return;
    }
  };

  if (!isStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-50 to-brand-100/50 flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl rounded-3xl border border-white/40 bg-white/85 backdrop-blur-md transition-all duration-500 hover:shadow-brand-500/10">
          <CardContent className="pt-8 text-center space-y-6">
            {/* Brain SVG Logo */}
            <div className="mx-auto w-24 h-24">
              <svg className="w-full h-full" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Left Half (Pink/Red) */}
                <path d="M100 30C75 30 55 45 50 70C45 72 40 80 40 90C40 100 45 105 48 108C45 112 42 120 45 130C48 140 58 150 70 152C75 162 88 170 100 170" stroke="url(#pinkGrad)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M75 60C65 70 65 90 75 100" stroke="url(#pinkGrad)" strokeWidth="6" strokeLinecap="round" />
                <path d="M90 50C80 65 80 115 90 130" stroke="url(#pinkGrad)" strokeWidth="6" strokeLinecap="round" />
                <path d="M60 110C65 120 75 130 85 135" stroke="url(#pinkGrad)" strokeWidth="6" strokeLinecap="round" />
                
                {/* Right Half (Blue) */}
                <path d="M100 30C125 30 145 45 150 70C155 72 160 80 160 90C160 100 155 105 152 108C155 112 158 120 155 130C152 140 142 150 130 152C125 162 112 170 100 170" stroke="url(#blueGrad)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M125 60C135 70 135 90 125 100" stroke="url(#blueGrad)" strokeWidth="6" strokeLinecap="round" />
                <path d="M110 50C120 65 120 115 110 130" stroke="url(#blueGrad)" strokeWidth="6" strokeLinecap="round" />
                <path d="M140 110C135 120 125 130 115 135" stroke="url(#blueGrad)" strokeWidth="6" strokeLinecap="round" />

                {/* Center line */}
                <line x1="100" y1="40" x2="100" y2="160" stroke="#a855f7" strokeWidth="4" strokeDasharray="6 8" strokeLinecap="round" opacity="0.7" />

                {/* Neural Network Dots */}
                <circle cx="50" cy="70" r="5" fill="#db2777" />
                <circle cx="150" cy="70" r="5" fill="#2563eb" />
                <circle cx="70" cy="152" r="5" fill="#ec4899" />
                <circle cx="130" cy="152" r="5" fill="#3b82f6" />
                <circle cx="100" cy="30" r="6" fill="#a855f7" />
                <circle cx="100" cy="170" r="6" fill="#a855f7" />

                <defs>
                  <linearGradient id="pinkGrad" x1="40" y1="30" x2="100" y2="170" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#ec4899" />
                    <stop offset="100%" stopColor="#db2777" />
                  </linearGradient>
                  <linearGradient id="blueGrad" x1="160" y1="30" x2="100" y2="170" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#2563eb" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* Platform Text */}
            <div className="space-y-2 py-2">
              <h1 className="text-5xl font-black tracking-normal leading-tight bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent filter drop-shadow-sm select-none">
                Nepsy 3.Wadiaa
              </h1>
            </div>

            {/* Three Dots */}
            <div className="flex justify-center space-x-2 space-x-reverse">
              <span className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-pulse" />
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse delay-75" />
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse delay-150" />
            </div>

            {/* Start Button */}
            <div className="pt-4">
              <Button
                onClick={() => setIsStarted(true)}
                className="w-full text-xl font-extrabold py-7 px-8 rounded-2xl text-white shadow-xl bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 hover:from-pink-600 hover:via-purple-600 hover:to-blue-600 transition-all duration-300 transform hover:scale-105 hover:shadow-purple-500/30 active:scale-98 flex items-center justify-center gap-4 cursor-pointer"
              >
                {/* Left Arrow Icon representing start */}
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>ابدأ التقييم مباشرة</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="mt-8 text-xs text-gray-400/80 font-medium tracking-wide">
          Nepsy 3 Wadiaa 2025 © جميع الحقوق محفوظة
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-brand-100/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-brand-600 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800">
            تقييم الوظائف المعرفية و اللغة
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                اختر طفلًا موجودًا
              </Label>
              <Select value={selectedId} onValueChange={setSelectedId}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر من القائمة (اختياري)" />
                </SelectTrigger>
                <SelectContent>
                  {children.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.firstName} {c.lastName} (IQ {c.iq}) ({c.gender === "female" ? "أنثى" : "ذكر"})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedChild ? (
                <div className="text-sm text-brand-700">
                  تم اختيار: {selectedChild.firstName} {selectedChild.lastName} ({selectedChild.gender === "female" ? "أنثى" : "ذكر"})
                </div>
              ) : (
                <div className="text-sm text-gray-500">
                  أو أضف طفلًا جديدًا بالأسفل
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="firstName"
                className="text-sm font-medium text-gray-700"
              >
                الاسم الأول *
              </Label>
              <Input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="أدخل الاسم الأول للطفل"
                className="text-right"
                disabled={!!selectedChild}
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="lastName"
                className="text-sm font-medium text-gray-700"
              >
                اسم العائلة *
              </Label>
              <Input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="أدخل اسم العائلة"
                className="text-right"
                disabled={!!selectedChild}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="iq" className="text-sm font-medium text-gray-700">
                معدل الذكاء (IQ) *
              </Label>
              <Input
                id="iq"
                type="number"
                min="50"
                max="200"
                value={iq}
                onChange={(e) => setIq(e.target.value)}
                placeholder="أدخل معدل الذكاء (50-200)"
                className="text-right"
                disabled={!!selectedChild}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                الجنس *
              </Label>
              <Select
                value={gender}
                onValueChange={(val) => setGender(val as "male" | "female")}
                disabled={!!selectedChild}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر الجنس" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">ذكر</SelectItem>
                  <SelectItem value="female">أنثى</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              type="submit"
              className="w-full bg-brand-600 hover:bg-brand-700 text-white font-medium py-3"
              disabled={isLoading}
            >
              {isLoading ? "جاري التحضير..." : "بدء الاختبار"}
            </Button>
          </form>

          <div className="mt-4 flex justify-center">
            <Link href="/children-results">
              <Button variant="outline">عرض جميع النتائج</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
