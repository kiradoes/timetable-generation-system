import { Card, CardContent } from './ui/card';

export function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  iconColor = 'text-[#ffb71b]',
  iconBgColor = 'bg-[#ffb71b]/10',
  trend 
}) {
  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow border-t-2 border-t-[#ffb71b]">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-600 mb-1">{title}</p>
            <h3 className="text-3xl font-bold text-[#0f2044] mb-2">{value}</h3>
            {trend && (
              <p className={`text-sm ${trend.positive ? 'text-green-600' : 'text-red-600'}`}>
                {trend.positive ? '↑' : '↓'} {trend.value}
              </p>
            )}
          </div>
          <div className={`${iconBgColor} rounded-full p-3`}>
            <Icon className={`size-6 ${iconColor}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}