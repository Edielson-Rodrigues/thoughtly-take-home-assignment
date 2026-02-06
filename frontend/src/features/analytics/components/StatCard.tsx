import { Card, CardContent } from '../../../components/ui';

export function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-full text-blue-600">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}
