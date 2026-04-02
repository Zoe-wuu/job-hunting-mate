import { User, Globe, LogOut } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from "@/contexts/LanguageContext";
import type { User as SupaUser } from "@supabase/supabase-js";

interface Props {
  user: SupaUser;
  onSignOut: () => void;
}

export default function ProfileDropdown({ user, onSignOut }: Props) {
  const { language, setLanguage, t } = useLanguage();

  const displayName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split("@")[0] ||
    "User";

  const initials = displayName.slice(0, 1).toUpperCase();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card text-sm text-muted-foreground hover:text-foreground transition-colors shadow-soft border border-border">
          <User size={15} />
          {t("个人中心", "Profile")}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-72 rounded-2xl p-0 shadow-elevated border border-border bg-card"
      >
        {/* Block A: User info */}
        <div className="flex items-center gap-3 p-4">
          <div className="w-10 h-10 rounded-full bg-secondary-wash flex items-center justify-center text-secondary-deep font-display font-bold text-sm shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{displayName}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        </div>

        <Separator />

        {/* Block B: Language switcher */}
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-foreground">
            <Globe size={16} className="text-muted-foreground" />
            <span>{t("语言", "Language")}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">中</span>
            <Switch
              checked={language === "en"}
              onCheckedChange={(checked) => setLanguage(checked ? "en" : "zh")}
            />
            <span className="text-xs text-muted-foreground">EN</span>
          </div>
        </div>

        <Separator />

        {/* Block C: Logout */}
        <div className="p-2">
          <button
            onClick={onSignOut}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-destructive hover:bg-destructive/5 transition-colors"
          >
            <LogOut size={16} />
            {t("退出登录", "Log Out")}
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
