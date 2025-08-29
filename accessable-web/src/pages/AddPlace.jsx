"use client";

import { useState } from "react";

// Mock form hook to simulate @mantine/form functionality
const useForm = ({ initialValues, validate }) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});

  const getInputProps = (field) => ({
    value: values[field],
    onChange: (e) => {
      const value =
        e.target.type === "checkbox" ? e.target.checked : e.target.value;
      setValues((prev) => ({ ...prev, [field]: value }));
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: null }));
      }
    },
    error: errors[field],
  });

  const validateForm = () => {
    const newErrors = {};
    Object.keys(validate).forEach((field) => {
      const error = validate[field](values[field]);
      if (error) newErrors[field] = error;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
  };

  return {
    values,
    getInputProps,
    validateForm,
    reset,
    setFieldValue: (field, value) =>
      setValues((prev) => ({ ...prev, [field]: value })),
  };
};

function AddPlace() {
  const [opened, setOpened] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeTab, setActiveTab] = useState("basic");

  const form = useForm({
    initialValues: {
      name: "",
      location: "",
      locationUrl: "",
      description: "",
      hasRamp: false,
      hasStepFreeEntrance: false,
      hasElevator: false,
      hasAccessibleRestroom: false,
      hasWidePathways: false,
      hasBrailleSignage: false,
      hasHighContrastSignage: false,
      hasAudioGuidance: false,
      hasSubtitledVideos: false,
      hasSignLanguage: false,
      hasVisualAlarmSystem: false,
      hasQuietSensoryArea: false,
      hasClearSimpleSignage: false,
      hasFirstAidStation: false,
      hasRestSeating: false,
      images: [],
    },
    validate: {
      name: (value) =>
        value.trim().length < 2 ? "Name must be at least 2 characters" : null,
      location: (value) =>
        value.trim().length < 2 ? "Location must be specified" : null,
      locationUrl: (value) =>
        !value.startsWith("http") ? "Please enter a valid URL" : null,
    },
  });

  const handleSubmit = async () => {
    if (!form.validateForm()) {
      return;
    }

    const values = form.values;

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Not authenticated - You are not logged in.");
      return;
    }

    setLoading(true);
    setProgress(0);

    try {
      const images = Array.isArray(values.images) ? values.images : [];
      const userStr = localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;
      const addedBy = user?.email || "";

      const payload = {
        name: values.name,
        location: values.location,
        locationUrl: values.locationUrl,
        description: values.description,
        addedBy,
        hasRamp: values.hasRamp,
        hasStepFreeEntrance: values.hasStepFreeEntrance,
        hasElevator: values.hasElevator,
        hasAccessibleRestroom: values.hasAccessibleRestroom,
        hasWidePathways: values.hasWidePathways,
        hasBrailleSignage: values.hasBrailleSignage,
        hasHighContrastSignage: values.hasHighContrastSignage,
        hasAudioGuidance: values.hasAudioGuidance,
        hasSubtitledVideos: values.hasSubtitledVideos,
        hasSignLanguage: values.hasSignLanguage,
        hasVisualAlarmSystem: values.hasVisualAlarmSystem,
        hasQuietSensoryArea: values.hasQuietSensoryArea,
        hasClearSimpleSignage: values.hasClearSimpleSignage,
        hasFirstAidStation: values.hasFirstAidStation,
        hasRestSeating: values.hasRestSeating,
        image1: images[0],
        image2: images[1],
        image3: images[2],
      };

      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(interval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch("/api/locations/addPlace", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      clearInterval(interval);
      setProgress(100);

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        const message =
          data?.error ||
          data?.message ||
          `Server responded with ${response.status}`;
        throw new Error(message);
      }

      console.log("Database response:", data);
      setOpened(true);
      form.reset();
    } catch (error) {
      console.error("Error adding place:", error);
      alert(`Error adding place: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const currentImages = form.values.images || [];
        if (currentImages.length < 3) {
          form.setFieldValue("images", [...currentImages, reader.result]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleContinue = () => {
    if (form.validateForm()) {
      setActiveTab("accessibility");
    }
  };

  const accessibilityFeatures = [
    {
      key: "hasRamp",
      label: "Wheelchair Ramp",
      icon: "♿",
      color: "bg-blue-50 border-blue-200 text-blue-800",
    },
    {
      key: "hasStepFreeEntrance",
      label: "Step-free Entrance",
      icon: "🚪",
      color: "bg-green-50 border-green-200 text-green-800",
    },
    {
      key: "hasElevator",
      label: "Elevator Access",
      icon: "🛗",
      color: "bg-purple-50 border-purple-200 text-purple-800",
    },
    {
      key: "hasAccessibleRestroom",
      label: "Accessible Restroom",
      icon: "🚻",
      color: "bg-indigo-50 border-indigo-200 text-indigo-800",
    },
    {
      key: "hasWidePathways",
      label: "Wide Pathways",
      icon: "↔️",
      color: "bg-teal-50 border-teal-200 text-teal-800",
    },
    {
      key: "hasBrailleSignage",
      label: "Braille Signage",
      icon: "⠃",
      color: "bg-orange-50 border-orange-200 text-orange-800",
    },
    {
      key: "hasHighContrastSignage",
      label: "High Contrast Signage",
      icon: "🔲",
      color: "bg-gray-50 border-gray-200 text-gray-800",
    },
    {
      key: "hasAudioGuidance",
      label: "Audio Guidance",
      icon: "🔊",
      color: "bg-red-50 border-red-200 text-red-800",
    },
    {
      key: "hasSubtitledVideos",
      label: "Subtitled Videos",
      icon: "📺",
      color: "bg-pink-50 border-pink-200 text-pink-800",
    },
    {
      key: "hasSignLanguage",
      label: "Sign Language Support",
      icon: "🤟",
      color: "bg-yellow-50 border-yellow-200 text-yellow-800",
    },
    {
      key: "hasVisualAlarmSystem",
      label: "Visual Alarm System",
      icon: "🚨",
      color: "bg-red-50 border-red-200 text-red-800",
    },
    {
      key: "hasQuietSensoryArea",
      label: "Quiet/Sensory Area",
      icon: "🤫",
      color: "bg-green-50 border-green-200 text-green-800",
    },
    {
      key: "hasClearSimpleSignage",
      label: "Clear Simple Signage",
      icon: "📋",
      color: "bg-blue-50 border-blue-200 text-blue-800",
    },
    {
      key: "hasFirstAidStation",
      label: "First Aid Station",
      icon: "🏥",
      color: "bg-red-50 border-red-200 text-red-800",
    },
    {
      key: "hasRestSeating",
      label: "Rest Seating",
      icon: "💺",
      color: "bg-purple-50 border-purple-200 text-purple-800",
    },
  ];

  return (
    <div className="min-h-screen bg-purple-50">
      {/* Header with gradient and geometric patterns */}
      <div
        className="text-white py-16 relative"
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          overflow: "hidden",
        }}
      >
        <svg
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            opacity: 0.1,
            top: 0,
            left: 0,
            zIndex: 0,
          }}
          viewBox="0 0 1000 1000"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <pattern
              id="grid"
              x="0"
              y="0"
              width="100"
              height="100"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 100 0 L 0 0 0 100"
                fill="none"
                stroke="white"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        <svg
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            opacity: 0.05,
            top: 0,
            left: 0,
            zIndex: 0,
          }}
          viewBox="0 0 1000 1000"
          preserveAspectRatio="xMidYMid slice"
        >
          <circle cx="200" cy="150" r="80" fill="white" />
          <circle cx="760" cy="160" r="60" fill="white" />
          <circle cx="100" cy="400" r="60" fill="white" />
          <circle cx="850" cy="400" r="50" fill="white" />
          <circle cx="150" cy="700" r="70" fill="white" />
          <circle cx="655" cy="705" r="55" fill="white" />
          <circle cx="850" cy="750" r="65" fill="white" />
        </svg>

        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.1)",
            zIndex: 0,
          }}
        />

        <div className="container mx-auto px-6 py-16 text-center relative z-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl mb-2">
            <span className="text-2xl">♿</span>
          </div>
          <h1 className="text-4xl font-bold">Add New Accessible Location</h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Help others by sharing accessibility information
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 -mt-8 pb-12 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-purple-100 overflow-hidden">
            {/* Progress Bar */}
            {loading && (
              <div className="bg-gray-50 px-8 py-4 border-b">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Uploading location...</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${progress}%`,
                      background:
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    }}
                  />
                </div>
              </div>
            )}

            {/* Tab Navigation */}
            <div className="flex border-b">
              <button
                className={`flex-1 py-4 px-6 text-center font-semibold text-lg transition-colors ${
                  activeTab === "basic"
                    ? "text-purple-600 border-b-2 border-purple-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("basic")}
              >
                Basic Information
              </button>
              <button
                disabled={activeTab !== "accessibility"} // disable if not active
                className={`flex-1 py-4 px-6 text-center font-semibold text-lg transition-colors
    ${
      activeTab === "accessibility"
        ? "text-purple-600 border-b-2 border-purple-600"
        : "text-gray-500 hover:text-gray-700"
    }
    ${activeTab !== "accessibility" ? "opacity-50 cursor-not-allowed" : ""}
  `}
                onClick={() => setActiveTab("accessibility")}
              >
                Accessibility Features
              </button>
            </div>

            <div className="p-8 space-y-10">
              {/* Basic Information Tab */}
              {activeTab === "basic" && (
                <div className="space-y-10">
                  {/* Basic Information Section */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 pb-4 border-b">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-blue-600 text-lg">📍</span>
                      </div>
                      <h2 className="text-2xl font-semibold text-gray-900">
                        Basic Information
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Place Name *
                        </label>
                        <input
                          {...form.getInputProps("name")}
                          type="text"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="Enter place name"
                        />
                        {form.getInputProps("name").error && (
                          <p className="text-red-500 text-sm mt-1">
                            {form.getInputProps("name").error}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Location *
                        </label>
                        <input
                          {...form.getInputProps("location")}
                          type="text"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="City, District"
                        />
                        {form.getInputProps("location").error && (
                          <p className="text-red-500 text-sm mt-1">
                            {form.getInputProps("location").error}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Location URL *
                      </label>
                      <input
                        {...form.getInputProps("locationUrl")}
                        type="url"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="https://maps.google.com/..."
                      />
                      {form.getInputProps("locationUrl").error && (
                        <p className="text-red-500 text-sm mt-1">
                          {form.getInputProps("locationUrl").error}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        {...form.getInputProps("description")}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                        placeholder="Describe the place and its accessibility features..."
                      />
                    </div>
                  </div>

                  {/* Image Upload Section */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 pb-4 border-b">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <span className="text-green-600 text-lg">📸</span>
                      </div>
                      <h2 className="text-2xl font-semibold text-gray-900">
                        Photos (Optional)
                      </h2>
                    </div>

                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-gray-50 hover:bg-gray-100 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                        id="imageUpload"
                      />
                      <label htmlFor="imageUpload" className="cursor-pointer">
                        <div className="text-gray-400 mb-4">
                          <svg
                            className="w-12 h-12 mx-auto"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 48 48"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M24 8v24m8-12H16"
                            />
                            <rect
                              x="6"
                              y="6"
                              width="36"
                              height="36"
                              rx="4"
                              ry="4"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={1.5}
                            />
                          </svg>
                        </div>
                        <p className="text-gray-600 font-medium mb-2">
                          Click to upload images
                        </p>
                        <p className="text-gray-500 text-sm">
                          PNG, JPG up to 5MB each (max 3 images)
                        </p>
                      </label>

                      {form.values.images && form.values.images.length > 0 && (
                        <div className="mt-6 flex flex-wrap gap-4 justify-center">
                          {form.values.images.map((img, idx) => (
                            <div key={idx} className="relative">
                              <img
                                src={img || "/placeholder.svg"}
                                alt={`Upload ${idx + 1}`}
                                className="w-24 h-24 object-cover rounded-lg border-2 border-gray-200 shadow-sm"
                              />
                              <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs">
                                ✓
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Buttons for Basic Information Tab */}
                  <div className="flex justify-center gap-4 pt-6 border-t">
                    <button
                      onClick={handleContinue}
                      disabled={loading}
                      className="text-white font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-3 min-w-[200px] justify-center"
                      style={{
                        background:
                          "linear-gradient(135deg, #34d399 0%, #059669 100%)",
                      }}
                    >
                      <span>➡️</span>
                      Continue
                    </button>
                  </div>
                </div>
              )}

              {/* Accessibility Features Tab */}
              {activeTab === "accessibility" && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 pb-4 border-b">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <span className="text-purple-600 text-lg">✨</span>
                    </div>
                    <div>
                      <h2 className="text-2xl font-semibold text-gray-900">
                        Accessibility Features
                      </h2>
                      <p className="text-gray-600 text-sm">
                        Select all accessibility features available at this
                        location
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {accessibilityFeatures.map((feature) => (
                      <label
                        key={feature.key}
                        className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer hover:shadow-md transition-all ${
                          form.values[feature.key]
                            ? feature.color + " border-current shadow-sm"
                            : "bg-white border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <input
                          {...form.getInputProps(feature.key)}
                          type="checkbox"
                          className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-xl">{feature.icon}</span>
                        <span className="text-sm font-medium text-gray-700">
                          {feature.label}
                        </span>
                      </label>
                    ))}
                  </div>

                  {/* Submit Button for Accessibility Tab */}
                  <div className="flex justify-center pt-6 border-t">
                    <button
                      onClick={handleSubmit}
                      disabled={loading}
                      className="text-white font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-3 min-w-[200px] justify-center"
                      style={{
                        background:
                          "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      }}
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
                          Adding Place...
                        </>
                      ) : (
                        <>
                          <span>❤️</span>
                          Add Place
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {opened && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Success!</h3>
            <p className="text-gray-600 mb-6">
              Your accessible location has been added successfully. Thank you
              for making places more inclusive!
            </p>
            <button
              onClick={() => {
                setOpened(false);
              }}
              className="text-white font-semibold py-3 px-6 rounded-xl hover:shadow-lg transition-all duration-200"
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              }}
            >
              Back to Home
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AddPlace;
