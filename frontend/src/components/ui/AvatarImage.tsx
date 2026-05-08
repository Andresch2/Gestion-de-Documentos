import { usersApi } from '@/api/users.api';
import { useEffect, useState } from 'react';

interface AvatarImageProps {
    userId?: string;
    avatarUrl?: string | null;
    alt?: string;
    className?: string;
}

export function AvatarImage({
    userId,
    avatarUrl,
    alt = 'Avatar',
    className,
}: AvatarImageProps) {
    const [objectUrl, setObjectUrl] = useState<string | null>(null);

    useEffect(() => {
        let active = true;
        let nextObjectUrl: string | null = null;

        setObjectUrl(null);

        if (!userId || !avatarUrl) return undefined;

        usersApi.getAvatar(userId)
            .then(({ data }) => {
                if (!active) return;
                nextObjectUrl = URL.createObjectURL(data);
                setObjectUrl(nextObjectUrl);
            })
            .catch(() => {
                if (active) setObjectUrl(null);
            });

        return () => {
            active = false;
            if (nextObjectUrl) {
                URL.revokeObjectURL(nextObjectUrl);
            }
        };
    }, [userId, avatarUrl]);

    if (!objectUrl) return null;

    return <img src={objectUrl} alt={alt} className={className} />;
}
