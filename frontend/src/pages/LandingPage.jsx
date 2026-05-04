import { useState, useEffect, useRef } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  motion,
  AnimatePresence,
  useInView,
  useMotionValue,
  useSpring,
  animate,
} from "framer-motion";

// ─── design tokens ────────────────────────────────────────────────────────────
const GREEN = "#16a34a";

// ─── helpers ─────────────────────────────────────────────────────────────────
function useCountUp(target, duration, trigger) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!trigger) return;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [trigger, target, duration]);
  return count;
}

// ─── Navbar ──────────────────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        height: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 32px",
        background: scrolled ? "rgba(10,10,10,0.85)" : "transparent",
        backdropFilter: scrolled ? "blur(16px)" : "none",
        borderBottom: scrolled ? "1px solid #1a1a1a" : "1px solid transparent",
        transition: "background 0.4s, backdrop-filter 0.4s, border-color 0.4s",
        fontFamily: "'Space Grotesk', sans-serif",
      }}
    >
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 6,
            background: GREEN,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 16,
          }}
        >
          ⚽
        </div>
        <span
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 22,
            fontWeight: 900,
            letterSpacing: 2,
            color: "#fff",
          }}
        >
          KORA
        </span>
      </div>

      {/* Nav links */}
      <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
        {[
            { label: "Features", href: "#features" },
            { label: "Leaderboard", href: "#leaderboard" },
            { label: "Matches", href: "#matches" },
          ].map(({ label, href }) => (
            <NavLink key={label} label={label} href={href} />
          ))}
      </div>

      {/* Buttons */}
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <Link to="/login">
          <GhostBtn>Sign In</GhostBtn>
        </Link>
        <Link to="/register">
          <GreenBtn small>Get Started</GreenBtn>
        </Link>
      </div>
    </motion.nav>
  );
}

