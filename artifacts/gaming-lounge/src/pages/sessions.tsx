import { useListActiveSessions, usePauseSession, useResumeSession, useEndSession, getListActiveSessionsQueryKey, getListAssetsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gamepad2, Clock, Pause, Play, SquareSquare, Receipt } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Link } from "wouter";

export default function Sessions() {
  const queryClient = useQueryClient();
  const { data: sessions, isLoading } = useListActiveSessions({
    query: { refetchInterval: 8000 }
  });

  const pauseSession = usePauseSession();
  const resumeSession = useResumeSession();
  const endSession = useEndSession();

  const handleAction = async (action: 'pause' | 'resume' | 'end', sessionId: number) => {
    try {
      if (action === 'pause') await pauseSession.mutateAsync({ sessionId });
      if (action === 'resume') await resumeSession.mutateAsync({ sessionId });
      if (action === 'end') await endSession.mutateAsync({ sessionId });
      
      toast.success("تم تحديث حالة الجلسة");
      queryClient.invalidateQueries({ queryKey: getListActiveSessionsQueryKey() });
      if (action === 'end') {
        queryClient.invalidateQueries({ queryKey: getListAssetsQueryKey() });
      }
    } catch (error) {
      toast.error("حدث خطأ");
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">الجلسات النشطة</h2>
          <p className="text-muted-foreground mt-1">إدارة الجلسات الحالية والتكلفة</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sessions?.length === 0 ? (
          <div className="col-span-full py-12 text-center text-muted-foreground bg-card rounded-lg border border-border">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-bold mb-2">لا توجد جلسات نشطة حالياً</h3>
            <p>يمكنك بدء جلسة جديدة من شاشة الأجهزة</p>
            <Link href="/assets">
              <Button className="mt-4">الذهاب للأجهزة</Button>
            </Link>
          </div>
        ) : (
          sessions?.map((session) => {
            const isPaused = session.status === "paused";
            
            return (
              <Card 
                key={session.id} 
                className={`relative overflow-hidden border-l-4 ${
                  isPaused ? 'border-l-amber-500' : 'border-l-primary'
                }`}
              >
                <CardHeader className="pb-3 border-b border-border/50">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-secondary rounded-md">
                        <Gamepad2 className="h-6 w-6 text-foreground" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{session.assetNameAr || session.assetName}</CardTitle>
                        <div className="flex items-center gap-1 text-xs font-medium mt-1">
                          <span className={isPaused ? "text-amber-500" : "text-emerald-500"}>
                            {isPaused ? "متوقفة مؤقتاً" : "قيد اللعب"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-4 pb-0 space-y-4">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">الوقت المنقضي</p>
                      <p className="text-2xl font-mono font-bold tracking-tight">
                        {Math.floor(session.currentMinutes / 60).toString().padStart(2, '0')}:
                        {(session.currentMinutes % 60).toString().padStart(2, '0')}
                      </p>
                    </div>
                    <div className="text-left">
                      <p className="text-sm text-muted-foreground mb-1">التكلفة الحالية</p>
                      <p className="text-2xl font-bold text-emerald-500">
                        {session.currentCost.toFixed(2)}
                        <span className="text-sm text-emerald-500/70 ml-1">ج.م</span>
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 pb-4">
                    {isPaused ? (
                      <Button 
                        variant="default" 
                        className="h-14 font-bold text-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg"
                        onClick={() => handleAction('resume', session.id)}
                        disabled={resumeSession.isPending}
                      >
                        <Play className="mr-2 h-5 w-5" />
                        إستئناف
                      </Button>
                    ) : (
                      <Button 
                        variant="secondary" 
                        className="h-14 font-bold text-lg border border-amber-500/30 text-amber-500 hover:bg-amber-500/10 shadow-lg"
                        onClick={() => handleAction('pause', session.id)}
                        disabled={pauseSession.isPending}
                      >
                        <Pause className="mr-2 h-5 w-5" />
                        إيقاف مؤقت
                      </Button>
                    )}
                    
                    <Button 
                      variant="destructive" 
                      className="h-14 font-bold text-lg shadow-lg"
                      onClick={() => handleAction('end', session.id)}
                      disabled={endSession.isPending}
                    >
                      <SquareSquare className="mr-2 h-5 w-5" />
                      إنهاء وحساب
                    </Button>
                    
                    <Link href={`/sessions/${session.id}`} className="col-span-2">
                      <Button variant="outline" className="w-full h-12">
                        <Receipt className="mr-2 h-4 w-4" />
                        تفاصيل الجلسة والطلبات
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
