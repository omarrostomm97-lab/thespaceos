import { useState } from "react";
import { useLocation } from "wouter";
import { useLogin } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Gamepad2 } from "lucide-react";
import { defaultRedirect, UserRole } from "@/lib/permissions";

export default function Login() {
  const [, setLocation] = useLocation();
  const { login: setAuth } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [error, setError] = useState<string | null>(null);

  const loginMutation = useLogin();

  const validate = (): { email?: string; password?: string } => {
    const errs: { email?: string; password?: string } = {};
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = "البريد الإلكتروني غير صالح";
    }
    if (!password || password.length < 6) {
      errs.password = "كلمة المرور يجب أن تكون 6 أحرف على الأقل";
    }
    return errs;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setError(null);
    try {
      const response = await loginMutation.mutateAsync({ data: { email, password } });
      setAuth(response.token, response.user, response.refreshToken ?? undefined);
      setLocation(defaultRedirect(response.user.role as UserRole));
    } catch (err: any) {
      setError(err?.data?.error || err?.response?.data?.error || "حدث خطأ أثناء تسجيل الدخول");
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background" dir="rtl">
      <div className="w-full max-w-md p-8 space-y-8 bg-card border border-border rounded-xl shadow-2xl">
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-2">
            <Gamepad2 className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">نظام جيمينج لاونج</h1>
          <p className="text-muted-foreground">تسجيل الدخول للوحة التحكم</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          {error && (
            <div className="p-3 text-sm text-destructive-foreground bg-destructive/90 rounded-md text-center font-medium">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">البريد الإلكتروني</label>
              <Input
                type="email"
                placeholder="admin@gaminglounge.com"
                value={email}
                onChange={(e) => setEmail((e.target as HTMLInputElement).value)}
                className="h-12 text-lg text-left"
                dir="ltr"
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">كلمة المرور</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword((e.target as HTMLInputElement).value)}
                className="h-12 text-lg text-left"
                dir="ltr"
              />
              {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-14 text-xl font-bold shadow-lg shadow-primary/20"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? "جاري الدخول..." : "دخول"}
          </Button>
        </form>
      </div>
    </div>
  );
}
