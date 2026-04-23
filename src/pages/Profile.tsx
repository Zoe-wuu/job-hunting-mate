import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, LogOut, Rocket, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";

export default function Profile() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Redirect to /auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) navigate("/auth", { replace: true });
  }, [user, authLoading, navigate]);

  // Fetch profile
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("username, avatar_url")
        .eq("id", user.id)
        .maybeSingle();
      if (error) {
        toast.error(error.message);
      } else if (data) {
        setUsername(data.username ?? "");
        setAvatarUrl(data.avatar_url);
      }
      setLoading(false);
    })();
  }, [user]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error(t("文件不能超过 2MB", "File must be smaller than 2MB"));
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error(t("请上传图片文件", "Please upload an image file"));
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${user.id}/avatar-${Date.now()}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true, contentType: file.type });
      if (upErr) throw upErr;

      const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
      const url = pub.publicUrl;

      const { error: updErr } = await supabase
        .from("profiles")
        .update({ avatar_url: url })
        .eq("id", user.id);
      if (updErr) throw updErr;

      setAvatarUrl(url);
      toast.success(t("头像已更新", "Avatar updated"));
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    if (!user) return;
    if (!username.trim()) {
      toast.error(t("用户名不能为空", "Username cannot be empty"));
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ username: username.trim() })
      .eq("id", user.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success(t("资料已保存", "Profile saved"));
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth", { replace: true });
  };

  if (authLoading || loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 size={20} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  const initials = (username || user.email || "U").slice(0, 1).toUpperCase();

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

      <div className="flex-1 flex items-start justify-center px-4 py-8">
        <div className="w-full max-w-lg bg-card rounded-3xl shadow-elevated border border-border p-8">
          <h1 className="font-display text-2xl font-bold text-foreground mb-1">
            {t("个人中心", "Profile")}
          </h1>
          <p className="text-sm text-muted-foreground mb-6">
            {t("管理你的账户信息", "Manage your account details")}
          </p>

          {/* Avatar */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-secondary-wash flex items-center justify-center text-secondary-deep font-display font-bold text-3xl">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  initials
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center shadow-medium hover:scale-105 transition-transform disabled:opacity-50"
                aria-label={t("更换头像", "Change avatar")}
              >
                {uploading ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              {t("点击相机图标更换头像（最大 2MB）", "Click the camera to change avatar (max 2MB)")}
            </p>
          </div>

          {/* Username */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">
                {t("用户名", "Username")}
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                maxLength={50}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary-deep"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">
                {t("邮箱", "Email")}
              </label>
              <input
                type="email"
                value={user.email ?? ""}
                readOnly
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-muted/40 text-sm text-muted-foreground cursor-not-allowed"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-8">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {saving ? t("保存中...", "Saving...") : t("保存修改", "Save Changes")}
            </button>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-destructive hover:bg-destructive/5 transition-colors"
            >
              <LogOut size={15} />
              {t("退出登录", "Log Out")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
