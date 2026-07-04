"use client";

import { useState, useEffect, useRef } from "react";
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

interface GenderIdentificationTestProps {
  onBack?: () => void;
}

interface PhotoData {
  id: number;
  src: string;
  correctGender: "boy" | "girl";
}

interface TestResult {
  photoId: number;
  selectedGender: "boy" | "girl" | null;
  isCorrect: boolean | null;
  responseTime: number;
}

export default function GenderIdentificationTest({
  onBack,
}: GenderIdentificationTestProps) {
  const router = useRouter();
  const handleBack = onBack || (() => router.push("/tests"));
  const [phase, setPhase] = useState<string>("photo-display");

  const photos: PhotoData[] = [
    { id: 1, src: "/visual-memory/photos cibles/WhatsApp Image 2026-07-01 at 3.20.38 PM (1).jpeg", correctGender: "girl" },
    { id: 2, src: "/visual-memory/photos cibles/WhatsApp Image 2026-07-01 at 3.20.39 PM (5).jpeg", correctGender: "girl" },
    { id: 3, src: "/visual-memory/photos cibles/WhatsApp Image 2026-07-01 at 3.20.40 PM.jpeg", correctGender: "girl" },
    { id: 4, src: "/visual-memory/photos cibles/WhatsApp Image 2026-07-01 at 3.20.38 PM (4).jpeg", correctGender: "girl" },
    { id: 5, src: "/visual-memory/photos cibles/WhatsApp Image 2026-07-01 at 3.20.39 PM.jpeg", correctGender: "girl" },
    { id: 6, src: "/visual-memory/photos cibles/WhatsApp Image 2026-07-01 at 3.20.38 PM.jpeg", correctGender: "girl" },
    { id: 7, src: "/visual-memory/photos cibles/WhatsApp Image 2026-07-01 at 3.20.40 PM (3).jpeg", correctGender: "girl" },
    { id: 8, src: "/visual-memory/photos cibles/WhatsApp Image 2026-07-01 at 3.20.40 PM (2).jpeg", correctGender: "girl" },
    { id: 9, src: "/visual-memory/photos cibles/WhatsApp Image 2026-07-01 at 3.20.39 PM (2).jpeg", correctGender: "girl" },
    { id: 10, src: "/visual-memory/photos cibles/WhatsApp Image 2026-07-01 at 3.20.40 PM (4).jpeg", correctGender: "girl" },
    { id: 11, src: "/visual-memory/photos cibles/WhatsApp Image 2026-07-01 at 3.20.39 PM (4).jpeg", correctGender: "girl" },
    { id: 12, src: "/visual-memory/photos cibles/WhatsApp Image 2026-07-01 at 3.20.38 PM (2).jpeg", correctGender: "girl" },
    { id: 13, src: "/visual-memory/photos cibles/WhatsApp Image 2026-07-01 at 3.20.39 PM (1).jpeg", correctGender: "girl" },
    { id: 14, src: "/visual-memory/photos cibles/WhatsApp Image 2026-07-01 at 3.20.39 PM (3).jpeg", correctGender: "girl" },
    { id: 15, src: "/visual-memory/photos cibles/WhatsApp Image 2026-07-01 at 3.20.40 PM (1).jpeg", correctGender: "girl" },
    { id: 16, src: "/visual-memory/photos cibles/WhatsApp Image 2026-07-01 at 3.20.38 PM (3).jpeg", correctGender: "girl" },
  ];

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

  // UI / results state
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [results, setResults] = useState<TestResult[]>([]);
  const [introPlaying, setIntroPlaying] = useState(false); // intro audio playing
  const [facememPlaying, setFacememPlaying] = useState(false); // per-photo play indicator

  // Recognition state (Step 2)
  const [recognitionRound, setRecognitionRound] = useState<number>(0);
  const recognitionRoundRef = useRef<number>(0);
  const [recognitionResults, setRecognitionResults] = useState<{
    roundNumber: number;
    selectedPhotoSrc: string | null;
    correctPhotoSrc: string;
    isCorrect: boolean | null;
    responseTime: number;
  }[]>([]);
  const [recognitionPhotos, setRecognitionPhotos] = useState<string[]>([]);
  const [recognitionTargetSrc, setRecognitionTargetSrc] = useState<string>("");
  const [recognitionTimeRemaining, setRecognitionTimeRemaining] = useState<number>(5);
  const [recognitionStartTime, setRecognitionStartTime] = useState<number>(0);
  const [recognitionIntroPlaying, setRecognitionIntroPlaying] = useState<boolean>(false);
  const recognitionIntroPlayedRef = useRef<boolean>(false);
  const recognitionLockedRef = useRef<boolean>(false);
  const recognitionIntervalRef = useRef<number | null>(null);
  const recognitionAudioIntervalRef = useRef<number | null>(null);

  // seconds since the *current* photo started. null means timer stopped/not started.
  const [photoElapsed, setPhotoElapsed] = useState<number | null>(null);

  // derived display for remaining seconds (1..5)
  const displayedTimeRemaining = (() => {
    if (photoElapsed === null) return 5;
    const rem = 5 - Math.floor(photoElapsed);
    return rem <= 0 ? 1 : rem;
  })();

  // timers & audio refs
  const globalIntervalRef = useRef<number | null>(null); // global second ticker
  const photoStartTimesRef = useRef<number[]>(Array(photos.length).fill(0)); // photo start timestamps in ms
  const answeredFlagsRef = useRef<boolean[]>(Array(photos.length).fill(false)); // ensure single response per photo
  const currentIndexRef = useRef<number>(0);

  const clickAudioRef = useRef<HTMLAudioElement | null>(null);
  const finishAudioRef = useRef<HTMLAudioElement | null>(null);
  const facememAudioRef = useRef<HTMLAudioElement | null>(null); // used both as intro and per-photo source
  const chooseAudioRef = useRef<HTMLAudioElement | null>(null); // Step 2 intro audio

  const introPlayedRef = useRef<boolean>(false);

  // setup audio elements on client mount
  useEffect(() => {
    clickAudioRef.current = new Audio("/audio/click.wav");
    finishAudioRef.current = new Audio("/audio/finish.wav");
    facememAudioRef.current = new Audio("/audio/facemem.ogg");
    chooseAudioRef.current = new Audio("/audio/choose-face.ogg");

    if (clickAudioRef.current) clickAudioRef.current.volume = 0.9;
    if (finishAudioRef.current) finishAudioRef.current.volume = 0.9;
    if (facememAudioRef.current) facememAudioRef.current.volume = 0.95;
    if (chooseAudioRef.current) chooseAudioRef.current.volume = 0.95;

    return () => {
      // cleanup references
      clickAudioRef.current = null;
      finishAudioRef.current = null;
      facememAudioRef.current = null;
      chooseAudioRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // keep currentIndexRef synced
  useEffect(() => {
    currentIndexRef.current = currentPhotoIndex;
  }, [currentPhotoIndex]);

  // start the global timer and photo flow after intro ends
  const startGlobalTimer = () => {
    // guard no double-start
    if (globalIntervalRef.current !== null) return;

    // mark first photo start time
    photoStartTimesRef.current = photoStartTimesRef.current.map(() => 0);
    photoStartTimesRef.current[0] = Date.now();
    setPhotoElapsed(0);

    // increment seconds every 200ms to make displayed countdown responsive (but we'll floor when showing)
    globalIntervalRef.current = window.setInterval(() => {
      setPhotoElapsed((s) => {
        if (s === null) return 0;
        return s + 0.2; // increment by 0.2s for smoother UI
      });
    }, 200) as unknown as number;
  };

  // stop global timer (when test completes)
  const stopGlobalTimer = () => {
    if (globalIntervalRef.current !== null) {
      window.clearInterval(globalIntervalRef.current);
      globalIntervalRef.current = null;
    }
    setPhotoElapsed(null);
  };

  // when photoElapsed changes, compute auto-advance after 5s
  useEffect(() => {
    if (photoElapsed === null) return;

    if (photoElapsed >= 5) {
      handleNextPhoto();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photoElapsed]);

  // play intro once and start timer AFTER it finishes naturally
  const startTest = async () => {
    setResults([]);
    // reset answered flags and photo start times
    answeredFlagsRef.current = Array(photos.length).fill(false);
    photoStartTimesRef.current = Array(photos.length).fill(0);
    setCurrentPhotoIndex(0);
    currentIndexRef.current = 0;
    setPhase("running");

    const fm = facememAudioRef.current;
    if (!introPlayedRef.current && fm) {
      introPlayedRef.current = true;
      setIntroPlaying(true);

      const onIntroEnded = () => {
        setIntroPlaying(false);
        // start global timer immediately
        startGlobalTimer();
      };

      fm.addEventListener("ended", onIntroEnded, { once: true });

      try {
        await fm.play().catch(() => {
          // autoplay blocked -> start immediately
          setIntroPlaying(false);
          try {
            fm.removeEventListener("ended", onIntroEnded as EventListener);
          } catch {}
          startGlobalTimer();
        });
      } catch {
        setIntroPlaying(false);
        try {
          fm.removeEventListener("ended", onIntroEnded as EventListener);
        } catch {}
        startGlobalTimer();
      }

      // show first photo immediately (while intro plays)
      photoStartTimesRef.current[0] = Date.now();
      setCurrentPhotoIndex(0);
    } else {
      // intro already played or missing -> start straight away
      startGlobalTimer();
      photoStartTimesRef.current[0] = Date.now();
      setCurrentPhotoIndex(0);
    }
    setPhase("photo-display");
  };

  useEffect(() => {
    setTimeout(() => {
      void startTest();
    }, 100);
  }, []);

  // play per-photo audio but DO NOT pause the global timer


  // handle advancing targets in exposure phase
  const handleNextPhoto = () => {
    if (photoElapsed === null) return;
    const idx = currentIndexRef.current;
    if (answeredFlagsRef.current[idx]) return;

    answeredFlagsRef.current[idx] = true;
    const responseTime = Date.now() - (photoStartTimesRef.current[idx] || Date.now());
    const memorizedResult: TestResult = {
      photoId: photos[idx].id,
      selectedGender: null,
      isCorrect: true, // marked correct/completed exposure
      responseTime,
    };
    setResults((prev) => [...prev, memorizedResult]);

    const nextIndex = idx + 1;
    if (nextIndex < photos.length) {
      setCurrentPhotoIndex(nextIndex);
      photoStartTimesRef.current[nextIndex] = Date.now();
      setPhotoElapsed(0);
    } else {
      stopGlobalTimer();
      void startRecognitionPhase();
    }
  };

  const playFacememForCurrentPhoto = async () => {};
  const handleAnswer = (selectedGender: "boy" | "girl") => {};

  // -------------------------
  // Step 2: Recognition Phase
  // -------------------------
  
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

  const startRecognitionPhase = async () => {
    setPhase("recognition-display");
    setRecognitionRound(0);
    recognitionRoundRef.current = 0;
    setRecognitionResults([]);
    prepareRecognitionRound(0);
    setRecognitionTimeRemaining(5);

    const audio = chooseAudioRef.current;
    if (!audio) {
      recognitionLockedRef.current = false;
      startRecognitionTimers();
      return;
    }

    setRecognitionIntroPlaying(true);
    recognitionLockedRef.current = true;

    const onIntroEnded = () => {
      setRecognitionIntroPlaying(false);
      recognitionIntroPlayedRef.current = true;
      recognitionLockedRef.current = false;
      startRecognitionTimers();
    };

    audio.addEventListener("ended", onIntroEnded, { once: true });
    audio.currentTime = 0;

    try {
      await audio.play();
    } catch (err) {
      console.warn("choose-face audio play blocked or failed:", err);
      setRecognitionIntroPlaying(false);
      try {
        audio.removeEventListener("ended", onIntroEnded as EventListener);
      } catch {}
      recognitionIntroPlayedRef.current = true;
      recognitionLockedRef.current = false;
      startRecognitionTimers();
    }
  };

  const prepareRecognitionRound = (round: number) => {
    const currentPlanche = planches[round];
    if (!currentPlanche) return;

    const arr = [...currentPlanche.options];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
    }

    setRecognitionPhotos(arr);
    setRecognitionTargetSrc(currentPlanche.correctSrc);
  };

  const startRecognitionTimers = () => {
    clearRecognitionTimers();

    setRecognitionTimeRemaining(5);
    setRecognitionStartTime(Date.now());
    recognitionLockedRef.current = false;

    // speak question immediately and every 5s while the round is active
    speakText("أي من هذه الصور رأيتها من قبل في الاختبار السابق؟");
    recognitionAudioIntervalRef.current = window.setInterval(() => {
      speakText("أي من هذه الصور رأيتها من قبل في الاختبار السابق؟");
    }, 5000);

    // countdown timer (1s)
    recognitionIntervalRef.current = window.setInterval(() => {
      setRecognitionTimeRemaining((prev) => {
        if (prev <= 1) {
          handleRecognitionResponse(null);
          return 5;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const dbPostResults = async (step2Correct: number, step2Incorrect: number, step2Ignored: number) => {
    try {
      const child = JSON.parse(localStorage.getItem("childData") || "null");
      if (child?.id) {
        const guardKey = `resultPosted:test1-4:${child.id}`;
        if (sessionStorage.getItem(guardKey) !== "1") {
          const { apiPost } = await import("@/lib/api");
          await apiPost("/results", {
            childId: child.id,
            testKey: "إختبار الذاكرة البصرية 1",
            correct: step2Correct,
            incorrect: step2Incorrect,
            ignored: step2Ignored,
            total: 16,
          });
          sessionStorage.setItem(guardKey, "1");
        }
      }
    } catch (err) {
      console.warn("Failed to post results to backend", err);
    }
  };

  const finishMergedTest = async (recogRes: typeof recognitionResults) => {
    clearRecognitionTimers();
    if (finishAudioRef.current) {
      try {
        finishAudioRef.current.currentTime = 0;
        finishAudioRef.current.play().catch(() => {});
      } catch {}
    }

    // 1. Calculate step 1 (exposure/gender identification) scores:
    const step1Correct = results.filter((r) => r.isCorrect === true).length;
    const step1Incorrect = results.filter((r) => r.isCorrect === false).length;
    const step1Ignored = results.filter((r) => r.isCorrect === null).length;

    // 2. Calculate step 2 (recognition) scores:
    const step2Correct = recogRes.filter((r) => r.isCorrect === true).length;
    const step2Incorrect = recogRes.filter((r) => r.isCorrect === false).length;
    const step2Ignored = recogRes.filter((r) => r.selectedPhotoSrc === null).length;

    const childDataString = localStorage.getItem("childData");
    const childData = childDataString ? JSON.parse(childDataString) : {};

    const resultsToSave = {
      testType: "face-memory-merged",
      childName: `${childData?.firstName || ""} ${childData?.lastName || ""}`,
      childIQ: childData?.iq || "",
      completedAt: new Date().toISOString(),
      
      // Step 1: Exposure
      exposure: {
        correct: step1Correct,
        incorrect: step1Incorrect,
        ignored: step1Ignored,
        total: photos.length,
      },
      // Step 2: Recognition
      recognition: {
        correct: step2Correct,
        incorrect: step2Incorrect,
        ignored: step2Ignored,
        total: 16,
      }
    };

    localStorage.setItem("fourthTestResults", JSON.stringify(resultsToSave));

    // Post recognition results to backend under test name "إختبار الذاكرة البصرية 1"
    await dbPostResults(step2Correct, step2Incorrect, step2Ignored);

    setTimeout(() => {
      router.push("/test1-4/results");
    }, 2000);
  };

  const calculateResults = () => {
    const correct = results.filter((r) => r.isCorrect === true).length;
    const incorrect = results.filter((r) => r.isCorrect === false).length;
    const ignored = results.filter((r) => r.isCorrect === null).length;
    const totalScore = correct - incorrect;
    return { correct, incorrect, ignored, totalScore };
  };

  const clearRecognitionTimers = () => {
    if (recognitionIntervalRef.current !== null) {
      window.clearInterval(recognitionIntervalRef.current);
      recognitionIntervalRef.current = null;
    }
    if (recognitionAudioIntervalRef.current !== null) {
      window.clearInterval(recognitionAudioIntervalRef.current);
      recognitionAudioIntervalRef.current = null;
    }
  };

  const handleRecognitionResponse = (selectedPhotoSrc: string | null) => {
    if (recognitionIntroPlaying || recognitionLockedRef.current) return;

    recognitionLockedRef.current = true;
    clearRecognitionTimers();

    const responseTime = Date.now() - recognitionStartTime;
    const isCorrect = selectedPhotoSrc === recognitionTargetSrc;

    const res = {
      roundNumber: recognitionRoundRef.current,
      selectedPhotoSrc,
      correctPhotoSrc: recognitionTargetSrc,
      isCorrect,
      responseTime,
    };

    setRecognitionResults((prev) => {
      const updated = [...prev, res];
      const nextRound = recognitionRoundRef.current + 1;
      if (nextRound < 16) {
        setRecognitionRound(nextRound);
        recognitionRoundRef.current = nextRound;
        prepareRecognitionRound(nextRound);
        // start timers immediately for next round
        setTimeout(() => {
          startRecognitionTimers();
        }, 50);
      } else {
        // Recognition phase completed! Save all results!
        void finishMergedTest(updated);
      }
      return updated;
    });
  };

  // cleanup on unmount
  useEffect(() => {
    return () => {
      if (globalIntervalRef.current !== null) {
        window.clearInterval(globalIntervalRef.current);
        globalIntervalRef.current = null;
      }
      clearRecognitionTimers();
      if (chooseAudioRef.current) {
        try {
          chooseAudioRef.current.pause();
          chooseAudioRef.current.src = "";
        } catch {}
      }
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const getCurrentResults = () => {
    const { correct, incorrect, ignored } = calculateResults();
    return { correct, incorrect, ignored };
  };

  // sanity check: ensure counts sum up
  useEffect(() => {
    const { correct, incorrect, ignored } = calculateResults();
    if (correct + incorrect + ignored !== results.length) {
      console.warn("Result counts mismatch", {
        correct,
        incorrect,
        ignored,
        total: results.length,
      });
    }
  }, [results]);

  // ---------- RENDER ----------
  if (phase === "instructions") {
    return (
      <div className="min-h-screen bg-background p-8" dir="rtl">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="outline" size="icon" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold">الاختبار الرابع: إختبار الذاكرة البصرية 1</h1>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>تعليمات الاختبار</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-lg">
                عند الضغط على "ابدأ الاختبار" سيُشغّل صوت تعريفي واحد تلقائياً
                مرة واحدة.
              </p>
              <p className="text-lg">
                عندما ينتهي هذا الصوت يبدأ المؤقت العام مباشرة — الصور تتغيّر كل
                5 ثوانٍ تلقائياً ولا يتوقف المؤقت أبداً.
              </p>
              <p className="text-lg">
                يمكنك تشغيل صوت لكل صورة إذا رغبت، لكن ذلك لن يوقف أو يعطل
                المؤقت العام.
              </p>
              <p className="text-lg font-semibold text-brand-600">
                انتبه: لديك 5 ثوانٍ لكل صورة — إن لم تُجب تُسجّل الصورة كمنسية.
              </p>
            </CardContent>
          </Card>

          <div className="flex justify-center gap-4">
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
            <h1 className="text-3xl font-bold">الاختبار الرابع: إختبار الذاكرة البصرية 1</h1>
          </div>

          <Card className="text-center">
            <CardHeader>
              <CardTitle className="text-2xl">هل أنت مستعد؟</CardTitle>
              <CardDescription className="text-lg">
                اضغط "ابدأ الاختبار" عندما تكون جاهزاً. سيُشغّل صوت تعريفي مرة
                واحدة، ثم يبدأ الاختبار فور انتهائه.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={startTest}
                size="lg"
                className="text-lg px-8 py-4 bg-brand-600 text-white hover:bg-brand-700"
              >
                <Play className="mr-2 h-5 w-5" />
                ابدأ الاختبار
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (phase === "photo-display") {
    const currentPhoto = photos[currentPhotoIndex];

    return (
      <div className="min-h-screen bg-background p-8" dir="rtl">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center gap-4 mb-8">
            <h1 className="text-2xl font-bold">الاختبار الرابع: إختبار الذاكرة البصرية 1</h1>
            <Button variant="outline" onClick={handleBack} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4 ml-1" />
              <span>الرجوع لقائمة الاختبارات</span>
            </Button>
          </div>

          <div className="flex justify-start items-start mb-6">
            <CircularProgress
              timeLeft={displayedTimeRemaining}
              totalTime={5}
              size={80}
              strokeWidth={6}
            />
          </div>

          <div className="text-center mb-8">
            <div className="inline-block p-4 bg-white rounded-lg shadow-lg mb-4">
              <img
                src={currentPhoto.src || "/placeholder.svg"}
                alt={`صورة الهدف ${currentPhotoIndex + 1}`}
                className="w-64 h-64 object-cover rounded-lg"
              />
            </div>

            <div className="text-xl font-semibold mb-3">انتبه لهذه الصورة وتذكرها جيداً</div>
            <div className="mb-4 text-gray-500">
              سيتم الانتقال تلقائياً بعد انتهاء الوقت، أو اضغط على زر التالي للمتابعة.
            </div>

            <div className="flex justify-center mt-6">
              <Button
                onClick={handleNextPhoto}
                className="bg-black text-white hover:bg-gray-800 px-8 py-4 text-lg"
              >
                التالي
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "recognition-display") {
    return (
      <div className="min-h-screen bg-background p-8" dir="rtl">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center gap-4 mb-8">
            <h1 className="text-2xl font-bold">الاختبار الرابع: إختبار الذاكرة البصرية 1</h1>
            <Button variant="outline" onClick={handleBack} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4 ml-1" />
              <span>الرجوع لقائمة الاختبارات</span>
            </Button>
          </div>

          {recognitionIntroPlaying && (
            <div className="flex justify-center mb-6">
              <div className="bg-purple-100 text-purple-700 px-6 py-3 rounded-full font-bold flex items-center gap-2 animate-pulse text-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M12 18.75V5.25L7.75 9.5H4.5v5h3.25L12 18.75z" />
                </svg>
                <span>يرجى الاستماع إلى التعليمات الصوتية...</span>
              </div>
            </div>
          )}

          <div className="flex justify-start items-start mb-6">
            <CircularProgress
              timeLeft={recognitionTimeRemaining}
              totalTime={5}
              size={80}
              strokeWidth={6}
            />
          </div>

          <div className="text-center mb-8">
            <div className="flex justify-center gap-8 mb-6">
              {recognitionPhotos.map((photoSrc, index) => (
                <button
                  key={index}
                  onClick={() => handleRecognitionResponse(photoSrc)}
                  disabled={recognitionIntroPlaying}
                  className={`relative bg-white rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all p-3 border-4 ${
                    recognitionIntroPlaying ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
                  }`}
                  style={{ width: "160px" }}
                >
                  <img
                    src={photoSrc}
                    alt={`خيارات التعرف ${index + 1}`}
                    className="w-full h-40 object-cover rounded-md"
                  />
                </button>
              ))}
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
