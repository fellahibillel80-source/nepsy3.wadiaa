"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiGet } from "@/lib/api";

type Result = {
  id: number;
  testKey: string;
  correct: number;
  incorrect: number;
  ignored: number;
  total: number;
  createdAt: string;
};

const tests = [
  {
    key: "test1-1",
    title: "اختبار الانتباه البصري1",
    testKey: "اختبار الانتباه البصري1",
    startHref: "/test1-1/visual-search",
    resultsHref: "/test1-1/results",
  },
  {
    key: "test1-2",
    title: "اختبار الانتباه البصري2",
    testKey: "اختبار الانتباه البصري2",
    startHref: "/test1-2/faces-search",
    resultsHref: "/test1-2/results",
  },
  {
    key: "test1-3",
    title: "اختبار الانتباه السمعي1",
    testKey: "اختبار الانتباه السمعي1",
    startHref: "/test1-3/auditory-attention-test",
    resultsHref: "/test1-3/results",
  },
  {
    key: "test1-3b",
    title: "اختبار الانتباه السمعي2",
    testKey: "اختبار الانتباه السمعي2",
    startHref: "/test1-3/auditory-attention-test",
    resultsHref: "/test1-3/results",
  },
  {
    key: "test1-4",
    title: "إختبار الذاكرة البصرية 1",
    testKey: "إختبار الذاكرة البصرية 1",
    startHref: "/test1-4/face-memory",
    resultsHref: "/test1-4/results",
  },
  {
    key: "test1-5",
    title: "إختبار الذاكرة البصرية 2",
    testKey: "إختبار الذاكرة البصرية 2",
    startHref: "/test1-5/face-choose",
    resultsHref: "/test1-5/results",
  },
  {
    key: "test1-6",
    title: "اختبار الذاكرة السمعية 1",
    testKey: "اختبار الذاكرة السمعية 1",
    startHref: "/test1-6/name-learn",
    resultsHref: "/test1-6/results",
  },
  {
    key: "test1-7",
    title: "اختبار الذاكرة السمعية 2",
    testKey: "اختبار الذاكرة السمعية 2",
    startHref: "/test1-7/name-memo",
    resultsHref: "/test1-7/results",
  },
  // External tests hosted on rapport app
  {
    key: "test1-8",
    title: "اختبار الإدراك السمعي 1",
    external: true,
    screen: "test1-8",
    resultsHref: "/children-results",
  },
  {
    key: "test1-9",
    title: "اختبار الإدراك السمعي 2",
    external: true,
    screen: "test1-9",
    resultsHref: "/children-results",
  },
  {
    key: "test1-10",
    title: "اختبار الإدراك السمعي 3",
    external: true,
    screen: "test1-10",
    resultsHref: "/children-results",
  },
  {
    key: "test1-11",
    title: "اختبار الإدراك البصري 1",
    external: true,
    screen: "test1-11",
    resultsHref: "/children-results",
  },
  {
    key: "test1-12",
    title: "اختبار الإغلاق البصري 2",
    external: true,
    screen: "test1-12",
    resultsHref: "/children-results",
  },
  {
    key: "test1-13",
    title: "لاستقبال المعجمي",
    external: true,
    screen: "test1-13",
    resultsHref: "/children-results",
  },
  {
    key: "test1-14",
    title: "انتاج المعجمي 1",
    external: true,
    screen: "test1-14",
    resultsHref: "/children-results",
  },
  {
    key: "test1-15",
    title: "انتاج المعجمي2",
    external: true,
    screen: "test1-15",
    resultsHref: "/children-results",
  },
  {
    key: "test1-16",
    title: "تكرار الكلمات",
    external: true,
    screen: "test1-16",
    resultsHref: "/children-results",
  },
  {
    key: "test1-17",
    title: "اختبار الفهم1",
    external: true,
    screen: "test1-17",
    resultsHref: "/children-results",
  },
  {
    key: "test1-18",
    title: "اختبار فهم 2",
    external: true,
    screen: "test1-18",
    resultsHref: "/children-results",
  },
  {
    key: "test1-19",
    title: "اختبار تكرار كلمات",
    external: true,
    screen: "test1-19",
    resultsHref: "/children-results",
  },
];

