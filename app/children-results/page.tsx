"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { apiGet } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Child = {
  id: number;
  firstName: string;
  lastName: string;
  iq: number;
  gender?: string;
};

type Result = {
  id: number;
  testKey: string;
  correct: number;
  incorrect: number;
  ignored: number;
  total: number;
  createdAt: string;
};

const ALL_TESTS = [
  { testKey: "اختبار الانتباه البصري1", title: "اختبار الانتباه البصري 1" },
  { testKey: "اختبار الانتباه البصري2", title: "اختبار الانتباه البصري 2" },
  { testKey: "اختبار الانتباه السمعي1", title: "اختبار الانتباه السمعي 1" },
  { testKey: "اختبار الانتباه السمعي2", title: "اختبار الانتباه السمعي 2" },
  { testKey: "إختبار الذاكرة البصرية 1", title: "إختبار الذاكرة البصرية 1" },
  { testKey: "إختبار الذاكرة البصرية 2", title: "إختبار الذاكرة البصرية 2" },
  { testKey: "اختبار الذاكرة السمعية 1", title: "اختبار الذاكرة السمعية 1" },
  { testKey: "اختبار الذاكرة السمعية 2", title: "اختبار الذاكرة السمعية 2" },
  { testKey: "test1-8", title: "اختبار الإدراك السمعي 1" },
  { testKey: "test1-9", title: "اختبار الإدراك السمعي 2" },
  { testKey: "test1-10", title: "اختبار الإدراك السمعي 3" },
  { testKey: "test1-11", title: "اختبار الإدراك البصري 1" },
  { testKey: "test1-12", title: "اختبار الإغلاق البصري 2" },
  { testKey: "test1-13", title: "لاستقبال المعجمي" },
  { testKey: "test1-14", title: "انتاج المعجمي 1" },
  { testKey: "test1-15", title: "انتاج المعجمي2" },
  { testKey: "test1-16", title: "تكرار الكلمات" },
  { testKey: "test1-17", title: "اختبار الفهم1" },
  { testKey: "test1-18", title: "اختبار فهم 2" },
  { testKey: "test1-19", title: "اختبار تكرار كلمات" }
];

