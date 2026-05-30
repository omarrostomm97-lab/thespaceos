import { useState } from "react";
import { useListAssets, useStartSession, getListAssetsQueryKey, getListActiveSessionsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gamepad2, Tv, Trophy, Play } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Link, useLocation } from "wouter";

export default function Assets() {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const { data: assets, isLoading } = useListAssets();
  const startSession = useStartSession();

  const handleStartSession = async (assetId: number) => {
    try {
      const session = await startSession.mutateAsync({ data: { assetId } });
      toast.success("تم بدء الجلسة بنجاح");
      queryClient.invalidateQueries({ queryKey: getListAssetsQueryKey() });
      queryClient.invalidateQueries({ queryKey: getListActiveSessionsQueryKey() });
      setLocation(`/sessions/${session.id}`);
    } catch (error) {
      toast.error("حدث خطأ أثناء بدء الجلسة");
    }
  };

  const getAssetIcon = (type: string) => {
    switch(type) {
      case 'ps': return <Tv className="h-8 w-8" />;
      case 'billiard': return <Trophy className="h-8 w-8" />;
      default: return <Gamepad2 className="h-8 w-8" />;
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
          <h2 className="text-3xl font-bold tracking-tight text-primary">الأجهزة والجلسات</h2>
          <p className="text-muted-foreground mt-1">إدارة الأجهزة وبدء جلسات اللعب</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {assets?.map((asset) => {
          const isAvailable = asset.status === "available";
          
          return (
            <Card 
              key={asset.id} 
              className={`relative overflow-hidden border-2 transition-all ${
                isAvailable ? 'border-border hover:border-primary' : 'border-amber-500/50'
              }`}
            >
              <div className={`absolute top-0 right-0 w-2 h-full ${isAvailable ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className={`p-3 rounded-lg ${isAvailable ? 'bg-secondary text-foreground' : 'bg-amber-500/20 text-amber-500'}`}>
                    {getAssetIcon(asset.type)}
                  </div>
                  <div className={`px-2 py-1 text-xs font-bold rounded-md ${
                    isAvailable ? 'bg-emerald-500/20 text-emerald-500' : 'bg-amber-500/20 text-amber-500'
                  }`}>
                    {isAvailable ? 'متاح' : 'مشغول'}
                  </div>
                </div>
                <CardTitle className="mt-4 text-xl">{asset.nameAr || asset.name}</CardTitle>
              </CardHeader>
              
              <CardContent className="pb-4">
                <p className="text-sm font-medium text-muted-foreground">
                  <span className="text-foreground">{asset.pricePerHour}</span> ج.م / ساعة
                </p>
              </CardContent>
              
              <CardFooter className="pt-0">
                {isAvailable ? (
                  <Button 
                    className="w-full h-12 text-md font-bold" 
                    onClick={() => handleStartSession(asset.id)}
                    disabled={startSession.isPending}
                  >
                    <Play className="mr-2 h-5 w-5" />
                    بدء اللعب
                  </Button>
                ) : (
                  <Link href={`/sessions`} className="w-full">
                    <Button variant="outline" className="w-full h-12 text-md border-amber-500/50 text-amber-500 hover:bg-amber-500/10">
                      عرض الجلسة
                    </Button>
                  </Link>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
