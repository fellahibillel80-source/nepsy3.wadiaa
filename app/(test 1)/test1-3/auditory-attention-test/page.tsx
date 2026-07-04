"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Play, Pause, RotateCcw } from "lucide-react";
import { CircularProgress } from "@/components/ui/circular-progress";

type TestPhase =
  | "instructions"
  | "ready"
  | "running"
  | "stage-complete"
  | "stage-b-demo";
type TestStage = "A" | "B";

const STAGE_A_WORDS = 180;
const STAGE_B_WORDS = 55;
const WORD_INTERVAL = 1000; // ms between words

// -------------------- Full word lists --------------------
const SPECIFIC_WORD_LIST = [
  "Black",
  "Thing",
  "Early",
  "If",
  "Hear",
  "Red",
  "Square",
  "Then",
  "Yellow",
  "But",
  "Blue",
  "Red",
  "Here",
  "Take",
  "Yellow",
  "Square",
  "There",
  "All",
  "Then",
  "Black",
  "Red",
  "Blue",
  "Red",
  "Take",
  "There",
  "This",
  "White",
  "Then",
  "Put",
  "Red",
  "Square",
  "Red",
  "Take",
  "Red",
  "Yellow",
  "There",
  "Space",
  "Put",
  "Black",
  "No",
  "Then",
  "Blue",
  "Square",
  "Black",
  "Then",
  "Good",
  "Black",
  "Square",
  "Thing",
  "Much",
  "Yellow",
  "Blue",
  "Put",
  "Then",
  "Red",
  "Space",
  "Red",
  "Yellow",
  "Go",
  "Red",
  "Box",
  "White",
  "Put",
  "Blue",
  "Put",
  "Red",
  "Then",
  "Red",
  "Thing",
  "Early",
  "If",
  "Here",
  "Red",
  "Then",
  "Yellow",
  "But",
  "There",
  "This",
  "Take",
  "Red",
  "Black",
  "Thing",
  "Early",
  "If",
  "Hear",
  "Red",
  "Square",
  "Then",
  "Yellow",
  "But",
  "Blue",
  "There",
  "This",
  "Take",
  "Red",
  "Yellow",
  "Square",
  "There",
  "All",
  "Then",
  "Red",
  "Blue",
  "Take",
  "There",
  "This",
  "White",
  "Then",
  "Put",
  "Red",
  "Square",
  "Take",
  "Yellow",
  "There",
  "Red",
  "Put",
  "Red",
  "No",
  "Then",
  "Blue",
  "Square",
  "Then",
  "Good",
  "Black",
  "Square",
  "Thing",
  "Much",
  "Yellow",
  "Blue",
  "Put",
  "Then",
  "Space",
  "Black",
  "Then",
  "Yellow",
  "Go",
  "Then",
  "Red",
  "Square",
  "Black",
  "Red",
  "Thing",
  "Box",
  "White",
  "Put",
  "Red",
  "Put",
  "Red",
  "If",
  "Red",
  "Black",
  "If",
  "Here",
  "Red",
  "Square",
  "Then",
  "Yellow",
  "But",
  "There",
  "Red",
  "Take",
  "This",
  "Black",
  "Thing",
  "Early",
  "If",
  "Hear",
  "Red",
  "Square",
  "If",
  "Yellow",
  "But",
  "Blue",
  "Red",
  "This",
  "Take",
  "Yellow",
  "Square",
  "There",
  "All",
  "Red",
];

const STAGE_B_SPECIFIC_WORDS = [
  "Red",
  "Then",
  "Black",
  "Thing",
  "Say",
  "Red",
  "If",
  "Here",
  "Yellow",
  "Square",
  "Then",
  "Red",
  "Square",
  "Black",
  "Black",
  "Then",
  "Blue",
  "No",
  "Yellow",
  "Square",
  "Space",
  "Good",
  "White",
  "Black",
  "Square",
  "Thing",
  "Box",
  "White",
  "Put",
  "Blue",
  "Put",
  "Here",
  "Then",
  "Blue",
  "Put",
  "Black",
  "Thing",
  "Yellow",
  "If",
  "Some",
  "White",
  "Yellow",
  "Good",
  "Then",
  "Then",
  "Box",
  "All",
  "Take",
  "Blue",
  "White",
  "Also",
  "Red",
  "This",
  "Be",
  "All",
];
// ---------------------------------------------------------

const generateStageAWordList = (): string[] =>
  SPECIFIC_WORD_LIST.map((w) => w.toLowerCase());
const generateStageBWordList = (): string[] =>
  STAGE_B_SPECIFIC_WORDS.map((w) => w.toLowerCase());

