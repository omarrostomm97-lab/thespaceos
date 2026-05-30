import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";

export default function Unauthorized() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background" dir="rtl">
      <div className="max-w-md w-full text-center space-y-6 p-8 bg-card border border-border rounded-xl shadow-2xl">
        <div className="flex justify-center">
          <div className="h-24 w-24 bg-destructive/10 rounded-full flex items-center justify-center">
            <ShieldAlert className="h-12 w-12 text-destructive" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">صلاحيات غير كافية</h1>
          <p className="text-muted-foreground">
            عذراً، حسابك لا يملك الصلاحيات اللازمة للوصول إلى هذه الصفحة.
          </p>
        </div>

        <Link href="/dashboard">
          <Button className="w-full h-12 text-lg font-bold">
            العودة للوحة الرئيسية
          </Button>
        </Link>
      </div>
    </div>
  );
}
