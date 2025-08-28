import { useState, useEffect } from "react";
import {
  Accessibility,
  MapPin,
  Users,
  Star,
  Shield,
  Award,
  Heart,
  Globe,
  Clock,
  CheckCircle,
  ArrowRight,
  ChevronDown,
  Search,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// Custom hook for scroll-triggered animations
const useScrollAnimation = () => {
  const [ref, setRef] = useState(null);
  const [inView, setInView] = useState(false);

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

// Motion wrapper component
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

export default function LearnMore() {
  const navigate = useNavigate();
  const [expandedSection, setExpandedSection] = useState(null);

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const features = [
    {
      icon: Accessibility,
      title: "Comprehensive Accessibility Information",
      description: "Detailed information about wheelchair accessibility, ramps, elevators, accessible restrooms, and more.",
      color: "blue"
    },
    {
      icon: MapPin,
      title: "Interactive Map",
      description: "Explore accessible places on an interactive map with real-time location data and directions.",
      color: "green"
    },
    {
      icon: Users,
      title: "Community-Driven Reviews",
      description: "Read and write reviews from real users who have visited these locations.",
      color: "purple"
    },
    {
      icon: Shield,
      title: "Verified Information",
      description: "All locations are verified by our community and reviewed for accuracy.",
      color: "orange"
    },
    {
      icon: Star,
      title: "Detailed Ratings",
      description: "Rate places based on multiple accessibility criteria to help others make informed decisions.",
      color: "pink"
    },
    {
      icon: Heart,
      title: "User-Friendly Interface",
      description: "Designed with accessibility in mind, ensuring everyone can easily navigate and use the platform.",
      color: "red"
    }
  ];

  const howItWorks = [
    {
      step: "1",
      title: "Discover Places",
      description: "Browse our comprehensive database of accessible locations across Sri Lanka.",
      icon: Search
    },
    {
      step: "2",
      title: "Read Reviews",
      description: "Learn from community experiences and detailed accessibility assessments.",
      icon: Users
    },
    {
      step: "3",
      title: "Plan Your Visit",
      description: "Use our interactive map and detailed information to plan your trip.",
      icon: MapPin
    },
    {
      step: "4",
      title: "Share Your Experience",
      description: "Contribute to the community by adding new places or writing reviews.",
      icon: Heart
    }
  ];

  const faqs = [
    {
      question: "How do I add a new accessible place?",
      answer: "Simply click on 'Add a Place' in the navigation menu. You'll need to provide details about the location, accessibility features, and upload photos if possible. All submissions are reviewed by our community before being published."
    },
    {
      question: "How accurate is the accessibility information?",
      answer: "All information is community-verified and regularly updated. Users can report outdated information, and our team works to maintain accuracy. We encourage users to leave reviews to help keep information current."
    },
    {
      question: "Can I use this platform if I'm not in a wheelchair?",
      answer: "Absolutely! AccessAble is for everyone who values accessibility. Whether you're planning for a family member, friend, or future needs, our platform helps everyone find comfortable, accessible places."
    },
    {
      question: "How can I contribute to the community?",
      answer: "You can contribute by adding new places, writing reviews, rating existing locations, and sharing your experiences. Every contribution helps make Sri Lanka more accessible for everyone."
    },
    {
      question: "Is the platform available in multiple languages?",
      answer: "Currently, the platform is available in English and Sinhala. We're working on adding Tamil support to make it accessible to more users across Sri Lanka."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <MotionWrapper>
              <div className="mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/30 shadow-2xl">
                  <Accessibility className="w-10 h-10 text-white" />
                </div>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                About AccessAble
              </h1>
              <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed">
                Empowering independence and accessibility across Sri Lanka through community-driven information sharing
              </p>
            </MotionWrapper>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <MotionWrapper className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-6">
                Our Mission
              </h2>
              <p className="text-xl text-slate-600 max-w-4xl mx-auto leading-relaxed">
                AccessAble Sri Lanka is dedicated to creating a more inclusive and accessible environment for everyone. 
                We believe that information about accessibility should be readily available, accurate, and community-driven. 
                Our platform connects people with verified accessible locations, empowering individuals to explore, 
                connect, and live independently.
              </p>
            </MotionWrapper>

            <div className="grid md:grid-cols-3 gap-8">
              <MotionWrapper direction="left">
                <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100">
                  <Globe className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-800 mb-3">Inclusive Sri Lanka</h3>
                  <p className="text-slate-600">
                    Making every corner of Sri Lanka accessible and welcoming for everyone
                  </p>
                </div>
              </MotionWrapper>
              <MotionWrapper delay={0.2} direction="up">
                <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100">
                  <Users className="w-12 h-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-800 mb-3">Community First</h3>
                  <p className="text-slate-600">
                    Built by the community, for the community, ensuring real and relevant information
                  </p>
                </div>
              </MotionWrapper>
              <MotionWrapper delay={0.4} direction="right">
                <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-100">
                  <Award className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-800 mb-3">Quality Assured</h3>
                  <p className="text-slate-600">
                    Verified information and community reviews ensure accuracy and reliability
                  </p>
                </div>
              </MotionWrapper>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <MotionWrapper className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
                Platform Features
              </h2>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                Everything you need to discover and share accessible places
              </p>
            </MotionWrapper>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <MotionWrapper key={index} delay={index * 0.1} direction="scale">
                  <div className="group p-8 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                    <div className={`w-16 h-16 mb-6 rounded-2xl bg-${feature.color}-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className={`w-8 h-8 text-${feature.color}-600`} />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-800 mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-slate-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </MotionWrapper>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <MotionWrapper className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
                How It Works
              </h2>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                Simple steps to discover and contribute to accessible places
              </p>
            </MotionWrapper>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {howItWorks.map((step, index) => (
                <MotionWrapper key={index} delay={index * 0.2} direction="up">
                  <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-slate-50 to-white border border-slate-200 hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                    <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-bold">
                      {step.step}
                    </div>
                    <step.icon className="w-8 h-8 text-blue-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-slate-800 mb-3">
                      {step.title}
                    </h3>
                    <p className="text-slate-600">
                      {step.description}
                    </p>
                  </div>
                </MotionWrapper>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-slate-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <MotionWrapper className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-xl text-slate-600">
                Everything you need to know about AccessAble
              </p>
            </MotionWrapper>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <MotionWrapper key={index} delay={index * 0.1} direction="up">
                  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                    <button
                      onClick={() => toggleSection(index)}
                      className="w-full p-6 text-left flex items-center justify-between hover:bg-slate-50 transition-colors duration-200"
                    >
                      <h3 className="text-lg font-semibold text-slate-800 pr-4">
                        {faq.question}
                      </h3>
                      <ChevronDown 
                        className={`w-5 h-5 text-slate-600 transition-transform duration-200 ${
                          expandedSection === index ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {expandedSection === index && (
                      <div className="px-6 pb-6">
                        <p className="text-slate-600 leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    )}
                  </div>
                </MotionWrapper>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <MotionWrapper>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Ready to Get Started?
              </h2>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Join our community and help make Sri Lanka more accessible for everyone
              </p>
            </MotionWrapper>

            <MotionWrapper delay={0.3} direction="up">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigate("/show-places")}
                  className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-lg shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3"
                >
                  <MapPin className="w-5 h-5" />
                  Explore Places
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => navigate("/add-place")}
                  className="px-8 py-4 bg-white/20 backdrop-blur-sm text-white border border-white/30 rounded-xl font-semibold text-lg hover:bg-white/30 transition-all duration-300 flex items-center justify-center gap-3"
                >
                  <Heart className="w-5 h-5" />
                  Add a Place
                </button>
              </div>
            </MotionWrapper>
          </div>
        </section>
      </div>
  );
}
