"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { apiPost } from "@/lib/api";

type FaceMemoryTestResults = {
  testType: string;
  childName: string;
  childIQ: string;
  correct?: number;
  incorrect?: number;
  ignored?: number;
  totalScore?: number;
  totalPhotos?: number;
  completedAt: string;

  exposure?: {
    correct: number;
    incorrect: number;
    ignored: number;
    total: number;
  };
  recognition?: {
    correct: number;
    incorrect: number;
    ignored: number;
    total: number;
  };
};

export default function FaceMemoryResultsPage() {
  const router = useRouter();
  const [results, setResults] = useState<FaceMemoryTestResults | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const savedResults = localStorage.getItem("fourthTestResults");
      if (savedResults) {
        const parsed = JSON.parse(savedResults);
        setResults(parsed);
        const child = JSON.parse(localStorage.getItem("childData") || "null");
        if (child?.id) {
          const guardKey = `resultPosted:test1-4:${child.id}`;
          if (sessionStorage.getItem(guardKey) !== "1") {
            const isMerged = parsed.testType === "face-memory-merged" || "exposure" in parsed;
            const correct = isMerged ? parsed.recognition.correct : (parsed.correct ?? 0);
            const incorrect = isMerged ? parsed.recognition.incorrect : (parsed.incorrect ?? 0);
            const ignored = isMerged ? parsed.recognition.ignored : (parsed.ignored ?? 0);
            const total = isMerged ? parsed.recognition.total : (parsed.totalPhotos ?? 16);

            void apiPost("/results", {
              childId: child.id,
              testKey: "إختبار الذاكرة البصرية 1",
              correct,
              incorrect,
              ignored,
              total,
            })
              .then(() => sessionStorage.setItem(guardKey, "1"))
              .catch(() => {});
          }
        }
      }
    } catch (error) {
      console.error("Failed to parse results from localStorage", error);
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        جاري تحميل النتائج...
      </div>
    );
  }

  if (!results) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir="rtl">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>خطأ</CardTitle>
          </CardHeader>
          <CardContent>
            <p>لم يتم العثور على نتائج الاختبار.</p>
            <Button onClick={() => router.push("/")} className="mt-4">
              العودة إلى البداية
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isMerged = results.testType === "face-memory-merged" || "exposure" in results;

  const exposureCorrect = isMerged ? results.exposure!.correct : (results.correct ?? 0);
  const exposureIncorrect = isMerged ? results.exposure!.incorrect : (results.incorrect ?? 0);
  const exposureIgnored = isMerged ? results.exposure!.ignored : (results.ignored ?? 0);
  const exposureTotal = isMerged ? results.exposure!.total : (results.totalPhotos ?? 16);

  const recogCorrect = isMerged ? results.recognition!.correct : null;
  const recogIncorrect = isMerged ? results.recognition!.incorrect : null;
  const recogIgnored = isMerged ? results.recognition!.ignored : null;
  const recogTotal = isMerged ? results.recognition!.total : null;

  return (
    <div
      className="min-h-screen bg-background p-8 flex flex-col items-center justify-center"
      dir="rtl"
    >
      <div className="max-w-6xl mx-auto w-full">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-3xl text-center">
              نتائج إختبار الذاكرة البصرية 1
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4">
                الجدول التالي يوضح كيفية تسجيل نقاط إختبار الذاكرة البصرية 1:
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-border">
                  <thead>
                    <tr className="bg-muted">
                      <th className="border border-border p-3 text-right">
                        المرحلة
                      </th>
                      <th className="border border-border p-3 text-center">
                        الإجابات الصحيحة
                      </th>
                      <th className="border border-border p-3 text-center">
                        الإجابات الخاطئة
                      </th>
                      <th className="border border-border p-3 text-center">
                        الإجابات المنسية
                      </th>
                      <th className="border border-border p-3 text-center">
                        النقاط الخام
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-border p-3 font-medium">
                        المرحلة الأولى: عرض الصور وتذكرها
                      </td>
                      <td className="border border-border p-3 text-center">
                        {exposureCorrect}/{exposureTotal}
                      </td>
                      <td className="border border-border p-3 text-center">
                        {exposureIncorrect}
                      </td>
                      <td className="border border-border p-3 text-center">
                        {exposureIgnored}
                      </td>
                      <td className="border border-border p-3 text-center font-bold">
                        {exposureCorrect - exposureIncorrect}
                      </td>
                    </tr>
                    {isMerged && (
                      <tr>
                        <td className="border border-border p-3 font-medium">
                          المرحلة الثانية: التعرف الفوري (اختيار الصور)
                        </td>
                        <td className="border border-border p-3 text-center">
                          {recogCorrect}/{recogTotal}
                        </td>
                        <td className="border border-border p-3 text-center">
                          {recogIncorrect}
                        </td>
                        <td className="border border-border p-3 text-center">
                          {recogIgnored}
                        </td>
                        <td className="border border-border p-3 text-center font-bold">
                          {recogCorrect! - recogIncorrect!}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="flex justify-center mt-6">
          <Button
            onClick={() => router.push("/tests")}
            size="lg"
            className="bg-black text-white hover:bg-gray-800"
          >
            الذهاب إلى صفحة الاختبارات
            <ArrowRight className="w-4 h-4 mr-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
