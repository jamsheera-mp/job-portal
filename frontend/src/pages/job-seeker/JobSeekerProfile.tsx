import React, { useState, useEffect } from "react";
import { Edit, FileText, Target, Calendar, Settings, LogOut, MessageSquare, Image } from "lucide-react";
import Header from "@components/Header";
import Footer from "@components/Footer";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@core/hooks/useAuth";
import withAuthProtection from "@core/hoc/withAuthProtection";
import { useProfile } from "@core/hooks/useProfile";
import type { JobSeeker } from "@core/types/types";

const JobSeekerProfile: React.FC = () => {
  const navigate = useNavigate();
  const { logout, isAuthenticated, checkAuth } = useAuth();
  const { profile, loading, error, uploadProfilePicture, updateProfile } = useProfile();
  const [activeSection, setActiveSection] = useState<string>("profile");
  const [showCompleteForm, setShowCompleteForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [formData, setFormData] = useState({
    name: (profile as JobSeeker)?.name || "",
    phone: (profile as JobSeeker)?.phone || "",
    bio: (profile as JobSeeker)?.bio || "",
    skills: (profile as JobSeeker)?.skills?.join(", ") || "",
    experience: (profile as JobSeeker)?.experience?.map((exp) => `${exp.company} (${exp.role}, ${exp.years} yrs)`).join("; ") || "",
    resumeUrl: (profile as JobSeeker)?.resumeUrl || "",
    githubUrl: (profile as JobSeeker)?.githubUrl || "",
    linkedinUrl: (profile as JobSeeker)?.linkedinUrl || "",
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const sidebarItems = [
    { id: "profile", label: "Profile", icon: Edit },
    { id: "applications", label: "My Applications", icon: FileText },
    { id: "saved", label: "Saved Jobs", icon: Target },
    { id: "resume", label: "My Resume", icon: FileText },
    { id: "interview", label: "Interview Schedule", icon: Calendar },
    { id: "settings", label: "Settings", icon: Settings },
    { id: "messages", label: "Messages", icon: MessageSquare },
  ];

  useEffect(() => {
    const verifyAuth = async () => {
      if (!isAuthenticated() || (await checkAuth()) !== "jobSeeker") {
        navigate("/login");
      }
    };
    verifyAuth();
  }, [isAuthenticated, checkAuth, navigate]); // Ensure all dependencies are listed

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (err: any) {
      console.error("Logout failed:", err.message);
    }
  };

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      uploadProfilePicture(e.target.files[0]);
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = "Name is required";
    if (!formData.phone.trim()) errors.phone = "Phone is required";
    if (!formData.bio.trim()) errors.bio = "Bio is required";
    if (!formData.skills.trim()) errors.skills = "Skills are required";
    if (!formData.experience.trim()) errors.experience = "Experience is required";
    return errors;
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setValidationErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    const updatedData = {
      name: formData.name,
      phone: formData.phone,
      bio: formData.bio,
      skills: formData.skills.split(",").map((s) => s.trim()),
      experience: formData.experience
        .split(";")
        .map((exp) => {
          const [company, roleYears] = exp.split("(");
          const [role, years] = roleYears ? roleYears.replace(")", "").split(", ") : ["", ""];
          const yearsNum = parseInt(years.replace(" yrs", ""), 10) || 0;
          return { company: company.trim(), role: role.trim(), years: yearsNum };
        })
        .filter((exp) => exp.company),
      resumeUrl: formData.resumeUrl,
      githubUrl: formData.githubUrl,
      linkedinUrl: formData.linkedinUrl,
    };

    updateProfile(updatedData);
    setShowCompleteForm(false);
    setShowEditForm(false);
  };

  if (loading) return <div className="p-6 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <div className="flex flex-1">
        <div className="w-72 bg-white shadow-sm border-r border-gray-200">
          <div className="p-6 border-b border-gray-100">
            <div className="text-center">
              <label className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-3 flex items-center justify-center border-2 border-dashed border-gray-300 cursor-pointer">
                {(profile as JobSeeker)?.profilePictureUrl ? (
                  <img src={`${process.env.REACT_APP_API_URL}${profile?.profilePictureUrl}`} alt="Profile" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <Image className="w-6 h-6 text-gray-400" />
                )}
                <input type="file" className="hidden" onChange={handleProfilePictureChange} />
              </label>
              <div className="text-xs text-gray-500 mb-2">Upload your profile picture</div>
              <div className="font-semibold text-gray-900">{(profile as JobSeeker)?.name || "Loading..."}</div>
              <div className="text-sm text-gray-500">Complete your profile</div>
            </div>
          </div>
          <div className="p-4">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center px-4 py-3 text-left rounded-lg mb-2 transition-colors ${
                  activeSection === item.id
                    ? "bg-blue-50 text-blue-600 border border-blue-200"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.label}
              </button>
            ))}
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-3 text-left rounded-lg text-red-600 hover:bg-red-50 mt-4"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Logout
            </button>
          </div>
        </div>

        <div className="flex-1">
          <div className="p-8">
            {error && <p className="text-center text-red-600 mb-4">{error}</p>}
            {loading ? (
              <p className="text-center">Loading...</p>
            ) : activeSection === "profile" ? (
              <div className="text-center max-w-md mx-auto">
                <h1 className="text-3xl font-bold text-blue-600 mb-4">Profile</h1>
                <p><strong>Name:</strong> {(profile as JobSeeker)?.name || "Not provided"}</p>
                <p><strong>Email:</strong> {profile?.email}</p>
                <p><strong>Phone:</strong> {(profile as JobSeeker)?.phone || "Not provided"}</p>
                <p><strong>Bio:</strong> {(profile as JobSeeker)?.bio || "Not provided"}</p>
                <p><strong>Skills:</strong> {(profile as JobSeeker)?.skills?.join(", ") || "Not provided"}</p>
                <p><strong>Experience:</strong> {(profile as JobSeeker)?.experience?.map((exp) => `${exp.company} (${exp.role}, ${exp.years} yrs)`).join("; ") || "Not provided"}</p>
                <p><strong>Resume URL:</strong> {(profile as JobSeeker)?.resumeUrl || "Not provided"}</p>
                <p><strong>GitHub URL:</strong> {(profile as JobSeeker)?.githubUrl || "Not provided"}</p>
                <p><strong>LinkedIn URL:</strong> {(profile as JobSeeker)?.linkedinUrl || "Not provided"}</p>
                <button
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  onClick={() => setShowEditForm(true)}
                >
                  Edit Profile
                </button>
              </div>
            ) : (
              <div className="text-center max-w-md mx-auto">
                <h1 className="text-3xl font-bold text-blue-600 mb-4">Welcome</h1>
                <p className="text-gray-600">Hello, {(profile as JobSeeker)?.name || "Job Seeker"}! Complete your profile to get started.</p>
                <button
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  onClick={() => setShowCompleteForm(true)}
                >
                  Complete Profile
                </button>
              </div>
            )}
            {showCompleteForm && (
              <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
                <div className="bg-white p-6 rounded-lg shadow-lg w-1/2">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Complete Your Profile</h2>
                  <form onSubmit={handleSubmit}>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleFormChange}
                      className="w-full p-2 mb-2 border rounded"
                      placeholder="Name"
                    />
                    {validationErrors.name && <p className="text-red-600 text-sm">{validationErrors.name}</p>}
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleFormChange}
                      className="w-full p-2 mb-2 border rounded"
                      placeholder="Phone"
                    />
                    {validationErrors.phone && <p className="text-red-600 text-sm">{validationErrors.phone}</p>}
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleFormChange}
                      className="w-full p-2 mb-2 border rounded"
                      placeholder="Bio"
                    />
                    {validationErrors.bio && <p className="text-red-600 text-sm">{validationErrors.bio}</p>}
                    <input
                      type="text"
                      name="skills"
                      value={formData.skills}
                      onChange={handleFormChange}
                      className="w-full p-2 mb-2 border rounded"
                      placeholder="Skills (comma-separated)"
                    />
                    {validationErrors.skills && <p className="text-red-600 text-sm">{validationErrors.skills}</p>}
                    <input
                      type="text"
                      name="experience"
                      value={formData.experience}
                      onChange={handleFormChange}
                      className="w-full p-2 mb-2 border rounded"
                      placeholder="Experience (e.g., Company (Role, X yrs); Company2 (Role2, Y yrs))"
                    />
                    {validationErrors.experience && <p className="text-red-600 text-sm">{validationErrors.experience}</p>}
                    <input
                      type="url"
                      name="resumeUrl"
                      value={formData.resumeUrl}
                      onChange={handleFormChange}
                      className="w-full p-2 mb-2 border rounded"
                      placeholder="Resume URL"
                    />
                    <input
                      type="url"
                      name="githubUrl"
                      value={formData.githubUrl}
                      onChange={handleFormChange}
                      className="w-full p-2 mb-2 border rounded"
                      placeholder="GitHub URL"
                    />
                    <input
                      type="url"
                      name="linkedinUrl"
                      value={formData.linkedinUrl}
                      onChange={handleFormChange}
                      className="w-full p-2 mb-2 border rounded"
                      placeholder="LinkedIn URL"
                    />
                    <div className="flex justify-end space-x-2">
                      <button
                        type="button"
                        onClick={() => setShowCompleteForm(false)}
                        className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                      <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                        Save
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
            {showEditForm && (
              <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
                <div className="bg-white p-6 rounded-lg shadow-lg w-1/2">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Edit Profile</h2>
                  <form onSubmit={handleSubmit}>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleFormChange}
                      className="w-full p-2 mb-2 border rounded"
                      placeholder="Name"
                    />
                    {validationErrors.name && <p className="text-red-600 text-sm">{validationErrors.name}</p>}
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleFormChange}
                      className="w-full p-2 mb-2 border rounded"
                      placeholder="Phone"
                    />
                    {validationErrors.phone && <p className="text-red-600 text-sm">{validationErrors.phone}</p>}
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleFormChange}
                      className="w-full p-2 mb-2 border rounded"
                      placeholder="Bio"
                    />
                    {validationErrors.bio && <p className="text-red-600 text-sm">{validationErrors.bio}</p>}
                    <input
                      type="text"
                      name="skills"
                      value={formData.skills}
                      onChange={handleFormChange}
                      className="w-full p-2 mb-2 border rounded"
                      placeholder="Skills (comma-separated)"
                    />
                    {validationErrors.skills && <p className="text-red-600 text-sm">{validationErrors.skills}</p>}
                    <input
                      type="text"
                      name="experience"
                      value={formData.experience}
                      onChange={handleFormChange}
                      className="w-full p-2 mb-2 border rounded"
                      placeholder="Experience (e.g., Company (Role, X yrs); Company2 (Role2, Y yrs))"
                    />
                    {validationErrors.experience && <p className="text-red-600 text-sm">{validationErrors.experience}</p>}
                    <input
                      type="url"
                      name="resumeUrl"
                      value={formData.resumeUrl}
                      onChange={handleFormChange}
                      className="w-full p-2 mb-2 border rounded"
                      placeholder="Resume URL"
                    />
                    <input
                      type="url"
                      name="githubUrl"
                      value={formData.githubUrl}
                      onChange={handleFormChange}
                      className="w-full p-2 mb-2 border rounded"
                      placeholder="GitHub URL"
                    />
                    <input
                      type="url"
                      name="linkedinUrl"
                      value={formData.linkedinUrl}
                      onChange={handleFormChange}
                      className="w-full p-2 mb-2 border rounded"
                      placeholder="LinkedIn URL"
                    />
                    <div className="flex justify-end space-x-2">
                      <button
                        type="button"
                        onClick={() => setShowEditForm(false)}
                        className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                      <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                        Save
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default withAuthProtection("jobSeeker")(JobSeekerProfile);