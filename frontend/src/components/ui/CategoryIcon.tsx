import * as Icons from 'lucide-react';
import { LucideProps } from 'lucide-react';

interface CategoryIconProps extends LucideProps {
    name: string;
}

export function CategoryIcon({ name, ...props }: CategoryIconProps) {
    // Dynamic import look-up
    const Icon = (Icons as any)[name] || Icons.Folder;
    
    return <Icon {...props} />;
}
