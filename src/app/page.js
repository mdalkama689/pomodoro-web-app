"use client";

import { useEffect, useState, useRef } from "react";
import { IoSettingsOutline, IoPlay, IoPause, IoRefresh } from "react-icons/io5";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export default function Home() {
  const musicRef = useRef(null);

  const startMusic = () => {
    if (!musicRef.current) {
      musicRef.current = new Audio("/alarm.mp3");
    }
    musicRef.current.play();
  };

  const stopMusic = () => {
    if (musicRef.current) {
      musicRef.current.pause();
      musicRef.current.currentTime = 0;
    }
  };

  const [currentTimer, setCurrentTimer] = useState("pomodoro");
  const [durations, setDurations] = useState({
    pomodoro: "25:00",
    "short-break": "05:00",
    "long-break": "15:00",
  });
  const [timeLeft, setTimeLeft] = useState(0);
  const [intervalId, setIntervalId] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [musicDialogOpen, setMusicDialogOpen] = useState(false);

  useEffect(() => {
    const savedDurations = localStorage.getItem("durations");
    if (savedDurations) {
      setDurations(JSON.parse(savedDurations));
    }
  }, []);

  useEffect(() => {
    const d = durations[currentTimer] || "00:00";
    const [minutes, seconds] = d.split(":").map(Number);
    setTimeLeft(minutes * 60 + seconds);
  }, [currentTimer, durations]);

  const handleChangeButton = (value) => {
    setCurrentTimer(value);
  };

  const handleStartPause = () => {
    if (isRunning) {
      if (intervalId !== null) {
        clearInterval(intervalId);
        setIntervalId(null);
      }
    } else {
      const id = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            startMusic();
            clearInterval(id);
            setMusicDialogOpen(true);
            setIsRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      setIntervalId(id);
    }
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    if (intervalId !== null) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
    setIsRunning(false);
    const [minutes, seconds] = durations[currentTimer].split(":").map(Number);
    setTimeLeft(minutes * 60 + seconds);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  const handleDurationChange = (type, value) => {
    setDurations((prev) => ({
      ...prev,
      [type]: value,
    }));
  };

  const handleSaveDurations = () => {
    localStorage.setItem("durations", JSON.stringify(durations));
    setDialogOpen(false);
    const [minutes, seconds] = durations[currentTimer].split(":").map(Number);
    setTimeLeft(minutes * 60 + seconds);
  };

  const handleCloseMusicDialog = () => {
    setMusicDialogOpen(false);
  };

  const calculateProgress = () => {
    const totalDuration = durations[currentTimer];
    const [totalMinutes, totalSeconds] = totalDuration.split(":").map(Number);
    const totalSecondsDuration = totalMinutes * 60 + totalSeconds;
    return ((totalSecondsDuration - timeLeft) / totalSecondsDuration) * 100;
  };


  return (
    <div className="bg-gradient-to-r from-blue-500 to-purple-600 min-h-screen flex flex-col items-center justify-center gap-2 p-6">
      <h1 className="text-white text-4xl font-extrabold mb-4">Pomodoro Timer</h1>
      <div className="flex rounded-lg bg-zinc-800 p-2 gap-3">
        {["pomodoro", "short-break", "long-break"].map((type) => (
          <Button
            key={type}
            onClick={() => handleChangeButton(type)}
            className={`text-white px-4 py-2 rounded-md transition duration-300 ease-in-out focus:outline-none ${
              currentTimer === type
                ? type === "pomodoro"
                  ? "bg-red-600"
                  : type === "short-break"
                  ? "bg-green-600"
                  : "bg-blue-600"
                : "hover:bg-zinc-700"
            }`}
          >
            {type.replace("-", " ")}
          </Button>
        ))}
      </div>

      <div className="w-64 h-2 bg-zinc-700 rounded-full mt-4">
        <div
          className="h-full bg-red-600 rounded-full"
          style={{ width: `${calculateProgress()}%` }}
        />
      </div>

      <div className="rounded-full bg-zinc-800 w-64 h-64 flex items-center justify-center">
        <p className="text-white text-5xl font-bold">{formatTime(timeLeft)}</p>
      </div>

 
    

      <div className="flex gap-6 items-center justify-center mt-6">
        <Button
          onClick={handleStartPause}
          className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition duration-200 focus:outline-none"
        >
          {isRunning ? <IoPause /> : <IoPlay />}
        </Button>

        <button
          onClick={handleReset}
          className="text-white text-4xl cursor-pointer hover:text-red-600 transition duration-300 bg-transparent border-none outline-none"
        >
          <IoRefresh />
        </button>

   
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        
          <DialogTrigger asChild>
            <button className="text-white text-4xl cursor-pointer hover:text-gray-400 transition duration-300 bg-transparent border-none outline-none">
              <IoSettingsOutline />
            </button>
          </DialogTrigger>


          <DialogContent className="bg-zinc-900 text-white rounded-2xl p-6 shadow-xl w-[350px]">
            <h2 className="text-xl font-bold mb-6">⏱ Timer Settings</h2>

            <div className="space-y-4">
              {["pomodoro", "short-break", "long-break"].map((label) => (
                <div key={label}>
                  <label className="block mb-1 capitalize text-sm text-gray-300">
                    {label.replace("-", " ")}
                  </label>
                  <Input
                    type="text"
                    value={durations[label]}
                    onChange={(e) => handleDurationChange(label, e.target.value)}
                    placeholder="MM:SS"
                    className="bg-zinc-800 text-white border border-zinc-700 focus:ring-2 focus:ring-red-600"
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <Button
                variant="ghost"
                className="hover:bg-zinc-800 text-gray-300"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveDurations}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Save
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

  
      <Dialog open={musicDialogOpen} onOpenChange={setMusicDialogOpen}>
        <DialogContent className="bg-zinc-900 text-white rounded-2xl p-6 shadow-xl w-[350px]">
          <DialogHeader>
            <DialogTitle>Timer Complete!</DialogTitle>
            <DialogDescription>
              The Pomodoro timer is finished. You can stop the music now.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              onClick={() => {
                stopMusic();
                handleCloseMusicDialog();
              }}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Stop Music
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}