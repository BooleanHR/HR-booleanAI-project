import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card";
  import { verifications } from "@/lib/mock-data";
  
  type StatCardData = {
    title: string;
    value: string;
    description: string;
    colorClass: string;
  };
  
  export function StatsCards() {
    const totalCount = 1245;
    const completedCount = 1130;
    const needsReviewCount = 115;
    const manualQueueCount = 12;
  
    const stats: StatCardData[] = [
      { 
        title: "총 검증 서류", 
        value: totalCount.toLocaleString(), 
        description: "전체 검증 요청 건수",
        colorClass: "text-primary" 
      },
      { 
        title: "검증 완료", 
        value: completedCount.toLocaleString(),
        description: "성공적으로 검증된 서류",
        colorClass: "text-success" 
      },
      { 
        title: "확인 필요", 
        value: needsReviewCount.toLocaleString(),
        description: "불일치/오류로 인한 확인 필요",
        colorClass: "text-destructive" 
      },
      { 
        title: "수동 검토 큐", 
        value: manualQueueCount.toLocaleString(),
        description: "AI 신뢰도 저하로 인한 수동 검토",
        colorClass: "text-warning"
      },
    ];
  
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stat.colorClass}`}>{stat.value}</div>
              <p className="text-xs text-muted-foreground pt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }