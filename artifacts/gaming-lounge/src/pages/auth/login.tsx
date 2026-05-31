import { useLocation } from "wouter";
import { useLogin } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Gamepad2 } from "lucide-react";
import { defaultRedirect, UserRole } from "@/lib/permissions";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const loginSchema = z.object({
  email: z.string().email("البريد الإلكتروني غير صالح"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const [, setLocation] = useLocation();
  const { login: setAuth } = useAuth();
  const loginMutation = useLogin();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      const response = await loginMutation.mutateAsync({ data });
      setAuth(response.token, response.user, response.refreshToken ?? undefined);
      setLocation(defaultRedirect(response.user.role as UserRole));
    } catch (err: any) {
      setError("root", {
        message: err?.data?.error || err?.response?.data?.error || "حدث خطأ أثناء تسجيل الدخول",
      });
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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {errors.root && (
            <div className="p-3 text-sm text-destructive-foreground bg-destructive/90 rounded-md text-center font-medium">
              {errors.root.message}
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">البريد الإلكتروني</label>
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
              <label className="text-sm font-medium text-foreground">كلمة المرور</label>
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
            {loginMutation.isPending ? "جاري الدخول..." : "دخول"}
          </Button>
        </form>
      </div>
    </div>
  );
}
