import React from 'react';

interface UserAvatarProps {
    imageUrl?: string;
    initials: string;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-32 h-32 text-3xl',
};

const UserAvatar: React.FC<UserAvatarProps> = ({
    imageUrl,
    initials,
    size = 'md',
    className = '',
}) => {
    const [imgError, setImgError] = React.useState(false);

    const showFallback = !imageUrl || imgError;

    if (showFallback) {
        return (
            <div
                className={`${sizeClasses[size]} rounded-xl flex items-center justify-center bg-gradient-to-br from-indigo-500 to-indigo-700 text-white font-black select-none ${className}`}
            >
                {initials}
            </div>
        );
    }

    return (
        <img
            src={imageUrl}
            alt="Avatar"
            className={`${sizeClasses[size]} rounded-xl object-cover ${className}`}
            onError={() => setImgError(true)}
        />
    );
};

export default UserAvatar;
