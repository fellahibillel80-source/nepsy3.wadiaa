"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Play } from "lucide-react";
import { CircularProgress } from "@/components/ui/circular-progress";

interface FaceRecognitionTestProps {
  onBack?: () => void;
}

interface TestResult {
  roundNumber: number;
  selectedPhotoSrc: string | null;
  correctPhotoSrc: string;
  isCorrect: boolean | null;
  responseTime: number;
}

export default function FaceRecognitionTest({
  onBack,
}: FaceRecognitionTestProps): JSX.Element {
  const router = useRouter();
  const handleBack = onBack || (() => router.push("/tests"));
  // phases
  const [phase, setPhase] = useState<
    "instructions" | "ready" | "running" | "photo-display" | "complete"
  >("photo-display");

  // rounds & timing
  const totalRounds = 16;
  const [currentRound, setCurrentRound] = useState<number>(0);
  const currentRoundRef = useRef<number>(0);
  useEffect(() => {
    currentRoundRef.current = currentRound;
  }, [currentRound]);

  const [timeRemaining, setTimeRemaining] = useState<number>(5);
  const [startTime, setStartTime] = useState<number>(0);

  // photos for current round + target src
  const [currentPhotos, setCurrentPhotos] = useState<string[]>([]);
  const [targetPhotoSrc, setTargetPhotoSrc] = useState<string>("");

  // results
  const [results, setResults] = useState<TestResult[]>([]);

  // timers
  const intervalRef = useRef<number | null>(null);
  const audioIntervalRef = useRef<number | null>(null);

  // choose-face intro audio
  const chooseAudioRef = useRef<HTMLAudioElement | null>(null);
  const [introPlaying, setIntroPlaying] = useState<boolean>(false);
  const introPlayedRef = useRef<boolean>(false);

  // keep a persistent banner visible
  const [introBannerVisible, setIntroBannerVisible] = useState<boolean>(false);

  // protect against double-clicks
  const roundLockedRef = useRef<boolean>(false);

  // ---------- planches ----------
  const planches = [
    {
      plancheNum: 1,
      options: [
        "/visual-memory/photos experimentales/Planche 1/WhatsApp Image 2026-07-01 at 3.25.42 PM.jpeg",
        "/visual-memory/photos experimentales/Planche 1/WhatsApp Image 2026-07-01 at 3.25.43 PM (1).jpeg",
        "/visual-memory/photos experimentales/Planche 1/WhatsApp Image 2026-07-01 at 3.25.43 PM.jpeg"
      ],
      correctSrc: "/visual-memory/photos cibles/WhatsApp Image 2026-07-01 at 3.20.38 PM (1).jpeg"
    },
    {
      plancheNum: 2,
      options: [
        "/visual-memory/photos experimentales/Planche 2/WhatsApp Image 2026-07-01 at 3.26.09 PM (1).jpeg",
        "/visual-memory/photos experimentales/Planche 2/WhatsApp Image 2026-07-01 at 3.26.09 PM (2).jpeg",
        "/visual-memory/photos experimentales/Planche 2/WhatsApp Image 2026-07-01 at 3.26.09 PM.jpeg"
      ],
      correctSrc: "/visual-memory/photos cibles/WhatsApp Image 2026-07-01 at 3.20.39 PM (5).jpeg"
    },
    {
      plancheNum: 3,
      options: [
        "/visual-memory/photos experimentales/Planche 3/WhatsApp Image 2026-07-01 at 3.26.35 PM (1).jpeg",
        "/visual-memory/photos experimentales/Planche 3/WhatsApp Image 2026-07-01 at 3.26.35 PM (2).jpeg",
        "/visual-memory/photos experimentales/Planche 3/WhatsApp Image 2026-07-01 at 3.26.35 PM.jpeg"
      ],
      correctSrc: "/visual-memory/photos cibles/WhatsApp Image 2026-07-01 at 3.20.40 PM.jpeg"
    },
    {
      plancheNum: 4,
      options: [
        "/visual-memory/photos experimentales/Planche 4/WhatsApp Image 2026-07-01 at 3.27.37 PM (1).jpeg",
        "/visual-memory/photos experimentales/Planche 4/WhatsApp Image 2026-07-01 at 3.27.37 PM (2).jpeg",
        "/visual-memory/photos experimentales/Planche 4/WhatsApp Image 2026-07-01 at 3.27.37 PM.jpeg"
      ],
      correctSrc: "/visual-memory/photos cibles/WhatsApp Image 2026-07-01 at 3.20.38 PM (4).jpeg"
    },
    {
      plancheNum: 5,
      options: [
        "/visual-memory/photos experimentales/Planche 5/WhatsApp Image 2026-07-01 at 3.28.02 PM.jpeg",
        "/visual-memory/photos experimentales/Planche 5/WhatsApp Image 2026-07-01 at 3.28.03 PM (1).jpeg",
        "/visual-memory/photos experimentales/Planche 5/WhatsApp Image 2026-07-01 at 3.28.03 PM.jpeg"
      ],
      correctSrc: "/visual-memory/photos cibles/WhatsApp Image 2026-07-01 at 3.20.39 PM.jpeg"
    },
    {
      plancheNum: 6,
      options: [
        "/visual-memory/photos experimentales/Planche 6/WhatsApp Image 2026-07-01 at 3.28.39 PM (1).jpeg",
        "/visual-memory/photos experimentales/Planche 6/WhatsApp Image 2026-07-01 at 3.28.39 PM (2).jpeg",
        "/visual-memory/photos experimentales/Planche 6/WhatsApp Image 2026-07-01 at 3.28.39 PM.jpeg"
      ],
      correctSrc: "/visual-memory/photos cibles/WhatsApp Image 2026-07-01 at 3.20.38 PM.jpeg"
    },
    {
      plancheNum: 7,
      options: [
        "/visual-memory/photos experimentales/Planche 7/WhatsApp Image 2026-07-01 at 3.29.05 PM (1).jpeg",
        "/visual-memory/photos experimentales/Planche 7/WhatsApp Image 2026-07-01 at 3.29.05 PM (2).jpeg",
        "/visual-memory/photos experimentales/Planche 7/WhatsApp Image 2026-07-01 at 3.29.05 PM.jpeg"
      ],
      correctSrc: "/visual-memory/photos cibles/WhatsApp Image 2026-07-01 at 3.20.40 PM (3).jpeg"
    },
    {
      plancheNum: 8,
      options: [
        "/visual-memory/photos experimentales/Planche 8/WhatsApp Image 2026-07-01 at 3.29.41 PM (1).jpeg",
        "/visual-memory/photos experimentales/Planche 8/WhatsApp Image 2026-07-01 at 3.29.41 PM.jpeg",
        "/visual-memory/photos experimentales/Planche 8/WhatsApp Image 2026-07-01 at 3.29.42 PM.jpeg"
      ],
      correctSrc: "/visual-memory/photos cibles/WhatsApp Image 2026-07-01 at 3.20.40 PM (2).jpeg"
    },
    {
      plancheNum: 9,
      options: [
        "/visual-memory/photos experimentales/Planche 9/WhatsApp Image 2026-07-01 at 3.30.59 PM (1).jpeg",
        "/visual-memory/photos experimentales/Planche 9/WhatsApp Image 2026-07-01 at 3.30.59 PM (2).jpeg",
        "/visual-memory/photos experimentales/Planche 9/WhatsApp Image 2026-07-01 at 3.30.59 PM.jpeg"
      ],
      correctSrc: "/visual-memory/photos cibles/WhatsApp Image 2026-07-01 at 3.20.39 PM (2).jpeg"
    },
    {
      plancheNum: 10,
      options: [
        "/visual-memory/photos experimentales/Planche 10/WhatsApp Image 2026-07-01 at 3.31.23 PM.jpeg",
        "/visual-memory/photos experimentales/Planche 10/WhatsApp Image 2026-07-01 at 3.31.23 PM (1).jpeg",
        "/visual-memory/photos experimentales/Planche 10/WhatsApp Image 2026-07-01 at 3.31.23 PM (2).jpeg"
      ],
      correctSrc: "/visual-memory/photos cibles/WhatsApp Image 2026-07-01 at 3.20.40 PM (4).jpeg"
    },
    {
      plancheNum: 11,
      options: [
        "/visual-memory/photos experimentales/Planche 11/WhatsApp Image 2026-07-01 at 3.31.44 PM (1).jpeg",
        "/visual-memory/photos experimentales/Planche 11/WhatsApp Image 2026-07-01 at 3.31.44 PM (2).jpeg",
        "/visual-memory/photos experimentales/Planche 11/WhatsApp Image 2026-07-01 at 3.31.44 PM.jpeg"
      ],
      correctSrc: "/visual-memory/photos cibles/WhatsApp Image 2026-07-01 at 3.20.39 PM (4).jpeg"
    },
    {
      plancheNum: 12,
      options: [
        "/visual-memory/photos experimentales/Planche 12/WhatsApp Image 2026-07-01 at 3.33.26 PM (1).jpeg",
        "/visual-memory/photos experimentales/Planche 12/WhatsApp Image 2026-07-01 at 3.33.26 PM (2).jpeg",
        "/visual-memory/photos experimentales/Planche 12/WhatsApp Image 2026-07-01 at 3.33.26 PM.jpeg"
      ],
      correctSrc: "/visual-memory/photos cibles/WhatsApp Image 2026-07-01 at 3.20.38 PM (2).jpeg"
    },
    {
      plancheNum: 13,
      options: [
        "/visual-memory/photos experimentales/Planche 13/WhatsApp Image 2026-07-01 at 3.34.36 PM (1).jpeg",
        "/visual-memory/photos experimentales/Planche 13/WhatsApp Image 2026-07-01 at 3.34.36 PM (2).jpeg",
        "/visual-memory/photos experimentales/Planche 13/WhatsApp Image 2026-07-01 at 3.34.36 PM.jpeg"
      ],
      correctSrc: "/visual-memory/photos cibles/WhatsApp Image 2026-07-01 at 3.20.39 PM (1).jpeg"
    },
    {
      plancheNum: 14,
      options: [
        "/visual-memory/photos experimentales/Planche 14/WhatsApp Image 2026-07-01 at 3.35.01 PM (1).jpeg",
        "/visual-memory/photos experimentales/Planche 14/WhatsApp Image 2026-07-01 at 3.35.01 PM (2).jpeg",
        "/visual-memory/photos experimentales/Planche 14/WhatsApp Image 2026-07-01 at 3.35.01 PM.jpeg"
      ],
      correctSrc: "/visual-memory/photos cibles/WhatsApp Image 2026-07-01 at 3.20.39 PM (3).jpeg"
    },
    {
      plancheNum: 15,
      options: [
        "/visual-memory/photos experimentales/Planche 15/WhatsApp Image 2026-07-01 at 3.35.36 PM (1).jpeg",
        "/visual-memory/photos experimentales/Planche 15/WhatsApp Image 2026-07-01 at 3.35.36 PM.jpeg",
        "/visual-memory/photos experimentales/Planche 15/WhatsApp Image 2026-07-01 at 3.35.37 PM.jpeg"
      ],
      correctSrc: "/visual-memory/photos cibles/WhatsApp Image 2026-07-01 at 3.20.40 PM (1).jpeg"
    },
    {
      plancheNum: 16,
      options: [
        "/visual-memory/photos experimentales/Planche 16/WhatsApp Image 2026-07-01 at 3.35.59 PM.jpeg",
        "/visual-memory/photos experimentales/Planche 16/WhatsApp Image 2026-07-01 at 3.36.00 PM (1).jpeg",
        "/visual-memory/photos experimentales/Planche 16/WhatsApp Image 2026-07-01 at 3.36.00 PM.jpeg"
      ],
      correctSrc: "/visual-memory/photos cibles/WhatsApp Image 2026-07-01 at 3.20.38 PM (3).jpeg"
    }
  ];

  // init choose-face audio on mount (we will call play() inside startTest user-click)
  useEffect(() => {
    try {
      chooseAudioRef.current = new Audio("/audio/choose-face.ogg");
      if (chooseAudioRef.current) chooseAudioRef.current.volume = 0.95;
    } catch {
      chooseAudioRef.current = null;
    }

    return () => {
      try {
        if (chooseAudioRef.current) {
          chooseAudioRef.current.pause();
          chooseAudioRef.current.src = "";
        }
      } catch {}
      chooseAudioRef.current = null;
    };
  }, []);

  // small helper: speak TTS question (optional)
  const speakText = (text: string) => {
    if (typeof window === "undefined") return;
    if ("speechSynthesis" in window) {
      try {
        const ut = new SpeechSynthesisUtterance(text);
        ut.lang = "ar-SA";
        ut.rate = 0.9;
        ut.pitch = 1;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(ut);
      } catch {}
    }
  };

  // -------------------------
  // generate photos for the current round (without starting timers)
  // -------------------------
  const prepareRound = () => {
    const round = currentRoundRef.current; // 0-based
    const currentPlanche = planches[round];
    if (!currentPlanche) return;

    const arr = [...currentPlanche.options];
    // shuffle positions
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
    }

    setCurrentPhotos(arr);
    setTargetPhotoSrc(currentPlanche.correctSrc);
  };

  // timers management
  const clearTimers = () => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (audioIntervalRef.current !== null) {
      window.clearInterval(audioIntervalRef.current);
      audioIntervalRef.current = null;
    }
  };

  // start timers & TTS for the current prepared round (assumes prepareRound already called)
  const startTimersForPreparedRound = () => {
    clearTimers();

    setPhase("photo-display");
    setTimeRemaining(5);
    setStartTime(Date.now());
    roundLockedRef.current = false;

    // speak question immediately and every 5s while the round is active
    speakText("أي من هذه الصور رأيتها من قبل في الاختبار السابق؟");
    audioIntervalRef.current = window.setInterval(() => {
      speakText("أي من هذه الصور رأيتها من قبل في الاختبار السابق؟");
    }, 5000);

    // countdown timer (1s)
    intervalRef.current = window.setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // time up -> record ignored and advance
          handleResponse(null);
          return 5; // reset (will be set again by next round)
        }
        return prev - 1;
      });
    }, 1000);
  };

  // show next round: prepare photos and start timers immediately (used after intro)
  const showNextRound = () => {
    clearTimers();

    if (currentRoundRef.current >= totalRounds) {
      setPhase("complete");
      return;
    }

    prepareRound();
    // start timers immediately
    startTimersForPreparedRound();
  };

  // -----------------------------
  // START THE TEST: play intro audio inside this user-initiated handler,
  // show photos immediately (prepareRound) but DON'T start the countdown until audio ends.
  // -----------------------------
  const startTest = async () => {
    // reset results & round index
    setResults([]);
    currentRoundRef.current = 0;
    setCurrentRound(0);
    setPhase("running");

    // prepare round photos and show them (photo-display view)
    prepareRound();
    setPhase("photo-display");
    setTimeRemaining(5);
    roundLockedRef.current = false; // unlock immediately

    // start timers immediately
    startTimersForPreparedRound();
  };

  useEffect(() => {
    setTimeout(() => {
      void startTest();
    }, 100);
  }, []);

  // handle a selection (or null when ignored)
  const handleResponse = (selectedPhotoSrc: string | null) => {
    // ignore clicks while intro is playing / locked
    if (introPlaying || roundLockedRef.current) return;
    if (roundLockedRef.current) return;

    roundLockedRef.current = true; // prevent double responses

    // stop timers for this round
    clearTimers();

    const responseTime = Date.now() - startTime;
    const isCorrect = selectedPhotoSrc === targetPhotoSrc;

    const result: TestResult = {
      roundNumber: currentRoundRef.current + 1,
      selectedPhotoSrc,
      correctPhotoSrc: targetPhotoSrc,
      isCorrect: selectedPhotoSrc === null ? null : isCorrect,
      responseTime,
    };

    setResults((prev) => [...prev, result]);

    // advance round
    const next = currentRoundRef.current + 1;
    currentRoundRef.current = next;
    setCurrentRound(next);

    // short delay to allow brief feedback
    window.setTimeout(() => {
      if (next < totalRounds) showNextRound();
      else setPhase("complete");
    }, 250);
  };

  const calculateResults = () => {
    const correct = results.filter((r) => r.isCorrect === true).length;
    const incorrect = results.filter((r) => r.isCorrect === false).length;
    const ignored = results.filter((r) => r.selectedPhotoSrc === null).length;
    const totalScore = correct - incorrect;
    return { correct, incorrect, ignored, totalScore };
  };

  useEffect(() => {
    if (phase === "complete") {
      const { correct, incorrect, ignored, totalScore } = calculateResults();
      const childDataString = localStorage.getItem("childData");
      const childData = childDataString ? JSON.parse(childDataString) : {};

      const resultsToSave = {
        testType: "face-recognition",
        correct,
        incorrect,
        ignored,
        totalScore,
        totalRounds: totalRounds,
        childName: `${childData?.firstName || ""} ${childData?.lastName || ""}`,
        childIQ: childData?.iq || "",
        completedAt: new Date().toISOString(),
      };

      localStorage.setItem("fifthTestResults", JSON.stringify(resultsToSave));

      setTimeout(() => {
        router.push("/test1-5/results");
      }, 500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimers();
      try {
        if (chooseAudioRef.current) {
          chooseAudioRef.current.pause();
          chooseAudioRef.current.src = "";
        }
      } catch {}
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- RENDER ----------
  // small shared banner element (visible once introBannerVisible becomes true)
  const IntroBanner = () =>
    introBannerVisible ? (
      <div className="mb-4 p-3 rounded-lg text-center">
        {introPlaying ? (
          <div className="text-yellow-700 font-semibold">
            الصوت التعريفي يعمل — لا يمكنك البدء حتى ينتهي.
          </div>
        ) : (
          <div className="text-green-700 font-semibold">
            الصوت التعريفي تم تشغيله.
          </div>
        )}
      </div>
    ) : null;

  if (phase === "instructions") {
    return (
      <div className="min-h-screen bg-background p-8" dir="rtl">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="outline" size="icon" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold">
              الاختبار الخامس: إختبار الذاكرة البصرية 2
            </h1>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>تعليمات الاختبار</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-lg">
                سوف تشاهد {totalRounds} مجموعات، كل مجموعة تحتوي على 3 وجوه
                أطفال.
              </p>
              <p className="text-lg">كل مجموعة ستظهر لمدة 5 ثوانٍ.</p>
              <p className="text-lg">
                عليك أن تختار الوجه الذي رأيته من قبل في الاختبار السابق (إختبار
                الذاكرة البصرية 1).
              </p>
              <p className="text-lg">
                ستسمع السؤال: "أي من هذه الوجوه رأيته من قبل في الاختبار
                السابق؟"
              </p>
              <p className="text-lg font-semibold text-brand-600">
                انتبه: لديك 5 ثوانٍ فقط للإجابة على كل مجموعة!
              </p>
            </CardContent>
          </Card>

          <div className="flex justify-center gap-4">
            {/* entering Ready does NOT play audio now */}
            <Button onClick={() => setPhase("ready")} size="lg">
              فهمت التعليمات
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "ready") {
    return (
      <div className="min-h-screen bg-background p-8" dir="rtl">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="outline" size="icon" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </div>

          <Card className="text-center">
            <CardHeader>
              <CardTitle className="text-2xl">هل أنت مستعد؟</CardTitle>
              <CardDescription className="text-lg">
                اضغط "ابدأ الاختبار" عندما تكون جاهزاً
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Start button: when clicked, shows photos immediately and plays intro audio */}
              <Button
                onClick={startTest}
                size="lg"
                className={`text-lg px-8 py-4 bg-purple-600 text-white hover:bg-purple-700 ${
                  introPlaying ? "opacity-60 cursor-not-allowed" : ""
                }`}
                disabled={introPlaying}
              >
                <Play className="mr-2 h-5 w-5" />
                ابدأ الاختبار
              </Button>

              {/* persistent intro banner */}
              <div className="mt-4">
                <IntroBanner />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (phase === "photo-display") {
    const progress = ((currentRound + 1) / totalRounds) * 100;
    const { correct, incorrect, ignored } = calculateResults();

    return (
      <div className="min-h-screen bg-background p-8" dir="rtl">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center gap-4 mb-8">
            <h1 className="text-2xl font-bold">الاختبار الخامس: إختبار الذاكرة البصرية 2</h1>
            <Button variant="outline" onClick={handleBack} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4 ml-1" />
              <span>الرجوع لقائمة الاختبارات</span>
            </Button>
          </div>

          {/* keep showing the persistent intro banner in the rounds view too */}
          <IntroBanner />

          <div className="flex justify-start items-start mb-6">
            <CircularProgress
              timeLeft={timeRemaining}
              totalTime={5}
              size={80}
              strokeWidth={6}
            />
          </div>

          <div className="text-center mb-8">
            <div className="flex justify-center gap-8 mb-6">
              {currentPhotos.map((photoSrc, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => handleResponse(photoSrc)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleResponse(photoSrc);
                      }
                    }}
                    className="p-2 bg-white border-2 border-gray-300 hover:border-brand-500 hover:bg-brand-50 rounded-lg cursor-pointer"
                    style={{ display: "inline-block" }}
                  >
                    <img
                      src={photoSrc || "/placeholder.svg"}
                      alt={`صورة خيار ${index + 1}`}
                      className="w-48 h-48 object-cover rounded-lg"
                    />
                  </div>
                  <span className="text-lg font-semibold mt-2">
                    {index + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 mx-auto border-4 border-purple-500 rounded-full flex items-center justify-center text-xl font-bold">
              {timeRemaining}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "complete") {
    return (
      <div
        className="min-h-screen bg-background p-8 flex items-center justify-center"
        dir="rtl"
      >
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">الاختبار انتهى</h1>
          <p className="text-lg">...يتم الآن توجيهك إلى صفحة النتائج</p>
        </div>
      </div>
    );
  }

  return null;
}
