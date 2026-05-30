import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings2, Globe, Printer } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function Settings() {
  const { user } = useAuth();

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">الإعدادات</h2>
          <p className="text-muted-foreground mt-1">تكوين النظام والطباعة واللغة</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              اللغة والمنطقة
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-background">
              <div>
                <p className="font-bold">لغة النظام (الفرع)</p>
                <p className="text-sm text-muted-foreground">تحديد لغة واجهة العملاء ونقاط البيع</p>
              </div>
              <div className="flex gap-2">
                <Button variant="default">العربية</Button>
                <Button variant="outline" disabled>English</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Printer className="h-5 w-5 text-primary" />
              إعدادات الطباعة
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-background">
              <div>
                <p className="font-bold">طابعة الكاشير</p>
                <p className="text-sm text-muted-foreground">غير متصلة حالياً</p>
              </div>
              <Button variant="outline">إعداد</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
