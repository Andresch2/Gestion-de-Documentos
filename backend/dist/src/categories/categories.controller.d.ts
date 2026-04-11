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
        name: string;
        id: string;
        userId: string;
        createdAt: Date;
        color: string;
        icon: string;
        isDefault: boolean;
    })[]>;
    create(userId: string, dto: CreateCategoryDto): Promise<{
        name: string;
        id: string;
        userId: string;
        createdAt: Date;
        color: string;
        icon: string;
        isDefault: boolean;
    }>;
    update(id: string, userId: string, dto: UpdateCategoryDto): Promise<{
        name: string;
        id: string;
        userId: string;
        createdAt: Date;
        color: string;
        icon: string;
        isDefault: boolean;
    }>;
    delete(id: string, userId: string): Promise<{
        message: string;
    }>;
}
