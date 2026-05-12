"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import {
  BookOpen,
  Users,
  Dices,
  GraduationCap,
  Shield,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
  useInView,
  Variants,
} from "framer-motion";

// --- Typescript-Safe Variants ---
const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" },
  },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 },
  },
};

// --- Counter Component (Handles Decimals & Percentage) ---
function Counter({ value, label }: { value: string; label: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const numericValue = parseFloat(value.replace(/[^0-9.]/g, ""));
  const suffix = value.replace(/[0-9.]/g, "");
  const isDecimal = value.includes(".");

  const count = useMotionValue(0);

  // FIXED: Both branches now return a string
  const rounded = useTransform(count, (latest) =>
    isDecimal ? latest.toFixed(1) : Math.round(latest).toString(),
  );

  useEffect(() => {
    if (isInView) {
      const controls = animate(count, numericValue, {
        duration: 2,
        ease: "circOut",
      });
      return controls.stop;
    }
  }, [isInView, numericValue, count]);

  return (
    <div ref={ref} className="flex flex-col items-center">
      <div className="text-3xl sm:text-4xl font-bold text-[#003366] tabular-nums">
        <motion.span>{rounded}</motion.span>
        <span>{suffix}</span>
      </div>
      <div className="text-slate-500 text-sm mt-1 font-medium">{label}</div>
    </div>
  );
}

export default function LandingPage() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const routes: Record<string, string> = {
        admin: "/admin",
        main_admin: "/admin",
        lecturer: "/lecturer",
        student: "/student",
      };
      if (routes[user.role]) router.push(routes[user.role]);
    }
  }, [user, router]);

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-[#003366] rounded-full flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <span className="ml-3 text-xl font-bold text-[#002244]">
              Bells CAS
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              asChild
              className="hidden sm:flex border-slate-200"
            >
              <Link href="/auth/admin">
                <Shield className="h-4 w-4 mr-2" /> Admin
              </Link>
            </Button>
            <Button asChild className="bg-[#003366] text-white">
              <Link href="/auth/lecturer">
                <Users className="h-4 w-4 mr-2" /> Login
              </Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* 1) Hero Section */}
      <section className="relative min-h-screen bg-gradient-to-br from-bells-dark-blue via-bells-blue to-bells-light-blue pt-16 flex items-center">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 text-white text-sm mb-12 border border-white/20"
            >
              <Award className="h-4 w-4 mr-2 text-[#FFD700]" />
              Bells University of Technology
            </motion.div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-tight tracking-tight overflow-hidden">
              <motion.span
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="block"
              >
                Automated Course
              </motion.span>
              <motion.span
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.6 }}
                className="block text-[#FFD700] mt-2"
              >
                Allocation System
              </motion.span>
            </h1>

            <motion.p
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="text-lg sm:text-xl text-white/80 mb-10 max-w-2xl mx-auto"
            >
              Streamline your academic course allocation process with our
              intelligent system designed for optimal lecturer-course matching.
            </motion.p>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="flex flex-col sm:flex-row justify-center gap-4"
            >
              {["Lecturer", "Admin", "Student"].map((role, idx) => (
                <motion.div key={role} variants={sectionVariants}>
                  <Button
                    size="lg"
                    variant={idx === 0 ? "default" : "outline"}
                    asChild
                    className={`h-14 px-8 text-lg font-semibold w-full sm:w-auto ${
                      idx === 0
                        ? "bg-white text-[#003366] hover:bg-slate-100"
                        : "text-bells-gold border-white/30 hover:bg-white/80"
                    }`}
                  >
                    <Link href={`/auth/${role.toLowerCase()}`}>
                      {role === "Admin" ? (
                        <Shield className="h-5 w-5 mr-2" />
                      ) : (
                        <Users className="h-5 w-5 mr-2" />
                      )}
                      {role} Login
                    </Link>
                  </Button>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2) Stats Section (Counter) */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.5 }}
        variants={sectionVariants}
        className="relative -mt-10 z-10 max-w-5xl mx-auto px-4"
      >
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 md:p-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <Counter value="94%" label="Accuracy" />
            <Counter value="2.7s" label="Speed" />
            <Counter value="92%" label="Satisfaction" />
            <Counter value="90%" label="Efficiency" />
          </div>
        </div>
      </motion.div>

      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={sectionVariants}
        className="bg-[#FDFBF7] py-24 pt-32"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#002244] mb-4">
              Key Features
            </h2>
            <div className="h-1 w-20 bg-[#FFD700] mx-auto rounded-full"></div>
          </div>

          <motion.div
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {[
              {
                title: "Course Management",
                icon: <BookOpen />,
                color: "bg-blue-50",
                text: "text-[#003366]",
              },
              {
                title: "Lecturer Preferences",
                icon: <Users />,
                color: "bg-emerald-50",
                text: "text-emerald-600",
              },
              {
                title: "Smart Allocation",
                icon: <Dices />,
                color: "bg-purple-50",
                text: "text-purple-600",
              },
            ].map((feature) => (
              <motion.div key={feature.title} variants={sectionVariants}>
                <FeatureCard
                  icon={feature.icon}
                  title={feature.title}
                  description="Optimized algorithms ensuring the best match for faculty and curriculum needs."
                  color={feature.color}
                  iconColor={feature.text}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="bg-[#001122] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-[#FFD700]/90 font-medium mb-8 italic">
            "Only the Best is Good for Bells, But the Best is Yet to Come..."
          </p>
          <div className="flex flex-col items-center border-t border-white/10 pt-8">
            <div className="flex items-center mb-4">
              <GraduationCap className="h-8 w-8 text-blue-400 mr-2" />
              <span className="text-lg font-bold">
                Bells University of Technology
              </span>
            </div>
            <p className="text-slate-500 text-sm">
              &copy; {new Date().getFullYear()} Course Allocation System. All
              rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description, color, iconColor }: any) {
  return (
    <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-100 hover:shadow-md transition-shadow h-full">
      <div
        className={`w-14 h-14 ${color} rounded-lg flex items-center justify-center mb-6`}
      >
        {typeof icon === "object" ? (
          <div className={iconColor}>{icon}</div>
        ) : (
          icon
        )}
      </div>
      <h3 className="text-xl font-bold text-[#002244] mb-3">{title}</h3>
      <p className="text-slate-600 leading-relaxed text-sm">{description}</p>
    </div>
  );
}
