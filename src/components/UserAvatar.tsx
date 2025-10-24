import { User } from 'lucide-react';

interface UserAvatarProps {
  username: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function UserAvatar({ username, size = 'md' }: UserAvatarProps) {
  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-orange-500',
    'bg-teal-500',
    'bg-red-500',
    'bg-cyan-500'
  ];

  const getColorFromUsername = (name: string) => {
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <div
      className={`${sizeClasses[size]} ${getColorFromUsername(username)} rounded-full flex items-center justify-center`}
    >
      <User className={`${iconSizes[size]} text-white`} />
    </div>
  );
}
