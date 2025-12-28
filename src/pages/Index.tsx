import React, { useState, useEffect, useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, Float, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  Home,
  Activity,
  Dumbbell,
  User,
  ChevronRight,
  ChevronLeft,
  Flame,
  Timer,
  Zap,
  Sparkles,
  ArrowLeft,
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";

// --- CONFIGURATION ---
// 1. Get these from your Lovable "Project Settings" or Supabase Dashboard
const SUPABASE_URL = "YOUR_SUPABASE_PROJECT_URL";
const SUPABASE_KEY = "YOUR_SUPABASE_ANON_KEY";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// --- THEME ---
const THEME = {
  bg: "#0f0f11",
  card: "#1c1c1e",
  primary: "#D3F36B", // Neon Lime
  text: "#ffffff",
  textDim: "#8E8E93",
};

// --- TYPES (Updated to match your CSV structure) ---
interface Exercise {
  id: number;
  Exersice_Name: string; // Matches your DB column
  equipment: string;
  difficulty: string;
  body_part: string; // Matches your DB column
  space_requirement: string;
}

interface WorkoutSession {
  title: string;
  duration: number;
  exercises: Exercise[];
}

// --- 3D AVATAR COMPONENT ---
// Visualizes the workout based on the name
const RobotAvatar = ({ action }: { action: string }) => {
  const group = useRef<THREE.Group>(null);
  const limbs = useRef<any>({ armL: null, armR: null, legL: null, legR: null });

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.getElapsedTime();
    const speed = 4;

    // Default Idle
    group.current.position.y = Math.sin(t) * 0.05;

    // --- ANIMATION LOGIC ---
    if (action.includes("squat") || action.includes("leg") || action.includes("lunge")) {
      const cycle = Math.sin(t * speed);
      group.current.position.y = cycle * 0.5 - 0.5;
      if (limbs.current.legL) limbs.current.legL.rotation.x = cycle * 0.8;
      if (limbs.current.legR) limbs.current.legR.rotation.x = cycle * 0.8;
      if (limbs.current.armL) limbs.current.armL.rotation.x = -1.5 + cycle * 0.3;
      if (limbs.current.armR) limbs.current.armR.rotation.x = -1.5 + cycle * 0.3;
    } else if (action.includes("press") || action.includes("chest") || action.includes("push")) {
      const cycle = Math.sin(t * speed);
      if (limbs.current.armL) limbs.current.armL.position.y = 1.5 + cycle * 0.3;
      if (limbs.current.armR) limbs.current.armR.position.y = 1.5 + cycle * 0.3;
    } else if (action.includes("curl") || action.includes("bicep")) {
      const cycle = Math.sin(t * speed);
      if (limbs.current.armL) limbs.current.armL.rotation.x = -Math.abs(cycle * 2);
      if (limbs.current.armR) limbs.current.armR.rotation.x = -Math.abs(Math.sin(t * speed + 1) * 2);
    } else if (action.includes("run") || action.includes("cardio") || action.includes("walk")) {
      const cycle = Math.sin(t * speed * 2);
      group.current.position.y = Math.abs(cycle) * 0.1;
      if (limbs.current.armL) limbs.current.armL.rotation.x = cycle;
      if (limbs.current.armR) limbs.current.armR.rotation.x = -cycle;
      if (limbs.current.legL) limbs.current.legL.rotation.x = -cycle;
      if (limbs.current.legR) limbs.current.legR.rotation.x = cycle;
    }
  });

  const materialBody = new THREE.MeshStandardMaterial({ color: "#222", roughness: 0.3, metalness: 0.8 });
  const materialNeon = new THREE.MeshStandardMaterial({
    color: THEME.primary,
    emissive: THEME.primary,
    emissiveIntensity: 0.6,
  });

  return (
    <group ref={group}>
      <mesh position={[0, 2.2, 0]} material={materialNeon}>
        <sphereGeometry args={[0.25, 32, 32]} />
      </mesh>
      <mesh position={[0, 1.2, 0]} material={materialBody}>
        <capsuleGeometry args={[0.35, 1, 4, 8]} />
      </mesh>
      <mesh ref={(el) => (limbs.current.armL = el)} position={[-0.55, 1.5, 0]} material={materialBody}>
        <capsuleGeometry args={[0.12, 1.2]} />
      </mesh>
      <mesh ref={(el) => (limbs.current.armR = el)} position={[0.55, 1.5, 0]} material={materialBody}>
        <capsuleGeometry args={[0.12, 1.2]} />
      </mesh>
      <mesh ref={(el) => (limbs.current.legL = el)} position={[-0.25, 0.5, 0]} material={materialBody}>
        <capsuleGeometry args={[0.15, 1.4]} />
      </mesh>
      <mesh ref={(el) => (limbs.current.legR = el)} position={[0.25, 0.5, 0]} material={materialBody}>
        <capsuleGeometry args={[0.15, 1.4]} />
      </mesh>
    </group>
  );
};

