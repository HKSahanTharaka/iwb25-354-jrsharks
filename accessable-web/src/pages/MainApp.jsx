import { useState, useEffect, useRef } from "react";
import {
  Heart,
  MapPin,
  Search,
  Users,
  Star,
  ArrowRight,
  Accessibility,
  Shield,
  Award,
  ChevronDown,
} from "lucide-react";
import MapView from "../components/MapView";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import { useMemo } from "react";

// Custom hook for scroll-triggered animations
const useScrollAnimation = () => {
  const [ref, setRef] = useState(null);
  const [inView, setInView] = useState(false);
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!ref) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -100px 0px" }
    );

    observer.observe(ref);
    return () => observer.disconnect();
  }, [ref]);

  return [setRef, inView];
};

// Animated counter component
const AnimatedCounter = ({ end, suffix = "", duration = 2000 }) => {
  const [count, setCount] = useState(0);
  const [ref, inView] = useScrollAnimation();

  useEffect(() => {
    if (!inView) return;

    let startTime;
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);

      setCount(Math.floor(progress * end));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [inView, end, duration]);

  return (
    <div ref={ref} className="text-4xl md:text-5xl font-bold mb-2">
      {count.toLocaleString()}
      {suffix}
    </div>
  );
};

// Scroll-triggered motion wrapper
const MotionWrapper = ({
  children,
  delay = 0,
  direction = "up",
  className = "",
}) => {
  const [ref, inView] = useScrollAnimation();

  const getTransform = () => {
    if (inView) return "none";

    switch (direction) {
      case "up":
        return "translateY(60px)";
      case "down":
        return "translateY(-60px)";
      case "left":
        return "translateX(-60px)";
      case "right":
        return "translateX(60px)";
      case "scale":
        return "scale(0.8)";
      default:
        return "translateY(60px)";
    }
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{
        transform: getTransform(),
        opacity: inView ? 1 : 0,
        transition: `all 0.8s cubic-bezier(0.6, -0.05, 0.01, 0.99) ${delay}s`,
      }}
    >
      {children}
    </div>
  );
};