function NavLink({ label, href }) {
  const [hovered, setHovered] = useState(false);
  return (
    <a
      href={href}
      style={{
        color: hovered ? "#fff" : "#999",
        fontSize: 13,
        fontWeight: 500,
        textDecoration: "none",
        transition: "color 0.2s",
        fontFamily: "'Space Grotesk', sans-serif",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {label}
    </a>
  );
}

function GhostBtn({ children, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      style={{
        background: "transparent",
        border: `1px solid ${hovered ? "#555" : "#333"}`,
        borderRadius: 6,
        color: hovered ? "#fff" : "#aaa",
        padding: "7px 16px",
        fontSize: 12,
        fontWeight: 600,
        cursor: "pointer",
        transition: "border-color 0.2s, color 0.2s",
        fontFamily: "'Space Grotesk', sans-serif",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </button>
  );
}

function GreenBtn({ children, onClick, small, large }) {
  const [hovered, setHovered] = useState(false);
  const padding = large ? "16px 40px" : small ? "7px 18px" : "14px 28px";
  const fontSize = large ? 15 : small ? 12 : 14;
  const borderRadius = large ? 10 : small ? 6 : 8;
  return (
    <button
      onClick={onClick}
      style={{
        background: GREEN,
        border: "none",
        borderRadius,
        color: "#fff",
        padding,
        fontSize,
        fontWeight: 700,
        cursor: "pointer",
        transition: "filter 0.2s, transform 0.15s",
        fontFamily: "'Space Grotesk', sans-serif",
        boxShadow: large
          ? "0 6px 30px #16a34a55"
          : "0 4px 24px #16a34a44",
        filter: hovered ? "brightness(1.15)" : "none",
        transform: hovered
          ? large
            ? "scale(1.04)"
            : "translateY(-2px)"
          : "none",
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </button>
  );
}

// ─── Match Card ───────────────────────────────────────────────────────────────
function MatchCard() {
  const [reactions, setReactions] = useState({
    "🔥": 142,
    "⚽": 89,
    "🎮": 34,
    "😮": 21,
    "😢": 8,
  });
  const [lastReaction, setLastReaction] = useState(null);
  const [time, setTime] = useState(67);

  useEffect(() => {
    const t = setInterval(() => setTime((m) => Math.min(m + 1, 90)), 8000);
    return () => clearInterval(t);
  }, []);

  const react = (emoji) => {
    setReactions((r) => ({ ...r, [emoji]: r[emoji] + 1 }));
    setLastReaction(emoji);
    setTimeout(() => setLastReaction(null), 600);
  };

  return (
    <motion.div
      animate={{ y: [0, -14, 0] }}
      transition={{ repeat: Infinity, duration: 3.2, ease: "easeInOut" }}
      style={{
        width: 220,
        background: "#141414",
        border: "1px solid #2a2a2a",
        borderRadius: 14,
        overflow: "hidden",
        boxShadow:
          "0 24px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "#0d1a0d",
          padding: "10px 14px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontSize: 9,
            color: "#4a7a4a",
            fontWeight: 600,
            letterSpacing: 1,
            fontFamily: "'Space Grotesk', sans-serif",
          }}
        >
          PREMIER LEAGUE
        </span>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            background: "#16a34a18",
            border: "1px solid #16a34a44",
            borderRadius: 20,
            padding: "3px 8px",
          }}
        >
          <PulseDot />
          <span
            style={{
              fontSize: 8,
              color: GREEN,
              fontWeight: 800,
              letterSpacing: 1,
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            LIVE
          </span>
        </div>
      </div>

      {/* Score */}
      <div style={{ padding: "18px 14px 12px", textAlign: "center" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
            alignItems: "center",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: 11,
                color: "#666",
                marginBottom: 6,
                fontFamily: "'Space Grotesk', sans-serif",
              }}
            >
              Arsenal
            </div>
            <div
              style={{
                fontSize: 40,
                fontWeight: 900,
                color: "#fff",
                fontFamily: "'Barlow Condensed', sans-serif",
                lineHeight: 1,
              }}
            >
              2
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: 9,
                color: GREEN,
                fontWeight: 700,
                marginBottom: 4,
                fontFamily: "'Space Grotesk', sans-serif",
              }}
            >
              {time}'
            </div>
            <div style={{ fontSize: 14, color: "#333", fontWeight: 700 }}>
              —
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: 11,
                color: "#666",
                marginBottom: 6,
                fontFamily: "'Space Grotesk', sans-serif",
              }}
            >
              Chelsea
            </div>
            <div
              style={{
                fontSize: 40,
                fontWeight: 900,
                color: "#555",
                fontFamily: "'Barlow Condensed', sans-serif",
                lineHeight: 1,
              }}
            >
              1
            </div>
          </div>
        </div>
      </div>

      <div style={{ height: 1, background: "#1e1e1e", margin: "0 14px" }} />

      {/* Reactions */}
      <div
        style={{
          padding: "10px 8px",
          display: "flex",
          justifyContent: "space-around",
        }}
      >
        {Object.entries(reactions).map(([emoji, count]) => (
          <motion.button
            key={emoji}
            onClick={() => react(emoji)}
            animate={
              lastReaction === emoji
                ? { scale: [1, 1.4, 0.9, 1], y: [0, -4, 0, 0] }
                : { scale: 1, y: 0 }
            }
            transition={{ duration: 0.5 }}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
            }}
          >
            <span style={{ fontSize: 16 }}>{emoji}</span>
            <span
              style={{
                fontSize: 8,
                color: "#666",
                fontVariantNumeric: "tabular-nums",
                fontFamily: "'Space Grotesk', sans-serif",
              }}
            >
              {count}
            </span>
          </motion.button>
        ))}
      </div>

      {/* Progress bar */}
      <div
        style={{
          height: 3,
          background: "#111",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            height: "100%",
            width: `${(time / 90) * 100}%`,
            background: GREEN,
            transition: "width 0.5s ease",
          }}
        />
      </div>
    </motion.div>
  );
}

