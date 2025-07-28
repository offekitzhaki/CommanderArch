import CommandClient from '@/components/CommandClient';
import { initialCommandData } from '@/lib/data';
import { Category } from '@/lib/types';

// This function now provides the fallback data for logged-out users.
function getInitialCommandsForGuest(): Category[] {
  // The data structure for guests needs to align with the new Category type,
  // even if it's just mock data.
  const commandsWithIds: Category[] = initialCommandData.map(category => ({
      id: crypto.randomUUID(),
      name: category.name,
      user_id: 'guest',
      commands: category.commands.map(command => ({
          ...command,
          id: crypto.randomUUID(),
          category_id: 'guest-category',
          user_id: 'guest',
      })),
  }));
  return commandsWithIds;
}

export default async function HomePage() {
  const guestCommands = getInitialCommandsForGuest();
  // The CommandClient component is now responsible for fetching user-specific
  // data from Supabase on the client side if a user is logged in.
  return <CommandClient guestCommands={guestCommands} />;
}
