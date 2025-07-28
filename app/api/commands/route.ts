
import { NextResponse } from 'next/server';
import { initialCommandData } from '@/lib/data';
import { Category } from '@/lib/types';

export async function GET() {
    // In the future, this would fetch from a database like Supabase.
    // For now, it returns the static data with dynamically generated IDs
    // that matches the structure for a guest user.
    const commandsWithIds: Category[] = initialCommandData.map(category => {
        const categoryId = crypto.randomUUID();
        return {
            id: categoryId,
            name: category.name,
            user_id: 'guest', // Using a placeholder for guest/initial data
            commands: category.commands.map(command => ({
                ...command,
                id: crypto.randomUUID(),
                user_id: 'guest',
                category_id: categoryId,
            })),
        };
    });

    return NextResponse.json(commandsWithIds);
}
