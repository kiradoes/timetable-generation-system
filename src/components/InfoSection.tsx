import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Calendar, Users, CheckCircle, Clock } from 'lucide-react';

export function InfoSection() {
  const features = [
    {
      icon: Calendar,
      title: 'Smart Scheduling',
      description: 'Automated conflict detection ensures no overlapping classes',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      icon: Users,
      title: 'Multi-Role Access',
      description: 'Separate portals for students, lecturers, and officers',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      icon: CheckCircle,
      title: 'Course Management',
      description: 'Comprehensive course and venue allocation system',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      icon: Clock,
      title: 'Real-Time Updates',
      description: 'Instant notifications for schedule changes and updates',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <div className="bg-white py-12 border-t border-slate-200">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-[#0f2044] mb-3">
            Why Choose Our System?
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            A comprehensive, computer-aided solution designed to streamline academic scheduling 
            and enhance the educational experience at Babcock University.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="border-none shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className={`${feature.bgColor} rounded-full w-12 h-12 flex items-center justify-center mb-4`}>
                    <Icon className={`size-6 ${feature.color}`} />
                  </div>
                  <h3 className="font-semibold text-[#0f2044] mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-slate-600">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}