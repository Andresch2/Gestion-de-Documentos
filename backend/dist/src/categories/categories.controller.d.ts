import { CategoriesService } from './categories.service';
export declare class CreateCategoryDto {
    name: string;
    color?: string;
    icon?: string;
}
export declare class UpdateCategoryDto {
    name?: string;
    color?: string;
    icon?: string;
}
export declare class CategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    findAll(userId: string): Promise<({
        _count: {
            documents: number;
        };
    } & {
        id: string;
        createdAt: Date;
        userId: string;
        name: string;
        color: string;
        icon: string;
        isDefault: boolean;
    })[]>;
    create(userId: string, dto: CreateCategoryDto): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        name: string;
        color: string;
        icon: string;
        isDefault: boolean;
    }>;
    update(id: string, userId: string, dto: UpdateCategoryDto): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        name: string;
        color: string;
        icon: string;
        isDefault: boolean;
    }>;
    delete(id: string, userId: string): Promise<{
        message: string;
    }>;
}