export default function ModernMainApp() {
  const [isVisible, setIsVisible] = useState(false);
  const mapRef = useRef(null);
  const { user, loading } = useAuth();
  const isUnapproved = !!user && user.isApproved === false;
  const navigate = useNavigate();
  const [stats, setStats] = useState({ placesCount: 0, reviewsCount: 0, activeUsersCount: 0 });
  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/locations/stats');
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) {
          setStats({
            placesCount: Number(data.placesCount) || 0,
            reviewsCount: Number(data.reviewsCount) || 0,
            activeUsersCount: Number(data.activeUsersCount) || 0,
          });
        }
      } catch (_) {
        // silently ignore to keep homepage resilient
      }
    };
    fetchStats();
    return () => { cancelled = true; };
  }, []);

  const handleExploreClick = () => {
    if (mapRef.current) {
      mapRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        {/* Hero Section */}
        <section className="relative overflow-hidden min-h-screen flex items-center">
          {/* Background */}
          <div className="absolute inset-0">
            <div 
              className="absolute inset-0"
              style={{
                background: "linear-gradient(45deg, #3b82f6, #d946ef, #8b5cf6, #3b82f6)",
                backgroundSize: "400% 400%",
                animation: "vividGradient 10s ease-in-out infinite",
                transform: "scale(1.02)",
              }}
            ></div>
            <style>
              {`
                @keyframes vividGradient {
                  0% { background-position: 0% 50%; transform: scale(1.02); }
                  25% { background-position: 100% 50%; transform: scale(1.05); }
                  50% { background-position: 100% 100%; transform: scale(1.02); }
                  75% { background-position: 0% 100%; transform: scale(1.05); }
                  100% { background-position: 0% 50%; transform: scale(1.02); }
                }
                @keyframes floatIcon {
                  0% { transform: translateY(0) scale(1); opacity: 0.3; }
                  50% { transform: translateY(-20px) scale(1.1); opacity: 0.5; }
                  100% { transform: translateY(0) scale(1); opacity: 0.3; }
                }
                .icon-container {
                  position: absolute;
                  pointer-events: none;
                }
                .icon-container:nth-child(1) { top: 10%; left: 5%; animation-delay: 0s; }
                .icon-container:nth-child(2) { top: 20%; right: 10%; animation-delay: 1s; }
                .icon-container:nth-child(3) { bottom: 15%; left: 15%; animation-delay: 2s; }
                .icon-container:nth-child(4) { bottom: 25%; right: 20%; animation-delay: 3s; }
                .icon-container:nth-child(5) { top: 30%; left: 25%; animation-delay: 4s; }
                .icon-container:nth-child(6) { bottom: 10%; right: 30%; animation-delay: 5s; }
              `}
            </style>
            <div className="absolute inset-0 bg-black/20"></div>
            {/* Animated Icons */}
            <div className="absolute inset-0">
              <div className="icon-container" style={{ animation: "floatIcon 6s ease-in-out infinite" }}>
                <Accessibility className="w-12 h-12 text-white/30" />
              </div>
              <div className="icon-container" style={{ animation: "floatIcon 6s ease-in-out infinite" }}>
                <MapPin className="w-12 h-12 text-white/30" />
              </div>
              <div className="icon-container" style={{ animation: "floatIcon 6s ease-in-out infinite" }}>
                <Accessibility className="w-12 h-12 text-white/30" />
              </div>
              <div className="icon-container" style={{ animation: "floatIcon 6s ease-in-out infinite" }}>
                <MapPin className="w-12 h-12 text-white/30" />
              </div>
              <div className="icon-container" style={{ animation: "floatIcon 6s ease-in-out infinite" }}>
                <Accessibility className="w-12 h-12 text-white/30" />
              </div>
              <div className="icon-container" style={{ animation: "floatIcon 6s ease-in-out infinite" }}>
                <MapPin className="w-12 h-12 text-white/30" />
              </div>
            </div>
          </div>

          {/* Hero Content */}
          <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
            <div
              className={`transition-all duration-1000 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
            >
              {/* Logo */}
              <div className="mb-8">
                <div
                  className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/30 shadow-2xl hover:scale-110 hover:rotate-6 transition-all duration-500 cursor-pointer"
                  style={{
                    transform: isVisible ? "none" : "scale(0.5) rotate(-180deg)",
                    transition:
                      "all 1.2s cubic-bezier(0.68, -0.55, 0.265, 1.55) 0.2s",
                  }}
                >
                  <Accessibility className="w-10 h-10 text-white" />
                </div>
              </div>

              {/* Title */}
              <h1
                className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight"
                style={{
                  transform: isVisible ? "none" : "translateY(50px)",
                  opacity: isVisible ? 1 : 0,
                  transition: "all 1s cubic-bezier(0.6, -0.05, 0.01, 0.99) 0.4s",
                }}
              >
                Welcome to
                <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent hover:from-yellow-400 hover:to-orange-400 transition-all duration-500">
                  AccessAble Sri Lanka
                </span>
              </h1>

              {/* Subtitle */}
              <p
                className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed"
                style={{
                  transform: isVisible ? "none" : "translateY(40px)",
                  opacity: isVisible ? 1 : 0,
                  transition: "all 1s cubic-bezier(0.6, -0.05, 0.01, 0.99) 0.6s",
                }}
              >
                Discover and share comfortable, accessible places across Sri Lanka
                <span className="block mt-2 font-medium text-lg">
                  Empowering independence, one location at a time
                </span>
              </p>

              {/* CTA */}
              <div
                className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
                style={{
                  transform: isVisible ? "none" : "translateY(40px)",
                  opacity: isVisible ? 1 : 0,
                  transition: "all 1s cubic-bezier(0.6, -0.05, 0.01, 0.99) 0.8s",
                }}
              >
                <button
                  onClick={handleExploreClick}
                  className="group px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold text-lg shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3"
                >
                  <Search className="w-5 h-5" />
                  Explore Places
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => navigate("/add-place")}
                  className="px-8 py-4 bg-white/20 backdrop-blur-sm text-white border border-white/30 rounded-xl font-semibold text-lg hover:bg-white/30 transition-all duration-300 flex items-center justify-center gap-3"
                >
                  <Heart className="w-5 h-5" />
                  Add a Place
                </button>
              </div>

              {/* Scroll Indicator */}
              <div
                className="animate-bounce"
                style={{
                  opacity: isVisible ? 1 : 0,
                  transition: "opacity 1s ease-in-out 1.2s",
                }}
              >
                <ChevronDown className="w-6 h-6 text-white/70 mx-auto hover:text-white transition-colors duration-300" />
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <MotionWrapper className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
                Why Choose AccessAble?
              </h2>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                Built by the community, for the community. Every feature designed
                with accessibility in mind.
              </p>
            </MotionWrapper>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: Accessibility,
                  title: "Wheelchair Accessible",
                  color: "blue",
                },
                { icon: Shield, title: "Verified Safe", color: "green" },
                { icon: Users, title: "Community Driven", color: "purple" },
                { icon: Award, title: "Quality Assured", color: "orange" },
              ].map((feature, index) => (
                <MotionWrapper key={index} delay={index * 0.1} direction="scale">
                  <div className="group text-center p-8 rounded-2xl bg-gradient-to-br from-slate-50 to-white border border-slate-200 hover:border-slate-300 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                    <div
                      className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-${feature.color}-100 flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300`}
                    >
                      <feature.icon
                        className={`w-8 h-8 text-${feature.color}-600`}
                      />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-800 mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-slate-600">
                      Every location is carefully reviewed and verified by our
                      community.
                    </p>
                  </div>
                </MotionWrapper>
              ))}
            </div>
          </div>
        </section>

        {/* Map Section */}
        <section ref={mapRef} className="py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <MotionWrapper className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
                Explore Accessible Places
              </h2>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                Find wheelchair-accessible restaurants, shops, and venues near you
              </p>
            </MotionWrapper>

            <MotionWrapper delay={0.2}>
              <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                <MapView />
              </div>
            </MotionWrapper>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <MotionWrapper className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Our Impact
              </h2>
              <p className="text-xl text-white/90 max-w-2xl mx-auto">
                Join thousands of users making Sri Lanka more accessible
              </p>
            </MotionWrapper>

            <div className="grid md:grid-cols-3 gap-8">
              <MotionWrapper delay={0.1} direction="up">
                <div className="text-center text-white">
                  <AnimatedCounter end={stats.placesCount} suffix="+" />
                  <p className="text-xl font-semibold">Accessible Places</p>
                  <p className="text-white/70">Verified locations</p>
                </div>
              </MotionWrapper>
              <MotionWrapper delay={0.2} direction="up">
                <div className="text-center text-white">
                  <AnimatedCounter end={stats.reviewsCount} suffix="+" />
                  <p className="text-xl font-semibold">Community Reviews</p>
                  <p className="text-white/70">Detailed feedback</p>
                </div>
              </MotionWrapper>
              <MotionWrapper delay={0.3} direction="up">
                <div className="text-center text-white">
                  <AnimatedCounter end={stats.activeUsersCount} suffix="+" />
                  <p className="text-xl font-semibold">Active Users</p>
                  <p className="text-white/70">Growing community</p>
                </div>
              </MotionWrapper>
            </div>
          </div>
        </section>

        {/* Community */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <MotionWrapper className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
                Join Our Community
              </h2>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                Connect with others, share experiences, and help make Sri Lanka
                more accessible for everyone
              </p>
            </MotionWrapper>

            <div className="grid md:grid-cols-3 gap-8">
              <MotionWrapper direction="left">
                <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                  <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-green-100 flex items-center justify-center">
                    <Users className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-3">
                    Share Reviews
                  </h3>
                  <p className="text-slate-600">
                    Help others by sharing your experiences at accessible places
                  </p>
                </div>
              </MotionWrapper>
              <MotionWrapper delay={0.2} direction="up">
                <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                  <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-blue-100 flex items-center justify-center">
                    <MapPin className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-3">
                    Add New Places
                  </h3>
                  <p className="text-slate-600">
                    Contribute by adding new accessible locations to our database
                  </p>
                </div>
              </MotionWrapper>
              <MotionWrapper delay={0.4} direction="right">
                <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                  <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-purple-100 flex items-center justify-center">
                    <Star className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-3">
                    Rate & Review
                  </h3>
                  <p className="text-slate-600">
                    Provide detailed accessibility ratings to help the community
                  </p>
                </div>
              </MotionWrapper>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <MotionWrapper>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Ready to Explore?
              </h2>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Join thousands of users discovering accessible places across Sri
                Lanka
              </p>
            </MotionWrapper>

            <MotionWrapper delay={0.3} direction="up">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigate("/show-places")}
                  className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-lg shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 transition-all duration-300"
                >
                  Start Exploring
                </button>
                <button 
                  onClick={() => navigate("/learn-more")}
                  className="px-8 py-4 bg-white/20 backdrop-blur-sm text-white border border-white/30 rounded-xl font-semibold text-lg hover:bg-white/30 transition-all duration-300"
                >
                  Learn More
                </button>
              </div>
            </MotionWrapper>
          </div>
        </section>
      </div>
    </>
  );
}