import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Rocket, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";

type Mode = "signin" | "signup";

export default function Auth() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [params] = useSearchParams();
  const initialMode = (params.get("mode") as Mode) === "signup" ? "signup" : "signin";

  const [mode, setMode] = useState<Mode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  // Already logged in → go home
  useEffect(() => {
    if (!authLoading && user) navigate("/", { replace: true });
  }, [user, authLoading, navigate]);

  // Show confirmed banner when arriving from email link
  useEffect(() => {
    if (params.get("confirmed") === "1") {
      toast.success(t("邮箱已激活，请登录", "Email confirmed, please sign in"));
    }
  }, [params, t]);

  const validate = (): string | null => {
    if (!email.trim()) return t("请输入邮箱", "Please enter your email");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return t("邮箱格式不正确", "Invalid email format");
    if (password.length < 6) return t("密码至少 6 位", "Password must be at least 6 characters");
    if (mode === "signup" && password !== confirmPassword) {
      return t("两次输入的密码不一致", "Passwords do not match");
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      toast.error(err);
      return;
    }
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth?confirmed=1`,
          },
        });
        if (error) {
          if (error.message.toLowerCase().includes("already")) {
            toast.error(t("该邮箱已被注册", "This email is already registered"));
          } else {
            toast.error(error.message);
          }
          return;
        }
        setEmailSent(true);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          const msg = error.message.toLowerCase();
          if (msg.includes("email not confirmed")) {
            toast.error(t("邮箱未激活，请先查收激活邮件", "Email not confirmed, please check your inbox"));
          } else if (msg.includes("invalid")) {
            toast.error(t("邮箱或密码错误", "Invalid email or password"));
          } else {
            toast.error(error.message);
          }
          return;
        }
        toast.success(t("登录成功", "Signed in successfully"));
        navigate("/", { replace: true });
      }
    } finally {
      setLoading(false);
    }
  };

  // Success screen after signup
  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="bg-card rounded-3xl shadow-elevated border border-border w-full max-w-md p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-secondary-wash flex items-center justify-center mx-auto mb-5">
            <Mail size={26} className="text-secondary-deep" />
          </div>
          <h2 className="font-display text-xl font-bold text-foreground mb-2">
            {t("确认邮件已发送", "Confirmation email sent")}
          </h2>
          <p className="text-sm text-muted-foreground mb-1">
            {t(
              "确认邮件已发送到你的邮箱，请查收并点击链接激活账户",
              "A confirmation email has been sent. Please check your inbox and click the link to activate your account."
            )}
          </p>
          <p className="text-xs text-muted-foreground mb-6 font-medium">{email}</p>
          <button
            onClick={() => {
              setEmailSent(false);
              setMode("signin");
              setPassword("");
              setConfirmPassword("");
            }}
            className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            {t("返回登录", "Back to sign in")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="px-6 py-3 flex items-center justify-between">
        <Link to="/" className="font-display text-xl font-extrabold text-foreground tracking-wider flex items-center gap-2">
          <Rocket size={20} className="text-primary" />
          HIRED
        </Link>
        <Link
          to="/"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={14} />
          {t("返回主页", "Back home")}
        </Link>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="bg-card rounded-3xl shadow-elevated border border-border w-full max-w-md p-8">
          <h2 className="font-display text-2xl font-bold text-foreground mb-1">
            {mode === "signup" ? t("创建账户", "Create Account") : t("欢迎回来", "Welcome Back")}
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            {mode === "signup"
              ? t("注册以保存你的求职进度", "Sign up to save your job search progress")
              : t("登录以继续你的求职之旅", "Sign in to continue your job search")}
          </p>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("邮箱地址", "Email address")}
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary-deep transition-shadow"
              />
            </div>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("密码（至少 6 位）", "Password (min 6 chars)")}
                required
                minLength={6}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary-deep transition-shadow"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {mode === "signup" && (
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type={showPw ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t("确认密码", "Confirm password")}
                  required
                  minLength={6}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary-deep transition-shadow"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {loading
                ? t("处理中...", "Processing...")
                : mode === "signup"
                  ? t("注册", "Sign Up")
                  : t("登录", "Sign In")}
            </button>
          </form>

          <p className="text-center text-xs text-muted-foreground mt-5">
            {mode === "signup" ? t("已有账户？", "Already have an account? ") : t("没有账户？", "Don't have an account? ")}
            <button
              onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
              className="text-secondary-deep font-medium hover:underline"
            >
              {mode === "signup" ? t("立即登录", "Sign In") : t("立即注册", "Sign Up")}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