const WorkoutVisualizer = ({ exerciseName }: { exerciseName: string }) => {
  const animationTag = useMemo(() => {
    const lower = exerciseName.toLowerCase();
    if (lower.includes("squat") || lower.includes("leg") || lower.includes("lunge")) return "squat";
    if (lower.includes("press") || lower.includes("push") || lower.includes("chest")) return "press";
    if (lower.includes("curl") || lower.includes("row") || lower.includes("pull")) return "curl";
    if (lower.includes("run") || lower.includes("jump") || lower.includes("cardio")) return "run";
    return "idle";
  }, [exerciseName]);

  return (
    <div className="absolute inset-0 z-0">
      <Canvas shadows camera={{ position: [0, 2, 5], fov: 45 }}>
        <Environment preset="city" />
        <ambientLight intensity={0.4} />
        <spotLight position={[5, 10, 5]} angle={0.15} penumbra={1} intensity={1} castShadow />
        <Float speed={2} rotationIntensity={0.1} floatIntensity={0.2}>
          <RobotAvatar action={animationTag} />
        </Float>
        <ContactShadows position={[0, -0.5, 0]} opacity={0.6} scale={10} blur={2} color={THEME.primary} />
      </Canvas>
    </div>
  );
};

// --- SCREENS ---

// 1. DASHBOARD
const Dashboard = ({ onNavigate }: { onNavigate: (view: string) => void }) => {
  return (
    <div className="p-6 space-y-8 pb-32">
      <div className="flex justify-between items-center pt-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gray-700 overflow-hidden border-2 border-[#D3F36B]">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" />
          </div>
          <div>
            <h1 className="font-bold text-lg">HI JAMES</h1>
            <div className="flex items-center gap-1 text-[#D3F36B] text-xs font-bold">
              <Zap size={12} fill="currentColor" /> FITNESS FREAK
            </div>
          </div>
        </div>
      </div>

      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onNavigate("generator")}
        className="relative h-48 rounded-[2rem] bg-[#D3F36B] text-black p-6 flex flex-col justify-center overflow-hidden cursor-pointer"
      >
        <div className="absolute right-[-20px] bottom-[-20px] opacity-20 rotate-12">
          <Activity size={180} />
        </div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-black/10 px-3 py-1 rounded-full text-xs font-bold mb-3">
            <Flame size={12} fill="black" /> DAILY GOAL
          </div>
          <h2 className="text-3xl font-black leading-none mb-4">
            LOWER BODY
            <br />
            POWER
          </h2>
          <div className="flex gap-4 text-xs font-bold opacity-80">
            <span className="flex items-center gap-1">
              <Timer size={12} /> 45 MIN
            </span>
            <span className="flex items-center gap-1">
              <Zap size={12} /> 530 KCAL
            </span>
          </div>
          <button className="mt-4 bg-black text-white px-6 py-2 rounded-full w-fit text-sm font-bold">
            Start Workout
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#1c1c1e] p-4 rounded-3xl flex flex-col items-center justify-center gap-2 border border-white/5">
          <Activity className="text-[#D3F36B]" />
          <div className="text-xl font-bold">1,840</div>
          <div className="text-xs text-[#8E8E93]">STEPS</div>
        </div>
        <div className="bg-[#1c1c1e] p-4 rounded-3xl flex flex-col items-center justify-center gap-2 border border-white/5">
          <Flame className="text-orange-500" />
          <div className="text-xl font-bold">870</div>
          <div className="text-xs text-[#8E8E93]">KCAL</div>
        </div>
      </div>
    </div>
  );
};

