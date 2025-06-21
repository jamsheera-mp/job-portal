import { type FC, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Lock } from "lucide-react";
import { api } from "@core/services/api";
import Header from "@components/Header";
import Footer from "@components/Footer";

const ResetPassword: FC = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [controller, setController] = useState<AbortController | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = location;
  const email = state?.email || "";
  const otp = state?.otp || "";

  useEffect(() => {
    if (!email || !otp) {
      setError("Invalid reset request. Please try again.");
      setTimeout(() => navigate("/login"), 2000);
    }
    return () => {
      if (controller) controller.abort();
    };
  }, [email, otp, navigate, controller]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!newPassword || !confirmPassword) {
      setError("Both password fields are required");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (newPassword.length < 8 || !/[!@#$%^&*]/.test(newPassword)) {
      setError("Password must be at least 8 characters and include a special character");
      return;
    }

    const abortController = new AbortController();
    setController(abortController);
    try {
      const response = await api.resetPassword({ email, otp, newPassword, confirmPassword }, abortController.signal);
      setSuccess("Password reset successful! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to reset password");
    } finally {
      setController(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header onRegisterClick={() => navigate("/register")} />
      <section className="py-16 flex-grow">
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm border p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Reset Password</h2>
            {error && <p className="text-center text-sm text-red-600 mb-4">{error}</p>}
            {success && <p className="text-center text-sm text-green-600 mb-4">{success}</p>}
            {!success && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                      <Lock className="h-5 w-5" />
                    </span>
                    <input
                      type="password"
                      id="newPassword"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="block w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter new password"
                      
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                      <Lock className="h-5 w-5" />
                    </span>
                    <input
                      type="password"
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="block w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Confirm new password"
                      
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors"
                >
                  Reset Password
                </button>
              </form>
            )}
            <p className="mt-6 text-center text-sm text-gray-600">
              Remember your password?{' '}
              <a href="/login" className="text-blue-600 hover:text-blue-800 font-medium">
                Login here
              </a>
            </p>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default ResetPassword;