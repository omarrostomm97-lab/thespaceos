import { useLocation } from "wouter";
import { useLogin } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { useLang } from "@/hooks/use-language";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Gamepad2, Sun, Moon, Languages } from "lucide-react";
import { defaultRedirect, UserRole } from "@/lib/permissions";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";

type LoginForm = { email: string; password: string };

export default function Login() {
  const [, setLocation] = useLocation();
  const { login: setAuth } = useAuth();
  const loginMutation = useLogin();
  const { t, lang, toggleLang, dir } = useLang();
  const { theme, toggleTheme } = useTheme();

  const loginSchema = z.object({
    email: z.string().email(t("email_invalid")),
    password: z.string().min(6, t("password_too_short")),
  });

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginForm) => {
    try {
      const response = await loginMutation.mutateAsync({ data });
      setAuth(response.token, response.user, response.refreshToken ?? undefined);
      setLocation(defaultRedirect(response.user.role as UserRole));
    } catch (err: any) {
      setError("root", {
        message: err?.data?.error || err?.response?.data?.error || t("login_error"),
      });
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background relative" dir={dir}>

      {/* Theme + Language toggles — top corner */}
      <div
        className="absolute top-5 flex items-center gap-2"
        style={{ [dir === "rtl" ? "left" : "right"]: "20px" }}
      >
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={toggleTheme}
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          style={{
            background: "hsl(var(--secondary))",
            border: "1px solid hsl(var(--border))",
            color: "hsl(var(--muted-foreground))",
          }}
          title={theme === "dark" ? t("switch_to_light") : t("switch_to_dark")}
        >
          {theme === "dark" ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-primary" />}
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={toggleLang}
          className="h-9 px-3 rounded-xl flex items-center gap-1.5 text-xs font-bold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          style={{
            background: "rgba(0,111,238,0.1)",
            border: "1px solid rgba(0,111,238,0.2)",
            color: "#006FEE",
          }}
          title={lang === "ar" ? t("switch_to_english") : t("switch_to_arabic")}
        >
          <Languages className="h-3.5 w-3.5" />
          <span>{lang === "ar" ? "EN" : "ع"}</span>
        </motion.button>
      </div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="w-full max-w-md p-8 space-y-8 rounded-2xl"
        style={{
          background: "hsl(var(--card))",
          border: "1px solid hsl(var(--card-border))",
          boxShadow: "var(--shadow-card)",
        }}
      >
        <div className="flex flex-col items-center text-center space-y-2">
          <div
            className="h-16 w-16 rounded-2xl flex items-center justify-center mb-2"
            style={{
              background: "linear-gradient(135deg, rgba(0,111,238,0.18) 0%, rgba(51,142,247,0.1) 100%)",
              border: "1px solid rgba(0,111,238,0.2)",
              boxShadow: "0 0 24px rgba(0,111,238,0.12)",
            }}
          >
            <Gamepad2 className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{t("login_system")}</h1>
          <p className="text-muted-foreground">{t("login_subtitle")}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {errors.root && (
            <div className="p-3 text-sm text-destructive-foreground bg-destructive/90 rounded-xl text-center font-medium">
              {errors.root.message}
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">{t("email")}</label>
              <Input
                type="email"
                placeholder="admin@gaminglounge.com"
                className="h-12 text-lg text-left"
                dir="ltr"
                isInvalid={!!errors.email}
                errorMessage={errors.email?.message}
                {...register("email")}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">{t("password")}</label>
              <Input
                type="password"
                placeholder="••••••••"
                className="h-12 text-lg text-left"
                dir="ltr"
                isInvalid={!!errors.password}
                errorMessage={errors.password?.message}
                {...register("password")}
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-14 text-xl font-bold shadow-lg shadow-primary/20"
            disabled={loginMutation.isPending || isSubmitting}
          >
            {loginMutation.isPending ? t("signing_in") : t("sign_in")}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