export default function TestsHubPage() {
  const [byTestKey, setByTestKey] = useState<
    Record<string, Result | undefined>
  >({});
  const [childId, setChildId] = useState<number | null>(null);
  const [childName, setChildName] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const queryChildId = urlParams.get("childId");

      const loadResultsForChild = (cId: number, name?: string) => {
        setChildId(cId);
        if (name) setChildName(name);
        apiGet<Result[]>(`/children/${cId}/results`)
          .then((list) => {
            const map: Record<string, Result> = {};
            for (const r of list) {
              const prev = map[r.testKey];
              if (!prev || new Date(r.createdAt) > new Date(prev.createdAt)) {
                map[r.testKey] = r;
              }
            }
            setByTestKey(map);
          })
          .catch(() => {});
      };

      if (queryChildId) {
        const cId = parseInt(queryChildId, 10);
        if (!isNaN(cId)) {
          apiGet<any[]>("/children")
            .then((list) => {
              const foundChild = list.find((c) => c.id === cId);
              if (foundChild) {
                const fullName = `${foundChild.firstName} ${foundChild.lastName}`;
                localStorage.setItem(
                  "childData",
                  JSON.stringify({
                    id: foundChild.id,
                    firstName: foundChild.firstName,
                    lastName: foundChild.lastName,
                    iq: foundChild.iq,
                    gender: foundChild.gender || localStorage.getItem(`child_gender_${foundChild.id}`) || "male",
                    startTime: new Date().toISOString(),
                  })
                );
                window.dispatchEvent(new Event("gender-change"));
                loadResultsForChild(cId, fullName);
              }
            })
            .catch(() => {});
          return;
        }
      }

      const child = JSON.parse(localStorage.getItem("childData") || "null");
      if (child?.id) {
        const fullName = `${child.firstName || ""} ${child.lastName || ""}`.trim();
        loadResultsForChild(child.id, fullName);
      }
    } catch {}
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-brand-100/30 p-6" dir="rtl">
      <div className="max-w-6xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-2xl">قائمة الاختبارات</CardTitle>
                {childName && (
                  <p className="text-sm text-muted-foreground mt-1">
                    👤 الطفل الحالي: <span className="font-semibold text-brand-700">{childName}</span>
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="default"
                  className="bg-brand-600 hover:bg-brand-700 text-white font-semibold flex items-center gap-2"
                  onClick={() => router.push("/")}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  تغيير الطفل / طفل جديد
                </Button>
                <Link href="/children-results">
                  <Button variant="outline">عرض جميع النتائج</Button>
                </Link>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {tests.map((t) => {
                const r = byTestKey[t.testKey || t.key];
                const accDen = (r?.correct ?? 0) + (r?.incorrect ?? 0);
                const acc =
                  accDen > 0
                    ? Math.round(((r?.correct ?? 0) / accDen) * 100)
                    : null;
                return (
                  <Card key={t.key} className="flex flex-col">
                    <CardHeader>
                      <CardTitle className="text-lg">{t.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col gap-3">
                      {childId && r ? (
                        <div className="text-sm text-muted-foreground">
                          آخر نتيجة: صحيح {r.correct} / إجمالي {r.total}
                          {acc !== null ? ` — الدقة ${acc}%` : ""}
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground">
                          لا توجد نتائج محفوظة بعد.
                        </div>
                      )}
                      <div className="flex gap-2 mt-auto w-full">
                        <div className="flex-1">
                          {"startHref" in t ? (
                            <Link href={(t as any).startHref}>
                              <Button className="w-full text-white font-bold text-base">بدء</Button>
                            </Link>
                          ) : (
                            <Button
                              className="w-full text-white font-bold text-base"
                              onClick={() => {
                                if (!("external" in t)) return;
                                const activeChildId = childId || 1;
                                const base = "https://rapport-8d84c.web.app/";
                                const url = `${base}?screen=${encodeURIComponent(
                                  (t as any).screen
                                )}&childId=${encodeURIComponent(
                                  String(activeChildId)
                                )}&testKey=${encodeURIComponent(t.key)}`;
                                window.location.href = url;
                              }}
                            >
                              بدء
                            </Button>
                          )}
                        </div>
                        {"resultsHref" in t ? (
                          <div className="flex-1">
                            <Link href={(t as any).resultsHref}>
                              <Button variant="outline" className="w-full">
                                عرض النتائج
                              </Button>
                            </Link>
                          </div>
                        ) : null}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
