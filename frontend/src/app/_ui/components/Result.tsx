"use client";

import { useState, useEffect } from "react";
import Lottie from "lottie-react";
import { motion } from "framer-motion";
import { Button } from "./Button";
import { authAPI } from "../utils/apiUtils";
import { useRouter } from "next/navigation";

import confettiAnimation from "../assets/animations/confetti.json";
import { DonutChart } from "./DonutChart";

interface ResultProps {
  results: {
    correctAnswers: number;
    wrongAnswers: number;
    secondsUsed: number;
  };
  totalQuestions: number;
  topic: string;
  subject: string;
  testCode?: string;
}

export const Result = ({ results, totalQuestions, topic, subject, testCode }: ResultProps) => {
  const { correctAnswers, wrongAnswers, secondsUsed } = results;
  const [error, setError] = useState("");
  const [resultSaved, setResultSaved] = useState(false);
  const router = useRouter();

  const scorePercentage = Math.round((correctAnswers / totalQuestions) * 100);
  const timePercentage = Math.round((secondsUsed / (60 * totalQuestions)) * 100);

  useEffect(() => {
    const saveQuizResult = async () => {
      try {
        if (!resultSaved) {
          const quizTestCode = testCode || Math.random().toString(36).substr(2, 9);
          await authAPI.saveQuizResult({
            subject,
            topic,
            score: correctAnswers,
            totalQuestions,
            timeTaken: secondsUsed,
            testCode: quizTestCode,
          });
          setResultSaved(true);
        }
      } catch (err: any) {
        setError(
          err?.response?.data?.error || "Failed to save quiz result. Please try again."
        );
        console.error("Save result error:", err);
      }
    };

    saveQuizResult();
  }, [correctAnswers, resultSaved, secondsUsed, subject, testCode, topic, totalQuestions]);

  const handleRetry = () => {
    window.location.reload();
  };

  const handleViewReportCard = () => {
    router.push("/report-card");
  };

  const getFeedback = () => {
    if (scorePercentage >= 80) return "Excellent work!";
    if (scorePercentage >= 60) return "Good job!";
    if (scorePercentage >= 40) return "Keep practicing!";
    return "Don't give up!";
  };

  return (
    <motion.div
      key="result"
      className="w-full h-full flex justify-center p-5 overflow-y-auto"
      initial={{ clipPath: "circle(0% at 50% 50%)" }}
      animate={{ clipPath: "circle(100% at 50% 50%)" }}
      transition={{ duration: 0.5 }}
      style={{
        background: "linear-gradient(135deg, #FF6A66 0%, #FF9A8B 100%)",
      }}
    >
      <div className="flex flex-col text-black font-bold text-center w-full max-w-2xl mx-auto">
        <div className="bg-white/20 backdrop-blur-sm py-3 px-4 rounded-xl">
          <h1 className="font-bold text-xl text-white">Daily Practice Paper Test Results</h1>
        </div>

        <div className="mt-6 flex-1 bg-white border border-brand-light-gray rounded-2xl shadow-lg flex flex-col items-center py-7 px-4">
          <div className="relative">
            <Lottie
              animationData={confettiAnimation}
              loop={false}
              autoplay
              style={{ width: "170px", height: "170px" }}
            />
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
              {topic}
            </div>
          </div>

          <h3 className="text-brand-midnight text-3xl font-bold mt-4">{getFeedback()}</h3>

          <div className="flex flex-wrap items-center justify-center mt-6 gap-6">
            <div className="flex flex-col items-center">
              <DonutChart
                className="w-32 h-32"
                total={60 * totalQuestions}
                used={secondsUsed}
                type="time"
                data={[
                  {
                    label: "Time Used",
                    value: secondsUsed,
                    color: "#4F46E5",
                  },
                  {
                    label: "Time Left",
                    value: 60 * totalQuestions - secondsUsed,
                    color: "#F0F0F0",
                  },
                ]}
              />
              <div className="mt-2 text-center">
                <p className="text-sm font-semibold text-gray-700">Time Used</p>
                <p className="text-xs text-gray-500">{timePercentage}% of available time</p>
              </div>
            </div>

            <div className="flex flex-col items-center">
              <DonutChart
                className="w-32 h-32"
                type="questions"
                total={totalQuestions}
                used={correctAnswers}
                data={[
                  {
                    label: "Correct",
                    value: correctAnswers,
                    color: "#10B981",
                  },
                  {
                    label: "Wrong",
                    value: wrongAnswers,
                    color: "#EF4444",
                  },
                ]}
              />
              <div className="mt-2 text-center">
                <p className="text-sm font-semibold text-gray-700">Questions</p>
                <p className="text-xs text-gray-500">
                  {correctAnswers} correct, {wrongAnswers} wrong
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-3">
          <Button
            intent="primary"
            size="medium"
            block
            className="bg-gradient-to-r from-[#374CB7] to-[#4E61D8] hover:from-[#2a3b8e] hover:to-[#3a4ab8] text-white rounded-xl shadow-md font-medium flex items-center justify-center py-3.5"
            onClick={handleViewReportCard}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414A2 2 0 0016.414 5L14 2.586A2 2 0 0012.586 2H9z" />
              <path d="M3 8a2 2 0 012-2h2a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
            </svg>
            View Full Report Card
          </Button>

          <Button
            intent="primary"
            size="medium"
            block
            className="bg-gradient-to-r from-[#3EAA78] to-[#56C490] hover:from-[#35926A] hover:to-[#45A277] text-white rounded-xl shadow-md font-medium flex items-center justify-center py-3.5"
            onClick={handleRetry}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 01-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            Try Again
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