export default function ChildrenResultsPage() {
  const router = useRouter();
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [results, setResults] = useState<Result[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let ignore = false;
    apiGet<Child[]>("/children")
      .then((data) => {
        if (!ignore) {
          const mapped = data.map((c) => ({
            ...c,
            gender: c.gender || localStorage.getItem(`child_gender_${c.id}`) || "male",
          }));
          setChildren(mapped);
        }
      })
      .catch(() => {})
      .finally(() => {});
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setResults(null);
      return;
    }
    setLoading(true);
    apiGet<Result[]>(`/children/${selectedId}/results`)
      .then((data) => setResults(data))
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, [selectedId]);

  const selectedChild = useMemo(
    () => children.find((c) => String(c.id) === selectedId) || null,
    [children, selectedId]
  );

  // Deduplicate results - remove duplicates with same values and timestamps within 1 second
  const deduplicatedResults = useMemo(() => {
    if (!results || results.length === 0) return results;

    const deduplicated: Result[] = [];
    const seen = new Set<string>();

    for (const result of results) {
      // Create a key based on all values except timestamp
      const valueKey = `${result.testKey}-${result.correct}-${result.incorrect}-${result.ignored}-${result.total}`;

      // Check if we've seen this exact combination before
      if (!seen.has(valueKey)) {
        seen.add(valueKey);
        deduplicated.push(result);
      } else {
        // Check if this is a duplicate within 1 second of an existing result
        const existingResult = deduplicated.find(
          (r) =>
            r.testKey === result.testKey &&
            r.correct === result.correct &&
            r.incorrect === result.incorrect &&
            r.ignored === result.ignored &&
            r.total === result.total
        );

        if (existingResult) {
          const timeDiff = Math.abs(
            new Date(result.createdAt).getTime() -
              new Date(existingResult.createdAt).getTime()
          );

          // If within 1 second (1000ms), skip this duplicate
          if (timeDiff <= 1000) {
            continue;
          }
        }

        // If not a duplicate, add it
        deduplicated.push(result);
      }
    }

    // Sort by creation date (newest first)
    return deduplicated.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [results]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-brand-100/30 p-6 print:bg-white print:text-black print:p-0 print:min-h-0" dir="rtl">
      <div className="max-w-5xl mx-auto space-y-6 print:max-w-full print:w-full print:m-0 print:p-0">
        {/* Printable Header (visible on print only) */}
        <div className="hidden print:block text-center mb-6">
          <h1 className="text-3xl font-bold mb-1">تقرير نتائج تقييم NEPSY-III</h1>
          <p className="text-sm text-gray-500">تم استخراج التقرير في: {new Date().toLocaleString()}</p>
        </div>

        <Card className="print:hidden">
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <CardTitle className="text-2xl">نتائج طفل محدد</CardTitle>
              <Button
                variant="outline"
                onClick={() => router.back()}
                className="flex items-center gap-2"
              >
                ← العودة للصفحة السابقة
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="max-w-sm">
              <Select value={selectedId} onValueChange={setSelectedId}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر طفلًا" />
                </SelectTrigger>
                <SelectContent>
                  {children.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.firstName} {c.lastName} (IQ {c.iq}) ({c.gender === "female" ? "أنثى" : "ذكر"})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {selectedChild && (
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 bg-brand-50/50 rounded-xl border border-brand-100/80 shadow-sm print:bg-slate-50 print:border-slate-300 print:p-4 print:my-4">
            <div className="space-y-3">
              <div className="text-2xl font-bold text-gray-800 print:text-black">
                اسم الطفل: {selectedChild.firstName} {selectedChild.lastName}
              </div>
              <div className="flex flex-wrap gap-4 text-base text-gray-600 print:text-black">
                <span className="bg-white px-3 py-1.5 rounded-full border border-gray-100 shadow-sm print:border-slate-300">
                  الجنس: {selectedChild.gender === "female" ? "أنثى 👧" : "ذكر 👦"}
                </span>
                <span className="bg-white px-3 py-1.5 rounded-full border border-gray-100 shadow-sm print:border-slate-300">
                  درجة الذكاء (IQ): {selectedChild.iq}
                </span>
              </div>
            </div>
            
            {/* QR Code and Actions */}
            <div className="flex items-center gap-6 bg-white p-4 rounded-xl border border-gray-100 shadow-sm print:border-slate-300">
              <div className="text-center space-y-1.5">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(
                    typeof window !== "undefined"
                      ? `${window.location.origin}/tests?childId=${selectedId}`
                      : ""
                  )}`}
                  alt="QR Code"
                  className="w-28 h-28 mx-auto print:w-24 print:h-24"
                />
                <div className="text-xs text-muted-foreground max-w-[160px] font-medium leading-relaxed print:text-black">
                  امسح الرمز للانتقال السريع لملف الطفل
                </div>
              </div>
              <div className="flex flex-col gap-2 print:hidden">
                <Button
                  onClick={() => window.print()}
                  className="bg-brand-600 hover:bg-brand-700 text-white font-semibold flex items-center gap-2 px-5 py-2.5 rounded-lg shadow-sm"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  طباعة التقرير (PDF)
                </Button>
              </div>
            </div>
          </div>
        )}

        <Card className="print:border-none print:shadow-none">
          <CardHeader className="print:hidden">
            <CardTitle className="text-xl">قائمة النتائج</CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedId ? (
              <div className="text-muted-foreground print:hidden">
                الرجاء اختيار طفل لعرض النتائج.
              </div>
            ) : loading ? (
              <div className="print:hidden">جارٍ التحميل...</div>
            ) : (
              <div className="space-y-4">
                {results && results.length !== (deduplicatedResults?.length ?? 0) && (
                  <div className="text-sm text-muted-foreground bg-brand-50 p-3 rounded-lg border print:hidden">
                    تم إزالة {results.length - (deduplicatedResults?.length ?? 0)} نتيجة
                    مكررة من {results.length} نتيجة إجمالية
                  </div>
                )}
                <div className="overflow-x-auto print:overflow-visible">
                  <table className="w-full border-collapse border border-border text-sm print:border-slate-400">
                    <thead>
                      <tr className="bg-muted print:bg-slate-100 print:text-black">
                        <th className="border border-border p-2 text-center print:border-slate-400 print:p-1.5 print:text-xs print:font-bold">
                          التاريخ
                        </th>
                        <th className="border border-border p-2 text-center print:border-slate-400 print:p-1.5 print:text-xs print:font-bold">
                          الاختبار
                        </th>
                        <th className="border border-border p-2 text-center print:border-slate-400 print:p-1.5 print:text-xs print:font-bold">
                          صحيح
                        </th>
                        <th className="border border-border p-2 text-center print:border-slate-400 print:p-1.5 print:text-xs print:font-bold">
                          خطأ
                        </th>
                        <th className="border border-border p-2 text-center print:border-slate-400 print:p-1.5 print:text-xs print:font-bold">
                          متجاهل
                        </th>
                        <th className="border border-border p-2 text-center print:border-slate-400 print:p-1.5 print:text-xs print:font-bold">
                          الإجمالي
                        </th>
                        <th className="border border-border p-2 text-center print:border-slate-400 print:p-1.5 print:text-xs print:font-bold">
                          الدقة
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {ALL_TESTS.map((item) => {
                        const resultsList = deduplicatedResults || [];
                        const testResults = resultsList.filter(
                          (r) => r.testKey === item.testKey || r.testKey === item.title
                        );

                        if (testResults.length > 0) {
                          return testResults.map((r) => {
                            const accDen = r.correct + r.incorrect;
                            const acc = accDen > 0 ? Math.round((r.correct / accDen) * 100) : 0;
                            return (
                              <tr key={r.id}>
                                <td className="border border-border p-2 text-center print:border-slate-400 print:p-1.5 print:text-xs">
                                  {new Date(r.createdAt).toLocaleString()}
                                </td>
                                <td className="border border-border p-2 text-center font-medium print:border-slate-400 print:p-1.5 print:text-xs">
                                  {item.title}
                                </td>
                                <td className="border border-border p-2 text-center text-green-600 font-bold print:border-slate-400 print:p-1.5 print:text-xs print:text-black">
                                  {r.correct}
                                </td>
                                <td className="border border-border p-2 text-center text-red-500 print:border-slate-400 print:p-1.5 print:text-xs print:text-black">
                                  {r.incorrect}
                                </td>
                                <td className="border border-border p-2 text-center text-gray-400 print:border-slate-400 print:p-1.5 print:text-xs print:text-black">
                                  {r.ignored}
                                </td>
                                <td className="border border-border p-2 text-center font-bold print:border-slate-400 print:p-1.5 print:text-xs">
                                  {r.total}
                                </td>
                                <td className="border border-border p-2 text-center font-semibold print:border-slate-400 print:p-1.5 print:text-xs">
                                  {acc}%
                                </td>
                              </tr>
                            );
                          });
                        } else {
                          return (
                            <tr key={item.testKey} className="opacity-60 bg-slate-50/50 print:opacity-100">
                              <td className="border border-border p-2 text-center text-muted-foreground print:text-black print:border-slate-400 print:p-1.5 print:text-xs">
                                لم يجرى
                              </td>
                              <td className="border border-border p-2 text-center font-medium text-muted-foreground print:text-black print:border-slate-400 print:p-1.5 print:text-xs">
                                {item.title}
                              </td>
                              <td className="border border-border p-2 text-center text-muted-foreground print:text-black print:border-slate-400 print:p-1.5 print:text-xs">-</td>
                              <td className="border border-border p-2 text-center text-muted-foreground print:text-black print:border-slate-400 print:p-1.5 print:text-xs">-</td>
                              <td className="border border-border p-2 text-center text-muted-foreground print:text-black print:border-slate-400 print:p-1.5 print:text-xs">-</td>
                              <td className="border border-border p-2 text-center text-muted-foreground print:text-black print:border-slate-400 print:p-1.5 print:text-xs">-</td>
                              <td className="border border-border p-2 text-center text-muted-foreground print:text-black print:border-slate-400 print:p-1.5 print:text-xs">-</td>
                            </tr>
                          );
                        }
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
