'use client';

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'blue' | 'green' | 'orange' | 'red' | 'purple' | 'gray';
  className?: string;
}

const colorVariants = {
  blue: {
    bg: 'bg-gradient-to-br from-blue-50 to-blue-100/50',
    icon: 'text-blue-600 bg-blue-100',
    accent: 'text-blue-600',
  },
  green: {
    bg: 'bg-gradient-to-br from-green-50 to-green-100/50',
    icon: 'text-green-600 bg-green-100',
    accent: 'text-green-600',
  },
  orange: {
    bg: 'bg-gradient-to-br from-orange-50 to-orange-100/50',
    icon: 'text-orange-600 bg-orange-100',
    accent: 'text-orange-600',
  },
  red: {
    bg: 'bg-gradient-to-br from-red-50 to-red-100/50',
    icon: 'text-red-600 bg-red-100',
    accent: 'text-red-600',
  },
  purple: {
    bg: 'bg-gradient-to-br from-purple-50 to-purple-100/50',
    icon: 'text-purple-600 bg-purple-100',
    accent: 'text-purple-600',
  },
  gray: {
    bg: 'bg-gradient-to-br from-gray-50 to-gray-100/50',
    icon: 'text-gray-600 bg-gray-100',
    accent: 'text-gray-600',
  },
};

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'blue',
  className,
}: StatCardProps) {
  const colors = colorVariants[color];

  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      if (val >= 1000000) {
        return `${(val / 1000000).toFixed(1)}M`;
      } else if (val >= 1000) {
        return `${(val / 1000).toFixed(1)}k`;
      }
      return val.toLocaleString('fr-FR');
    }
    return val;
  };

  return (
    <Card className={cn('border-0 shadow-lg hover:shadow-xl transition-all duration-200', colors.bg, className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-3xl font-bold text-gray-900">
                {formatValue(value)}
              </span>
              {trend && (
                <span
                  className={cn(
                    'text-sm font-medium',
                    trend.isPositive ? 'text-green-600' : 'text-red-500'
                  )}
                >
                  {trend.isPositive ? '+' : ''}{trend.value}%
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-gray-500">{subtitle}</p>
            )}
          </div>
          <div className={cn('p-3 rounded-lg', colors.icon)}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}