function PulseDot() {
  return (
    <motion.div
      animate={{ opacity: [1, 0.4, 1], scale: [1, 0.8, 1] }}
      transition={{ repeat: Infinity, duration: 1.2 }}
      style={{
        width: 5,
        height: 5,
        borderRadius: "50%",
        background: GREEN,
      }}
    />
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
const WORDS = ["PREDICT", "REACT", "COMPETE", "FOLLOW"];

function Hero() {
  const [wordIdx, setWordIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setWordIdx((i) => (i + 1) % WORDS.length);
    }, 2200);
    return () => clearInterval(t);
  }, []);

  return (
    <section
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        padding: "80px 32px 40px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* BG grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(22,163,74,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(22,163,74,0.03) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          pointerEvents: "none",
        }}
      />
      {/* BG glow */}
      <div
        style={{
          position: "absolute",
          top: "20%",
          left: "30%",
          width: 600,
          height: 600,
          background:
            "radial-gradient(circle, #16a34a0d 0%, transparent 70%)",
          pointerEvents: "none",
          transform: "translate(-50%, -50%)",
        }}
      />

      {/* Left column */}
      <div
        style={{ flex: 1, maxWidth: 620, position: "relative", zIndex: 1 }}
      >
        {/* Live badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            background: "#16a34a12",
            border: "1px solid #16a34a33",
            borderRadius: 20,
            padding: "6px 14px",
            marginBottom: 28,
          }}
        >
          <PulseDot />
          <span
            style={{
              fontSize: 11,
              color: GREEN,
              fontWeight: 600,
              letterSpacing: 1,
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            3,421 FANS WATCHING LIVE
          </span>
        </motion.div>

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          style={{ marginBottom: 8 }}
        >
          <div
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: "clamp(64px, 9vw, 110px)",
              fontWeight: 900,
              lineHeight: 0.95,
              letterSpacing: -2,
              color: "#fff",
              textTransform: "uppercase",
            }}
          >
            <div
              style={{
                position: "relative",
                display: "block",
                height: "1.05em",
                overflow: "hidden",
                marginBottom: 4,
              }}
            >
              <AnimatePresence mode="wait">
                <motion.span
                  key={wordIdx}
                  initial={{ opacity: 0, y: 50, skewY: 3 }}
                  animate={{ opacity: 1, y: 0, skewY: 0 }}
                  exit={{ opacity: 0, y: -40, skewY: -3 }}
                  transition={{
                    enter: {
                      duration: 0.4,
                      ease: [0.22, 1, 0.36, 1],
                    },
                    exit: {
                      duration: 0.35,
                      ease: [0.55, 0, 1, 0.45],
                    },
                  }}
                  style={{
                    display: "block",
                    position: "absolute",
                    left: 0,
                    top: 0,
                    color: GREEN,
                    textShadow: "0 0 60px #16a34a66",
                  }}
                >
                  {WORDS[wordIdx]}
                </motion.span>
              </AnimatePresence>
            </div>
            <div>EVERY MATCH.</div>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          style={{
            fontSize: 16,
            color: "#999",
            lineHeight: 1.7,
            maxWidth: 440,
            marginBottom: 36,
            fontFamily: "'Space Grotesk', sans-serif",
          }}
        >
          Predict scores, react live, and battle your friends on the
          leaderboard. Football is better together.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          style={{
            display: "flex",
            gap: 12,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <Link to="/register">
            <GreenBtn>
              Get Started Free <span style={{ fontSize: 16 }}>→</span>
            </GreenBtn>
          </Link>
          <OutlineBtn>See how it works →</OutlineBtn>
        </motion.div>

        {/* Social proof */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          style={{
            marginTop: 40,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div style={{ display: "flex" }}>
            {["#ff6b6b", "#ffd93d", "#6bcb77", "#4d96ff"].map((c, i) => (
              <div
                key={i}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: c,
                  border: "2px solid #0a0a0a",
                  marginLeft: i > 0 ? -8 : 0,
                }}
              />
            ))}
          </div>
          <span
            style={{
              fontSize: 12,
              color: "#666",
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            Joined by{" "}
            <span style={{ color: "#fff", fontWeight: 600 }}>
              10,000+ fans
            </span>{" "}
            this season
          </span>
        </motion.div>
      </div>

      {/* Right: match card + chips */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        style={{
          flex: "0 0 auto",
          position: "relative",
          zIndex: 1,
          marginLeft: 40,
        }}
      >
        <MatchCard />
        {/* Floating chips */}
        <motion.div
          animate={{ y: [0, -14, 0] }}
          transition={{
            repeat: Infinity,
            duration: 4,
            ease: "easeInOut",
            delay: 1,
          }}
          style={{
            position: "absolute",
            top: -20,
            right: -30,
            background: "#141414",
            border: "1px solid #2a2a2a",
            borderRadius: 20,
            padding: "6px 12px",
            fontSize: 11,
            color: "#999",
            fontFamily: "'Space Grotesk', sans-serif",
          }}
        >
          🏆 #3 Leaderboard
        </motion.div>
        <motion.div
          animate={{ y: [0, -14, 0] }}
          transition={{
            repeat: Infinity,
            duration: 3.5,
            ease: "easeInOut",
            delay: 0.5,
          }}
          style={{
            position: "absolute",
            bottom: 60,
            left: -50,
            background: "#141414",
            border: "1px solid #16a34a33",
            borderRadius: 20,
            padding: "6px 12px",
            fontSize: 11,
            color: GREEN,
            fontFamily: "'Space Grotesk', sans-serif",
          }}
        >
          ⚽ Goal! 85'
        </motion.div>
      </motion.div>
    </section>
  );
}

function OutlineBtn({ children, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      style={{
        background: "transparent",
        border: `1px solid ${hovered ? "#444" : "#2a2a2a"}`,
        borderRadius: 8,
        color: hovered ? "#ccc" : "#888",
        padding: "14px 24px",
        fontSize: 14,
        fontWeight: 600,
        cursor: "pointer",
        transition: "border-color 0.2s, color 0.2s",
        fontFamily: "'Space Grotesk', sans-serif",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </button>
  );
}

// ─── Live Ticker ──────────────────────────────────────────────────────────────
function Ticker() {
  const items = [
    "⚽ Arsenal 2–1 Chelsea  •  67'",
    "🎮 Prediction streak: 8 wins",
    "🏆 Weekly leaderboard resets Sunday",
    "🔥 3,421 fans watching now",
    "⚽ Man City 3–0 Tottenham  •  FT",
    "⚽ Barcelona 1–1 Real Madrid  •  45'",
    "🎯 Exact score bonus: 5 pts",
  ].join("     ");

  return (
    <div
      style={{
        background: "#0d1a0d",
        borderTop: "1px solid #16a34a22",
        borderBottom: "1px solid #16a34a22",
        padding: "10px 0",
        overflow: "hidden",
        whiteSpace: "nowrap",
      }}
    >
      <motion.div
        animate={{ x: ["0%", "-50%"] }}
        transition={{ repeat: Infinity, duration: 28, ease: "linear" }}
        style={{ display: "inline-block" }}
      >
        <span
          style={{
            fontSize: 12,
            color: "#4a8a5a",
            fontWeight: 500,
            marginRight: 80,
            fontFamily: "'Space Grotesk', sans-serif",
          }}
        >
          {items}
        </span>
        <span
          style={{
            fontSize: 12,
            color: "#4a8a5a",
            fontWeight: 500,
            marginRight: 80,
            fontFamily: "'Space Grotesk', sans-serif",
          }}
        >
          {items}
        </span>
      </motion.div>
    </div>
  );
}

// ─── Stats Bar ────────────────────────────────────────────────────────────────
function StatsBar() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.15 });
  const predictions = useCountUp(10000, 2000, inView);
  const matches = useCountUp(500, 1800, inView);

  return (
    <motion.section
      id="matches"
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      viewport={{ once: true, amount: 0.15 }}
      style={{
        padding: "60px 32px",
        background: "#141414",
        borderTop: "1px solid #1e1e1e",
        borderBottom: "1px solid #1e1e1e",
      }}
    >
      <div
        style={{
          maxWidth: 900,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
        }}
      >
        {[
          {
            value: predictions,
            suffix: "+",
            label: "Predictions Made",
            icon: "🎮",
          },
          { value: matches, suffix: "+", label: "Matches Covered", icon: "⚽" },
          {
            display: "Real-time",
            label: "Score Updates",
            icon: "⚡",
          },
        ].map((stat, i) => (
          <div
            key={i}
            style={{
              textAlign: "center",
              padding: "20px 24px",
              borderRight: i < 2 ? "1px solid #1e1e1e" : "none",
            }}
          >
            <div style={{ fontSize: 24, marginBottom: 8 }}>{stat.icon}</div>
            <div
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 52,
                fontWeight: 900,
                lineHeight: 1,
                color: "#fff",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {stat.display ? (
                <span style={{ color: GREEN }}>{stat.display}</span>
              ) : (
                <>
                  {stat.value.toLocaleString()}
                  {stat.suffix}
                </>
              )}
            </div>
            <div
              style={{
                fontSize: 13,
                color: "#666",
                marginTop: 6,
                fontWeight: 500,
                fontFamily: "'Space Grotesk', sans-serif",
              }}
            >
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </motion.section>
  );
}

// ─── Features Grid ────────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: "⚽",
    title: "Live Match Updates",
    desc: "Real-time scores, stats, and timelines for every match. Never miss a goal.",
    accent: "#16a34a",
    tags: ["Every top league", "Push notifications", "Live commentary feed"],
  },
  {
    icon: "🎮",
    title: "Predict & Score",
    desc: "Exact score = 5 pts. Correct outcome = 2 pts. Stack your streak.",
    accent: "#7c3aed",
    tags: ["Pre-match & live", "Streak bonuses", "Weekly challenges"],
  },
  {
    icon: "🏆",
    title: "Leaderboard",
    desc: "Climb the ranks weekly, monthly, and all-time. Your glory awaits.",
    accent: "#eab308",
    tags: ["Weekly resets", "Global & friends", "Badge rewards"],
  },
  {
    icon: "💬",
    title: "Live Reactions",
    desc: "React in real-time with your crew. 🔥 ⚽ 🎮 😮 😢",
    accent: "#dc2626",
    tags: ["Emoji reactions", "Live chat threads", "Hype streaks"],
  },
];

function FeaturesGrid() {
  const [hoveredCard, setHoveredCard] = useState(null);

  const containerVariants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.12 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 36, scale: 0.97 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <section
      id="features"
      style={{
        padding: "100px 32px",
        maxWidth: 1100,
        margin: "0 auto",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        viewport={{ once: true, amount: 0.12 }}
        style={{ textAlign: "center", marginBottom: 60 }}
      >
        <div
          style={{
            fontSize: 11,
            color: GREEN,
            fontWeight: 700,
            letterSpacing: 3,
            marginBottom: 12,
            textTransform: "uppercase",
            fontFamily: "'Space Grotesk', sans-serif",
          }}
        >
          Everything you need
        </div>
        <h2
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: "clamp(36px, 5vw, 60px)",
            fontWeight: 900,
            textTransform: "uppercase",
            letterSpacing: -1,
            lineHeight: 1,
            color: "#fff",
          }}
        >
          BUILT FOR FOOTBALL
          <br />
          <span style={{ color: GREEN }}>FANATICS.</span>
        </h2>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.08 }}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 16,
        }}
      >
        {FEATURES.map((f, i) => {
          const hovered = hoveredCard === i;
          return (
            <motion.div
              key={i}
              variants={cardVariants}
              whileHover={{ y: -6, scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              onHoverStart={() => setHoveredCard(i)}
              onHoverEnd={() => setHoveredCard(null)}
              style={{
                background: hovered ? `${f.accent}10` : "#141414",
                border: `1px solid ${hovered ? f.accent + "55" : "#1e1e1e"}`,
                borderTop: `3px solid ${hovered ? f.accent : "#2a2a2a"}`,
                borderRadius: 12,
                padding: "28px 28px 24px",
                cursor: "pointer",
                transition: "background 0.3s, border-color 0.3s",
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 14 }}>{f.icon}</div>
              <h3
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: "#fff",
                  marginBottom: 8,
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              >
                {f.title}
              </h3>
              <p
                style={{
                  fontSize: 13,
                  color: "#666",
                  lineHeight: 1.6,
                  marginBottom: 18,
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              >
                {f.desc}
              </p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {f.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      background: `${f.accent}18`,
                      border: `1px solid ${f.accent}33`,
                      color: f.accent,
                      borderRadius: 20,
                      padding: "4px 10px",
                      fontFamily: "'Space Grotesk', sans-serif",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}

// ─── How It Works ─────────────────────────────────────────────────────────────
const STEPS = [
  {
    icon: "👤",
    n: "01",
    title: "Create Account",
    desc: "Sign up free in 30 seconds. No credit card needed.",
  },
  {
    icon: "🎮",
    n: "02",
    title: "Make Predictions",
    desc: "Pick scores before kickoff or react live as the game unfolds.",
  },
  {
    icon: "🏆",
    n: "03",
    title: "Climb the Leaderboard",
    desc: "Earn points, build streaks, and dominate your friends.",
  },
];

function HowItWorks() {
  const lineRef = useRef(null);
  const lineInView = useInView(lineRef, { once: true, amount: 0.15 });

  return (
    <section
      id="leaderboard"
      ref={lineRef}
      style={{
        padding: "100px 32px",
        background: "#141414",
        borderTop: "1px solid #1e1e1e",
        borderBottom: "1px solid #1e1e1e",
      }}
    >
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true, amount: 0.15 }}
          style={{ textAlign: "center", marginBottom: 64 }}
        >
          <div
            style={{
              fontSize: 11,
              color: GREEN,
              fontWeight: 700,
              letterSpacing: 3,
              marginBottom: 12,
              textTransform: "uppercase",
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            Simple to start
          </div>
          <h2
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: "clamp(36px, 5vw, 60px)",
              fontWeight: 900,
              textTransform: "uppercase",
              letterSpacing: -1,
              color: "#fff",
            }}
          >
            HOW IT <span style={{ color: GREEN }}>WORKS</span>
          </h2>
        </motion.div>

        <div style={{ display: "flex", position: "relative" }}>
          {/* Connecting line */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={lineInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            style={{
              position: "absolute",
              top: 44,
              left: "16.5%",
              right: "16.5%",
              height: 2,
              background: `linear-gradient(90deg, ${GREEN}, #16a34a88, ${GREEN})`,
            }}
          />

          {STEPS.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: 0.2 + i * 0.15,
                ease: [0.22, 1, 0.36, 1],
              }}
              viewport={{ once: true, amount: 0.15 }}
              style={{
                flex: 1,
                textAlign: "center",
                padding: "0 32px",
              }}
            >
              <StepIcon active={i === 0}>{s.icon}</StepIcon>
              <div
                style={{
                  fontSize: 11,
                  color: GREEN,
                  fontWeight: 700,
                  letterSpacing: 2,
                  marginBottom: 6,
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              >
                {s.n}
              </div>
              <h3
                style={{
                  fontSize: 17,
                  fontWeight: 700,
                  color: "#fff",
                  marginBottom: 8,
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              >
                {s.title}
              </h3>
              <p
                style={{
                  fontSize: 13,
                  color: "#666",
                  lineHeight: 1.6,
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              >
                {s.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StepIcon({ children, active }) {
  const [hovered, setHovered] = useState(false);
  const isActive = active || hovered;
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: 64,
        height: 64,
        borderRadius: 16,
        background: isActive ? GREEN : "#1a1a1a",
        border: `2px solid ${isActive ? GREEN : "#2a2a2a"}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 28,
        margin: "0 auto 20px",
        boxShadow: isActive ? "0 4px 24px #16a34a44" : "none",
        transition: "background 0.3s, border-color 0.3s, box-shadow 0.3s",
        cursor: "pointer",
        position: "relative",
        zIndex: 1,
      }}
    >
      {children}
    </div>
  );
}

// ─── CTA Section ──────────────────────────────────────────────────────────────
function CTASection() {
  return (
    <section style={{ padding: "100px 32px" }}>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        viewport={{ once: true, amount: 0.12 }}
        animate={{
          boxShadow: [
            "0 0 40px #16a34a22, 0 0 80px #16a34a11",
            "0 0 60px #16a34a44, 0 0 120px #16a34a22",
            "0 0 40px #16a34a22, 0 0 80px #16a34a11",
          ],
        }}
        transition2={{
          boxShadow: {
            repeat: Infinity,
            duration: 3,
            ease: "easeInOut",
          },
        }}
        style={{
          maxWidth: 800,
          margin: "0 auto",
          background:
            "linear-gradient(135deg, #0d1f0d 0%, #0a0a0a 60%, #110d1a 100%)",
          border: "1px solid #16a34a33",
          borderRadius: 20,
          padding: "70px 60px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* BG radial */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: 500,
            height: 500,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, #16a34a0a, transparent 70%)",
            transform: "translate(-50%, -50%)",
            pointerEvents: "none",
          }}
        />
        <GlowPulse />

        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>⚽</div>
          <div
            style={{
              fontSize: 11,
              color: GREEN,
              fontWeight: 700,
              letterSpacing: 3,
              marginBottom: 16,
              textTransform: "uppercase",
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            Join 10,000+ fans
          </div>
          <h2
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: "clamp(40px, 6vw, 72px)",
              fontWeight: 900,
              textTransform: "uppercase",
              letterSpacing: -1,
              lineHeight: 1,
              marginBottom: 16,
              color: "#fff",
            }}
          >
            YOUR FOOTBALL
            <br />
            <span style={{ color: GREEN }}>COMMUNITY AWAITS</span>
          </h2>
          <p
            style={{
              fontSize: 15,
              color: "#999",
              marginBottom: 36,
              lineHeight: 1.7,
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            Predict. React. Compete. It's free forever.
          </p>
          <Link to="/register">
            <GreenBtn large>Get Started Free 🚀</GreenBtn>
          </Link>
        </div>
      </motion.div>
    </section>
  );
}

function GlowPulse() {
  return (
    <motion.div
      animate={{
        boxShadow: [
          "inset 0 0 40px #16a34a22, 0 0 80px #16a34a11",
          "inset 0 0 60px #16a34a44, 0 0 120px #16a34a22",
          "inset 0 0 40px #16a34a22, 0 0 80px #16a34a11",
        ],
      }}
      transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
      style={{
        position: "absolute",
        inset: 0,
        borderRadius: 20,
        pointerEvents: "none",
      }}
    />
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer
      style={{
        padding: "30px 32px",
        borderTop: "1px solid #1e1e1e",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div
          style={{
            width: 22,
            height: 22,
            borderRadius: 5,
            background: GREEN,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
          }}
        >
          ⚽
        </div>
        <span
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 18,
            fontWeight: 900,
            letterSpacing: 2,
            color: "#444",
          }}
        >
          KORA
        </span>
      </div>
      <span
        style={{
          fontSize: 11,
          color: "#333",
          fontFamily: "'Space Grotesk', sans-serif",
        }}
      >
        © 2026 Kora. Your live football social hub.
      </span>
    </footer>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (user) return <Navigate to="/feed" replace />;

  return (
    <div
      style={{
        background: "#0a0a0a",
        color: "#fff",
        minHeight: "100vh",
        overflowX: "hidden",
      }}
    >
      <Navbar />
      <Hero />
      <Ticker />
      <StatsBar />
      <FeaturesGrid />
      <HowItWorks />
      <CTASection />
      <Footer />
    </div>
  );
}