export default function AuditoryAttentionTest() {
  const router = useRouter();
  const [childData, setChildData] = useState<any>(null);
  const [testCompleted, setTestCompleted] = useState(false);

  const [currentStage, setCurrentStage] = useState<TestStage>("A");
  const [phase, setPhase] = useState<TestPhase>("instructions");
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentWord, setCurrentWord] = useState("");
  const [squaresInBox, setSquaresInBox] = useState({
    red: 0,
    yellow: 0,
    blue: 0,
    black: 0,
  });
  const [correctPlacements, setCorrectPlacements] = useState(0);
  const [incorrectPlacements, setIncorrectPlacements] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [demoStep, setDemoStep] = useState(0);
  const [demoSquaresInBox, setDemoSquaresInBox] = useState({
    red: 0,
    yellow: 0,
    blue: 0,
  });
  const [isAutoClicking, setIsAutoClicking] = useState(false);
  const [autoClickColor, setAutoClickColor] = useState("");
  const [usedWordIndices, setUsedWordIndices] = useState<Set<number>>(
    new Set()
  );
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [allowInteraction, setAllowInteraction] = useState<boolean>(false); // lock interactions until instructions finish

  const [stageAWordList] = useState(() => generateStageAWordList());
  const [stageBWordList] = useState(() => generateStageBWordList());

  const [stageAResults, setStageAResults] = useState({
    correct: 0,
    incorrect: 0,
    forgotten: 0,
  });
  const [stageBResults, setStageBResults] = useState({
    correct: 0,
    incorrect: 0,
    forgotten: 0,
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // audio containers
  const audioMapRef = useRef<Record<string, HTMLAudioElement | null>>({});
  const sfxMapRef = useRef<Record<string, HTMLAudioElement | null>>({});
  const instructionAudioRef = useRef<HTMLAudioElement | null>(null);

  // UI/audio flags
  const [isInstructionPlaying, setIsInstructionPlaying] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);

  // Load child data
  useEffect(() => {
    try {
      const data = localStorage.getItem("childData");
      if (!data) {
        router.push("/");
        return;
      }
      setChildData(JSON.parse(data));
    } catch (e) {
      console.warn("Could not parse childData from localStorage", e);
      router.push("/");
    }
  }, [router]);

  // Helper: get current stage data
  const getCurrentStageData = useCallback(() => {
    if (currentStage === "A") {
      return {
        wordList: stageAWordList,
        totalWords: STAGE_A_WORDS,
        duration: STAGE_A_WORDS,
      };
    }
    return {
      wordList: stageBWordList,
      totalWords: STAGE_B_WORDS,
      duration: STAGE_B_WORDS,
    };
  }, [currentStage, stageAWordList, stageBWordList]);

  // Preload word audio and sfx once on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    const uniqueWords = new Set<string>([...stageAWordList, ...stageBWordList]);
    const map: Record<string, HTMLAudioElement | null> = {};
    uniqueWords.forEach((word) => {
      const fileName = word
        ? word.charAt(0).toUpperCase() + word.slice(1) + ".ogg"
        : "";
      const src = `/audio/test1-3/${fileName}`;
      if (!fileName) {
        map[word] = null;
        return;
      }
      const audio = new Audio(src);
      audio.preload = "auto";
      map[word] = null;
      audio.addEventListener("canplaythrough", () => {
        map[word] = audio;
      });
      audio.addEventListener("error", () => {
        console.warn(`Audio for "${word}" not found at ${src}`);
        map[word] = null;
      });
      audio.load();
    });

    const sfxFiles: Record<string, string> = {
      select: "/audio/sfx/select.mp3",
      start: "/audio/sfx/start.mp3",
      finish: "/audio/sfx/finish.mp3",
    };

    const sfxMap: Record<string, HTMLAudioElement | null> = {};
    Object.entries(sfxFiles).forEach(([k, src]) => {
      try {
        const a = new Audio(src);
        a.preload = "auto";
        sfxMap[k] = a;
      } catch {
        sfxMap[k] = null;
      }
    });

    audioMapRef.current = map;
    sfxMapRef.current = sfxMap;

    return () => {
      Object.values(audioMapRef.current).forEach((a) => {
        if (a) {
          try {
            a.pause();
            a.src = "";
          } catch {}
        }
      });
      Object.values(sfxMapRef.current).forEach((a) => {
        if (a) {
          try {
            a.pause();
            a.src = "";
          } catch {}
        }
      });
      audioMapRef.current = {};
      sfxMapRef.current = {};
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // sfx play helper
  const playSfx = useCallback((key: "select" | "start" | "finish") => {
    const audio = sfxMapRef.current[key];
    if (audio) {
      try {
        audio.currentTime = 0;
        void audio.play().catch(() => {});
      } catch {}
    } else {
      try {
        const t = new Audio(`/audio/sfx/${key}.mp3`);
        t.preload = "auto";
        void t.play().catch(() => {});
      } catch {}
    }
  }, []);

  // play audio for a given spoken word (if present)
  const playAudioForWord = useCallback((word: string) => {
    if (typeof window === "undefined") return;
    const a = audioMapRef.current[word];
    if (a) {
      try {
        a.pause();
        a.currentTime = 0;
        void a.play().catch(() => {});
      } catch (err) {
        console.warn("Audio play failed for word:", word, err);
      }
    }
  }, []);

  // helper: instruction src (different per stage)
  const getInstructionSrcForStage = (stage: TestStage) =>
    stage === "A" ? "/audio/test2-1/test2-1.ogg" : "/audio/test2-1/test2-2.ogg";

  // Function that actually starts the word sequence (called after instruction audio ends)
  const startWordSequence = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // enable interaction now that words will start
    setAllowInteraction(true);

    setPhase("running");
    setCurrentWordIndex(0);
    setUsedWordIndices(new Set());
    setCorrectPlacements(0);
    setIncorrectPlacements(0);
    setSquaresInBox({ red: 0, yellow: 0, blue: 0, black: 0 });
    setCurrentWord("");
    setTimeRemaining(getCurrentStageData().duration);
    setIsPaused(false);

    playSfx("start");

    const { wordList: currentWordList, totalWords: currentTotalWords } =
      getCurrentStageData();
    let wordIndex = 0;

    intervalRef.current = setInterval(() => {
      if (wordIndex >= currentTotalWords) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        setAllowInteraction(false); // lock interaction after test ends
        if (currentStage === "A") {
          setPhase("stage-complete");
        } else {
          setTestCompleted(true);
        }
        playSfx("finish");
        return;
      }

      const word = currentWordList[wordIndex];
      setCurrentWord(word);
      setCurrentWordIndex((idx) => idx + 1);
      playAudioForWord(word);
      setTimeRemaining((prev) => Math.max(0, prev - 1));
      wordIndex++;
    }, WORD_INTERVAL);
  }, [currentStage, getCurrentStageData, playAudioForWord, playSfx]);

  // START TEST: plays instruction audio first, then starts words when it ends
  const startTest = useCallback(async () => {
    // Clear any running interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Prepare visible state and lock interaction until instructions finish
    setPhase("running"); // show running state while instructions play
    setCurrentWordIndex(0);
    setUsedWordIndices(new Set());
    setCorrectPlacements(0);
    setIncorrectPlacements(0);
    setSquaresInBox({ red: 0, yellow: 0, blue: 0, black: 0 });
    setCurrentWord("");
    setTimeRemaining(getCurrentStageData().duration);
    setIsPaused(false);
    setAllowInteraction(false); // disable interaction until instructions finish

    // Setup instruction audio
    try {
      const src = getInstructionSrcForStage(currentStage);
      const inst = new Audio(src);
      inst.preload = "auto";
      inst.playsInline = true;

      setIsInstructionPlaying(true);
      setAutoplayBlocked(false);

      inst.onended = () => {
        setIsInstructionPlaying(false);
        playSfx("start");
        startWordSequence();
      };

      inst.onerror = () => {
        console.warn("Instruction audio error - starting test immediately");
        setIsInstructionPlaying(false);
        playSfx("start");
        startWordSequence();
      };

      instructionAudioRef.current = inst;
      await inst.play();
    } catch (err) {
      // autoplay blocked or failed - start immediately and allow interaction
      console.warn(
        "Instruction audio autoplay blocked or failed, starting immediately",
        err
      );
      setIsInstructionPlaying(false);
      setAutoplayBlocked(true);
      setAllowInteraction(true); // allow interaction because we start immediately
      playSfx("start");
      startWordSequence();
    }
  }, [currentStage, getCurrentStageData, playSfx, startWordSequence]);

  // Auto-start test on load
  useEffect(() => {
    if (childData && phase === "instructions") {
      void startTest();
    }
  }, [childData, phase, startTest]);

  // pause / resume
  const pauseTest = useCallback(() => {
    setIsPaused(true);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    const a = audioMapRef.current[currentWord];
    if (a) {
      try {
        a.pause();
      } catch {}
    }
    if (instructionAudioRef.current && isInstructionPlaying) {
      try {
        instructionAudioRef.current.pause();
      } catch {}
    }
  }, [currentWord, isInstructionPlaying]);

  const resumeTest = useCallback(() => {
    // If instruction audio is paused and still playing phase, resume it
    if (
      instructionAudioRef.current &&
      instructionAudioRef.current.paused &&
      isInstructionPlaying
    ) {
      try {
        void instructionAudioRef.current.play().catch(() => {});
        setIsPaused(false);
        return;
      } catch {}
    }

    setIsPaused(false);
    const { wordList: currentWordList, totalWords: currentTotalWords } =
      getCurrentStageData();
    let wordIndex = currentWordIndex;

    intervalRef.current = setInterval(() => {
      if (wordIndex >= currentTotalWords) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        setAllowInteraction(false);
        if (currentStage === "A") {
          setPhase("stage-complete");
        } else {
          setTestCompleted(true);
        }
        playSfx("finish");
        return;
      }

      const word = currentWordList[wordIndex];
      setCurrentWord(word);
      setCurrentWordIndex((idx) => idx + 1);
      playAudioForWord(word);
      setTimeRemaining((prev) => Math.max(0, prev - 1));
      wordIndex++;
    }, WORD_INTERVAL);
  }, [
    currentStage,
    currentWordIndex,
    getCurrentStageData,
    playAudioForWord,
    playSfx,
    isInstructionPlaying,
  ]);

  const resetTest = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setPhase("ready");
    setCurrentWordIndex(0);
    setCurrentWord("");
    setSquaresInBox({ red: 0, yellow: 0, blue: 0, black: 0 });
    setCorrectPlacements(0);
    setIncorrectPlacements(0);
    setIsPaused(false);
    setUsedWordIndices(new Set());
    setAllowInteraction(false); // lock again after reset
    if (instructionAudioRef.current) {
      try {
        instructionAudioRef.current.pause();
        instructionAudioRef.current.currentTime = 0;
      } catch {}
      instructionAudioRef.current = null;
    }
  }, []);

  // square click handling (play select sfx)
  const handleSquareClick = useCallback(
    (color: string) => {
      if (phase !== "running" || isPaused) return;
      if (!allowInteraction) return; // don't allow selection until instruction finished
      playSfx("select");

      const wordList = currentStage === "A" ? stageAWordList : stageBWordList;

      let targetWordIndex = -1;
      let isCorrect = false;

      if (currentStage === "A") {
        if (color === "red") {
          for (
            let i = currentWordIndex - 1;
            i >= Math.max(0, currentWordIndex - 3);
            i--
          ) {
            if (wordList[i] === "red" && !usedWordIndices.has(i)) {
              targetWordIndex = i;
              isCorrect = true;
              break;
            }
          }
          if (isCorrect) {
            setSquaresInBox((p) => ({ ...p, red: p.red + 1 }));
            setStageAResults((p) => ({ ...p, correct: p.correct + 1 }));
          } else {
            setStageAResults((p) => ({ ...p, incorrect: p.incorrect + 1 }));
          }
        } else {
          setStageAResults((p) => ({ ...p, incorrect: p.incorrect + 1 }));
        }
      } else {
        if (color === "yellow") {
          for (
            let i = currentWordIndex - 1;
            i >= Math.max(0, currentWordIndex - 3);
            i--
          ) {
            if (wordList[i] === "red" && !usedWordIndices.has(i)) {
              targetWordIndex = i;
              isCorrect = true;
              break;
            }
          }
          if (isCorrect) {
            setSquaresInBox((p) => ({ ...p, yellow: p.yellow + 1 }));
            setStageBResults((p) => ({ ...p, correct: p.correct + 1 }));
          } else {
            setStageBResults((p) => ({ ...p, incorrect: p.incorrect + 1 }));
          }
        } else if (color === "red") {
          for (
            let i = currentWordIndex - 1;
            i >= Math.max(0, currentWordIndex - 3);
            i--
          ) {
            if (wordList[i] === "yellow" && !usedWordIndices.has(i)) {
              targetWordIndex = i;
              isCorrect = true;
              break;
            }
          }
          if (isCorrect) {
            setSquaresInBox((p) => ({ ...p, red: p.red + 1 }));
            setStageBResults((p) => ({ ...p, correct: p.correct + 1 }));
          } else {
            setStageBResults((p) => ({ ...p, incorrect: p.incorrect + 1 }));
          }
        } else if (color === "blue") {
          for (
            let i = currentWordIndex - 1;
            i >= Math.max(0, currentWordIndex - 3);
            i--
          ) {
            if (wordList[i] === "blue" && !usedWordIndices.has(i)) {
              targetWordIndex = i;
              isCorrect = true;
              break;
            }
          }
          if (isCorrect) {
            setSquaresInBox((p) => ({ ...p, blue: p.blue + 1 }));
            setStageBResults((p) => ({ ...p, correct: p.correct + 1 }));
          } else {
            setStageBResults((p) => ({ ...p, incorrect: p.incorrect + 1 }));
          }
        } else {
          setStageBResults((p) => ({ ...p, incorrect: p.incorrect + 1 }));
        }
      }

      if (isCorrect && targetWordIndex !== -1) {
        setUsedWordIndices((p) => new Set([...p, targetWordIndex]));
        setCorrectPlacements((p) => p + 1);
      } else {
        setIncorrectPlacements((p) => p + 1);
      }
    },
    [
      phase,
      isPaused,
      allowInteraction,
      playSfx,
      currentStage,
      currentWordIndex,
      usedWordIndices,
      stageAWordList,
      stageBWordList,
    ]
  );

  // demo logic (unchanged but using playAudioForWord)
  const demonstrateRule = useCallback(
    (word: string) => {
      playAudioForWord(word);
    },
    [playAudioForWord]
  );

  useEffect(() => {
    if (phase === "stage-b-demo") {
      const demoRules = [
        {
          word: "red",
          color: "yellow",
          description: "عندما تسمع 'أحمر'، ضع مربعاً أصفر داخل الصندوق",
        },
        {
          word: "yellow",
          color: "red",
          description: "عندما تسمع 'أصفر'، ضع مربعاً أحمر داخل الصندوق",
        },
        {
          word: "blue",
          color: "blue",
          description: "عندما تسمع 'أزرق'، ضع مربعاً أزرق داخل الصندوق",
        },
      ];

      let currentIndex = 0;

      const runExample = () => {
        const currentRule = demoRules[currentIndex];
        demonstrateRule(currentRule.word);

        setTimeout(() => {
          setIsAutoClicking(true);
          setAutoClickColor(currentRule.color);
          setDemoSquaresInBox((prev) => ({
            ...prev,
            [currentRule.color]: (prev as any)[currentRule.color] + 1,
          }));
          setTimeout(() => {
            setIsAutoClicking(false);
            setAutoClickColor("");
          }, 500);
        }, 1000);
      };

      const initialTimer = setTimeout(runExample, 1000);
      const interval = setInterval(() => {
        currentIndex = (currentIndex + 1) % demoRules.length;
        runExample();
      }, 3000);

      return () => {
        clearTimeout(initialTimer);
        clearInterval(interval);
      };
    }
  }, [phase, demonstrateRule]);

  // cleanup audio & intervals on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      Object.values(audioMapRef.current).forEach((a) => {
        if (a) {
          try {
            a.pause();
            a.currentTime = 0;
          } catch {}
        }
      });
      if (instructionAudioRef.current) {
        try {
          instructionAudioRef.current.pause();
          instructionAudioRef.current.currentTime = 0;
        } catch {}
      }
      Object.values(sfxMapRef.current).forEach((a) => {
        if (a) {
          try {
            a.pause();
            a.currentTime = 0;
          } catch {}
        }
      });
    };
  }, []);

  // Handle test completion
  useEffect(() => {
    if (testCompleted) {
      const stageATargetWords = stageAWordList.filter(
        (w) => w === "red"
      ).length;
      const stageBTargetWords = stageBWordList.filter((w) =>
        ["red", "yellow", "blue"].includes(w)
      ).length;

      const stageAForgotten =
        stageATargetWords - stageAResults.correct - stageAResults.incorrect;
      const stageBForgotten =
        stageBTargetWords - stageBResults.correct - stageBResults.incorrect;

      const finalStageAResults = {
        ...stageAResults,
        forgotten: Math.max(0, stageAForgotten),
      };
      const finalStageBResults = {
        ...stageBResults,
        forgotten: Math.max(0, stageBForgotten),
      };

      const results = {
        testType: "auditory-attention",
        childName: `${childData?.firstName || ""} ${childData?.lastName || ""}`,
        childIQ: childData?.iq || "",
        stageA: finalStageAResults,
        stageB: finalStageBResults,
        targetWords: {
          stageA: stageATargetWords,
          stageB: stageBTargetWords,
        },
        completedAt: new Date().toISOString(),
      };

      try {
        localStorage.setItem("thirdTestResults", JSON.stringify(results));
      } catch (e) {
        console.warn("Could not save results to localStorage", e);
      }

      setTimeout(() => {
        router.push("/test1-3/results");
      }, 2000);
    }
  }, [
    testCompleted,
    router,
    stageAResults,
    stageBResults,
    stageAWordList,
    stageBWordList,
    childData,
  ]);

  // progress percentage
  const progressValue =
    (currentWordIndex /
      (currentStage === "A" ? STAGE_A_WORDS : STAGE_B_WORDS)) *
    100;

  // Proceed to stage B
  const proceedToStageB = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setCurrentStage("B");
    setPhase("stage-b-demo");
    setDemoStep(0);
    setCurrentWordIndex(0);
    setCurrentWord("");
    setSquaresInBox({ red: 0, yellow: 0, blue: 0, black: 0 });
    setCorrectPlacements(0);
    setIncorrectPlacements(0);
    setAllowInteraction(false);
  }, []);

  const proceedFromDemo = useCallback(() => {
    setPhase("ready");
    setDemoStep(0);
  }, []);

  // When user chooses to skip or manually start instructions
  const onUnderstandContinue = useCallback(async () => {
    // stop instruction sound if playing
    if (instructionAudioRef.current) {
      try {
        instructionAudioRef.current.pause();
        instructionAudioRef.current.currentTime = 0;
      } catch {}
      instructionAudioRef.current = null;
      setIsInstructionPlaying(false);
    }
    // start the test immediately
    await startTest();
  }, [startTest]);

  const onFallbackPlayInstructions = useCallback(async () => {
    setAutoplayBlocked(false);
    setIsInstructionPlaying(true);
    try {
      const src = getInstructionSrcForStage(currentStage);
      const inst = new Audio(src);
      inst.preload = "auto";
      inst.playsInline = true;
      inst.onended = () => {
        setIsInstructionPlaying(false);
        playSfx("start");
        startWordSequence();
      };
      inst.onerror = () => {
        setIsInstructionPlaying(false);
        playSfx("start");
        startWordSequence();
      };
      instructionAudioRef.current = inst;
      await inst.play().catch(() => {
        // If still blocked, just start immediately
        setIsInstructionPlaying(false);
        setAllowInteraction(true);
        playSfx("start");
        startWordSequence();
      });
    } catch {
      setIsInstructionPlaying(false);
      setAllowInteraction(true);
      playSfx("start");
      startWordSequence();
    }
  }, [currentStage, playSfx, startWordSequence]);

  // ------------------------- RENDER BRANCHES -------------------------
  if (phase === "instructions") {
    return (
      <div className="min-h-screen bg-background p-8" dir="rtl">
        <div className="max-w-4xl mx-auto">
          <Button
            onClick={() => router.back()}
            variant="ghost"
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 ml-2" /> العودة إلى الاختبارات
          </Button>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                الاختبار الثالث: الانتباه السمعي - المرحلة {currentStage}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {currentStage === "A" ? (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">
                    تعليمات المرحلة الأولى:
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p>
                      • <strong>الوقت:</strong> 180 ثانية (3 دقائق)
                    </p>
                    <p>
                      • <strong>المهمة:</strong> ستسمع 180 كلمة، كلمة واحدة كل
                      ثانية
                    </p>
                    <p>
                      • <strong>الهدف:</strong> عندما تسمع كلمة "أحمر"، انقر على
                      المربع الأحمر لوضعه في الصندوق
                    </p>
                    <p>
                      • <strong>مهم:</strong> انقر فقط عندما تسمع "أحمر" - تجاهل
                      جميع الكلمات الأخرى
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">
                    تعليمات المرحلة الثانية:
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p>
                      • <strong>الوقت:</strong> 55 ثانية
                    </p>
                    <p>
                      • <strong>المهمة:</strong> ستسمع 55 كلمة، كلمة واحدة كل
                      ثانية
                    </p>
                    <p>
                      • <strong>القواعد الجديدة:</strong>
                    </p>
                    <ul className="mr-4 space-y-1">
                      <li>
                        - عندما تسمع "أحمر"، انقر على المربع{" "}
                        <strong>الأصفر</strong>
                      </li>
                      <li>
                        - عندما تسمع "أصفر"، انقر على المربع{" "}
                        <strong>الأحمر</strong>
                      </li>
                      <li>
                        - عندما تسمع "أزرق"، انقر على المربع{" "}
                        <strong>الأزرق</strong>
                      </li>
                    </ul>
                    <p>
                      • <strong>مهم:</strong> الألوان مبدلة للأحمر والأصفر!
                    </p>
                  </div>
                </div>
              )}

              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm font-medium">
                  {currentStage === "A"
                    ? 'مثال: عندما تسمع "أحمر"، انقر على المربع الأحمر. عندما تسمع كلمة أخرى، لا تفعل شيئاً.'
                    : 'مثال: عندما تسمع "أحمر"، انقر على المربع الأصفر. عندما تسمع "أصفر"، انقر على المربع الأحمر.'}
                </p>
              </div>

              <div className="flex items-center gap-4">
                {isInstructionPlaying ? (
                  <div className="text-sm text-green-700 font-medium">
                    🔊 تشغيل التعليمات... سيتم بدء الاختبار بعد انتهاء التعليمات
                  </div>
                ) : autoplayBlocked ? (
                  <div className="space-y-2">
                    <p className="text-sm text-yellow-700">
                      تم حظر التشغيل التلقائي للصوت من قبل المتصفح. اضغط لتشغيل
                      التعليمات يدوياً أو تخطيها.
                    </p>
                    <div className="flex gap-2">
                      <Button onClick={onFallbackPlayInstructions} size="lg">
                        تشغيل التعليمات ثم البدء
                      </Button>
                      <Button
                        onClick={onUnderstandContinue}
                        variant="outline"
                        size="lg"
                      >
                        تخطي وتشغيل الاختبار الآن
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Button onClick={startTest} size="lg">
                      فهمت - تشغيل التعليمات والبدء
                    </Button>
                    <Button
                      onClick={() => {
                        setPhase("ready");
                      }}
                      variant="outline"
                      size="lg"
                    >
                      متابعة بدون تعليمات
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (phase === "stage-b-demo") {
    const demoRules = [
      {
        word: "أحمر",
        color: "أصفر",
        description: "عندما تسمع 'أحمر'، ضع مربعاً أصفر داخل الصندوق",
      },
      {
        word: "أصفر",
        color: "أحمر",
        description: "عندما تسمع 'أصفر'، ضع مربعاً أحمر داخل الصندوق",
      },
      {
        word: "أزرق",
        color: "أزرق",
        description: "عندما تسمع 'أزرق'، ضع مربعاً أزرق داخل الصندوق",
      },
    ];

    return (
      <div className="min-h-screen bg-background p-8" dir="rtl">
        <div className="max-w-6xl mx-auto">
          <Button
            onClick={() => router.back()}
            variant="ghost"
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 ml-2" /> العودة إلى الاختبارات
          </Button>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                المرحلة الثانية - العرض التوضيحي
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-brand-50 p-4 rounded-lg border border-brand-200">
                <p className="text-sm text-brand-800 mb-4">
                  ستسمع سلسلة من الكلمات مختلفة عن السلسلة الأولى، ولكن هذه
                  المرة يجب عليك اتباع قواعد جديدة. شاهد العرض التوضيحي
                  التلقائي:
                </p>
                <div className="space-y-4">
                  {demoRules.map((rule, index) => (
                    <div key={index} className="bg-white p-3 rounded-lg border">
                      <p className="text-sm font-medium">{rule.description}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>مهم:</strong> لا تلمس المربعات إلا إذا كنت تريد وضع
                    مربع داخل الصندوق. إذا أخطأت، لا تعيد المربع واستمر في
                    الاستماع مع التركيز.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    المربعات الملونة
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {(["yellow", "black", "red", "blue"] as const).map(
                      (color) => (
                        <div
                          key={color}
                          className={`w-24 h-24 rounded-lg transition-all duration-300 ${
                            color === "yellow"
                              ? "bg-yellow-400"
                              : color === "black"
                              ? "bg-black"
                              : color === "red"
                              ? "bg-red-500"
                              : "bg-blue-500"
                          } ${
                            isAutoClicking && autoClickColor === color
                              ? "scale-110 ring-4 ring-green-400 animate-bounce"
                              : ""
                          }`}
                        />
                      )
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">صندوق التجميع</h3>
                  <div className="w-48 h-32 bg-gray-100 border-4 border-gray-300 rounded-lg relative overflow-hidden">
                    <div className="absolute inset-2 flex flex-wrap gap-1 content-start">
                      {Object.entries(demoSquaresInBox).map(([color, count]) =>
                        Array.from({ length: count }, (_, i) => (
                          <div
                            key={`${color}-${i}`}
                            className={`w-4 h-4 rounded-sm ${
                              color === "yellow"
                                ? "bg-yellow-400"
                                : color === "red"
                                ? "bg-red-500"
                                : "bg-blue-500"
                            }`}
                          />
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-center pt-6">
                <Button onClick={proceedFromDemo} size="lg" className="px-8">
                  بدء اختبار المرحلة الثانية
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (phase === "stage-complete") {
    const accuracy =
      correctPlacements + incorrectPlacements > 0
        ? (correctPlacements / (correctPlacements + incorrectPlacements)) * 100
        : 0;

    return (
      <div className="min-h-screen bg-background p-8" dir="rtl">
        <div className="max-w-4xl mx-auto">
          <Button
            onClick={() => router.back()}
            variant="ghost"
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 ml-2" /> العودة إلى الاختبارات
          </Button>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">اكتملت المرحلة الأولى!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <p>
                    <strong>المربعات الحمراء الموضوعة:</strong>{" "}
                    {squaresInBox.red}
                  </p>
                  <p>
                    <strong>الوضعات الصحيحة:</strong> {correctPlacements}
                  </p>
                  <p>
                    <strong>الوضعات الخاطئة:</strong> {incorrectPlacements}
                  </p>
                </div>
                <div className="space-y-2">
                  <p>
                    <strong>الدقة:</strong> {accuracy.toFixed(1)}%
                  </p>
                  <p>
                    <strong>إجمالي الكلمات المسموعة:</strong> {STAGE_A_WORDS}
                  </p>
                </div>
              </div>

              <div className="bg-brand-50 p-4 rounded-lg border border-brand-200">
                <h3 className="font-semibold text-brand-900 mb-2">
                  مستعد للمرحلة الثانية؟
                </h3>
                <p className="text-sm text-brand-800">
                  المرحلة الثانية لها قواعد مختلفة - ستحتاج إلى تبديل الألوان
                  للكلمات الحمراء والصفراء!
                </p>
              </div>

              <div className="flex gap-4">
                <Button onClick={proceedToStageB} size="lg">
                  متابعة إلى المرحلة الثانية
                </Button>
                <Button onClick={() => router.back()} variant="outline">
                  العودة إلى الاختبارات
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (phase === "ready") {
    return (
      <div className="min-h-screen bg-background p-8" dir="rtl">
        <div className="max-w-4xl mx-auto">
          <Button
            onClick={() => router.back()}
            variant="ghost"
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 ml-2" /> العودة إلى الاختبارات
          </Button>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                جاهز لبدء المرحلة {currentStage}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p>
                انقر على "بدء الاختبار" عندما تكون مستعداً للبدء. سيبدأ الاختبار
                فوراً ويستمر لمدة{" "}
                {currentStage === "A" ? "3 دقائق" : "55 ثانية"}.
              </p>
              <div className="flex gap-4">
                <Button onClick={startTest} size="lg">
                  <Play className="w-4 h-4 ml-2" /> بدء الاختبار
                </Button>
                <Button
                  onClick={() => setPhase("instructions")}
                  variant="outline"
                >
                  مراجعة التعليمات
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Running UI (main)
  return (
    <div className="min-h-screen bg-background p-8" dir="rtl">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <Button onClick={() => router.push("/tests")} variant="ghost">
            <ArrowLeft className="w-4 h-4 ml-2" /> العودة إلى الاختبارات
          </Button>

          <div className="flex gap-2">
            {isPaused ? (
              <Button onClick={resumeTest} size="sm">
                <Play className="w-4 h-4 ml-2" /> استئناف
              </Button>
            ) : (
              <Button onClick={pauseTest} size="sm" variant="outline">
                <Pause className="w-4 h-4 ml-2" /> إيقاف مؤقت
              </Button>
            )}
            <Button onClick={resetTest} size="sm" variant="outline">
              <RotateCcw className="w-4 h-4 ml-2" /> إعادة تعيين
            </Button>
          </div>
        </div>

        <div className="flex justify-start items-start mb-6">
          <CircularProgress
            timeLeft={timeRemaining}
            totalTime={
              currentStage === "A" ? STAGE_A_WORDS * 2 : STAGE_B_WORDS * 2
            }
            size={80}
            strokeWidth={6}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">المربعات الملونة</h3>
            <div className="grid grid-cols-2 gap-4">
              {(["yellow", "black", "red", "blue"] as const).map((color) => {
                const disabledCls = !allowInteraction
                  ? "pointer-events-none opacity-50 cursor-not-allowed"
                  : "hover:scale-105";
                return (
                  <div
                    key={color}
                    onClick={() => handleSquareClick(color)}
                    className={`w-32 h-32 rounded-lg cursor-pointer transition-all duration-200 ${disabledCls} ${
                      color === "yellow"
                        ? "bg-yellow-400"
                        : color === "black"
                        ? "bg-black"
                        : color === "red"
                        ? "bg-red-500"
                        : "bg-blue-500"
                    }`}
                    role="button"
                    aria-disabled={!allowInteraction}
                  />
                );
              })}
            </div>
            {!allowInteraction && phase === "running" && (
              <p className="text-sm text-yellow-700 mt-2">
                لا يمكن التفاعل مع المربعات حتى انتهاء تشغيل التعليمات.
              </p>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold">صندوق التجميع</h3>
            <div className="w-64 h-48 bg-gray-100 border-4 border-gray-300 rounded-lg relative overflow-hidden shadow-inner">
              <div className="absolute inset-4 flex flex-wrap gap-1 content-start">
                {Object.entries(squaresInBox).map(([color, count]) =>
                  Array.from({ length: count }, (_, i) => (
                    <div
                      key={`${color}-${i}`}
                      className={`w-6 h-6 rounded-sm ${
                        color === "yellow"
                          ? "bg-yellow-400"
                          : color === "black"
                          ? "bg-black"
                          : color === "red"
                          ? "bg-red-500"
                          : "bg-blue-500"
                      }`}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {isPaused && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card>
              <CardContent className="pt-6 text-center">
                <h3 className="text-lg font-semibold mb-4">
                  الاختبار متوقف مؤقتاً
                </h3>
                <Button onClick={resumeTest}>
                  <Play className="w-4 h-4 ml-2" /> استئناف الاختبار
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* completion overlay */}
      {testCompleted && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="text-center text-xl">
                انتهى الاختبار!
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="text-lg">
                <p>
                  المرحلة أ: {stageAResults.correct} صحيح,{" "}
                  {stageAResults.incorrect} خطأ
                </p>
                <p>
                  المرحلة ب: {stageBResults.correct} صحيح,{" "}
                  {stageBResults.incorrect} خطأ
                </p>
                <p>
                  النقاط الخام الإجمالية:{" "}
                  {stageAResults.correct -
                    stageAResults.incorrect +
                    (stageBResults.correct - stageBResults.incorrect)}
                </p>
              </div>
              <p className="text-gray-600">جاري الانتقال للنتائج...</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