// 2. GENERATOR (Connected to Real Data)
const Generator = ({ onNavigate, onGenerate }: any) => {
  const [focus, setFocus] = useState("Full Body");
  const [space, setSpace] = useState("Small");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);

    try {
      // 1. Build Query
      let query = supabase.from("exercises").select("*");

      // 2. Apply Filters
      if (space === "Small") {
        query = query.eq("space_requirement", "Small");
      } else if (space === "Medium") {
        query = query.in("space_requirement", ["Small", "Medium"]);
      }
      // Large includes everything

      if (focus !== "Full Body" && focus !== "Cardio") {
        // Map UI selection to DB Body Part
        const dbPart = focus === "Upper Body" ? "Chest" : "Glutes"; // Simplified mapping
        query = query.eq("body_part", dbPart);
      }

      // 3. Fetch Data
      const { data, error } = await query.limit(5);

      if (error) throw error;

      // 4. Create Session
      if (data && data.length > 0) {
        onGenerate({
          title: `${focus} Blast`,
          duration: 30,
          exercises: data as Exercise[],
        });
      } else {
        alert("No exercises found for these criteria!");
        setLoading(false);
      }
    } catch (e) {
      console.error(e);
      alert("Error generating workout");
      setLoading(false);
    }
  };

  return (
    <div className="h-full p-6 pt-12 flex flex-col">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => onNavigate("dashboard")} className="p-2 bg-[#1c1c1e] rounded-full">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold">Custom Session</h1>
      </div>

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-[#D3F36B] border-t-transparent rounded-full"
          />
          <p className="text-[#D3F36B] font-mono animate-pulse">ANALYZING DATABASE...</p>
        </div>
      ) : (
        <div className="flex-1 space-y-8">
          {/* Focus Area */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-[#D3F36B] uppercase">Focus Area</label>
            <div className="grid grid-cols-2 gap-3">
              {["Upper Body", "Lower Body", "Full Body", "Cardio"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFocus(f)}
                  className={`p-4 rounded-2xl text-left font-bold transition-all ${focus === f ? "bg-[#D3F36B] text-black" : "bg-[#1c1c1e]"}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Space Requirement - New Feature */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-[#D3F36B] uppercase">Space Available</label>
            <div className="flex bg-[#1c1c1e] p-1 rounded-2xl">
              {["Small", "Medium", "Large"].map((s) => (
                <button
                  key={s}
                  onClick={() => setSpace(s)}
                  className={`flex-1 py-3 rounded-xl font-bold transition-all ${space === s ? "bg-[#2c2c2e] text-white shadow-lg" : "text-[#8E8E93]"}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            className="w-full bg-[#D3F36B] text-black font-bold py-4 rounded-full flex items-center justify-center gap-2 mt-auto"
          >
            <Sparkles size={18} /> GENERATE WORKOUT
          </button>
        </div>
      )}
    </div>
  );
};

// 3. PLAYER
const WorkoutPlayer = ({ session, onExit }: { session: WorkoutSession; onExit: () => void }) => {
  const [activeIdx, setActiveIdx] = useState(0);
  const exercise = session.exercises[activeIdx];

  return (
    <div className="h-full relative bg-black flex flex-col">
      <WorkoutVisualizer exerciseName={exercise.Exersice_Name} />
      <div className="relative z-10 flex-1 flex flex-col justify-between p-6 bg-gradient-to-b from-black/60 via-transparent to-black/90">
        <div className="flex justify-between items-start pt-8">
          <div>
            <h2 className="text-2xl font-bold text-white">{exercise.Exersice_Name}</h2>
            <p className="text-[#D3F36B] font-mono text-sm uppercase">
              {exercise.equipment} • {exercise.difficulty}
            </p>
          </div>
          <button onClick={onExit} className="p-3 bg-white/10 backdrop-blur-md rounded-full text-white">
            <Pause size={20} />
          </button>
        </div>

        <div className="bg-[#1c1c1e]/80 backdrop-blur-xl rounded-[3rem] p-2 flex items-center justify-between shadow-2xl border border-white/10 mb-8">
          <button
            className="w-16 h-16 rounded-full flex items-center justify-center hover:bg-white/10"
            onClick={() => setActiveIdx(Math.max(0, activeIdx - 1))}
          >
            <ChevronLeft size={24} />
          </button>
          <div className="text-xl font-mono font-bold">
            {activeIdx + 1} / {session.exercises.length}
          </div>
          <button
            className="w-16 h-16 rounded-full flex items-center justify-center hover:bg-white/10"
            onClick={() => setActiveIdx(Math.min(session.exercises.length - 1, activeIdx + 1))}
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};

// --- APP ROOT ---
export default function App() {
  const [view, setView] = useState("dashboard");
  const [currentSession, setCurrentSession] = useState<WorkoutSession | null>(null);

  return (
    <div className="w-full h-screen bg-[#0f0f11] text-white font-sans overflow-hidden relative selection:bg-[#D3F36B] selection:text-black">
      <AnimatePresence mode="wait">
        {view === "dashboard" && (
          <motion.div
            key="dash"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-full relative"
          >
            <Dashboard onNavigate={setView} />
          </motion.div>
        )}

        {view === "generator" && (
          <motion.div
            key="gen"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="h-full"
          >
            <Generator
              onNavigate={setView}
              onGenerate={(s: WorkoutSession) => {
                setCurrentSession(s);
                setView("workout");
              }}
            />
          </motion.div>
        )}

        {view === "workout" && currentSession && (
          <motion.div
            key="play"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="h-full"
          >
            <WorkoutPlayer session={currentSession} onExit={() => setView("dashboard")} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
