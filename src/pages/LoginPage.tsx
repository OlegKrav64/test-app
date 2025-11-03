import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import LoginForm from "@/components/LoginForm";

export default function LoginPage() {
  const navigate = useNavigate();
  const userName = useAuthStore((state) => state.userName);
  const isLoading = useAuthStore((state) => state.isLoading);

  useEffect(() => {
    if (!isLoading && userName) {
      navigate("/plan", { replace: true });
    }
  }, [userName, isLoading, navigate]);

  if (isLoading) {
    return (
      <main className="min-h-screen grid place-items-center p-6">
        <div className="text-gray-500">Loading...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen grid place-items-center p-6 bg-gray-50">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome</h1>
        <p className="text-gray-600 mb-6">Enter your name to get started</p>
        <LoginForm />
      </div>
    </main>
  );
}
