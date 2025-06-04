import { HydrateClient } from "@/trpc/server";
import { FilesDisplay } from "./FilesDisplay";
import { CardDisplay } from "./_card-display/CardDisplay";

export default async function Home() {
  return (
    <HydrateClient>
      <main className="flex h-[90dvh] items-center justify-center gap-12 px-4 py-16">
        <FilesDisplay />
        <CardDisplay />
      </main>
    </HydrateClient>
  );
}
