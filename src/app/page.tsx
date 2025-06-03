import { HydrateClient } from "@/trpc/server";
import { FilesDisplay } from "./FilesDisplay";

export default async function Home() {
  return (
    <HydrateClient>
      <main className="flex flex-col items-center justify-center gap-12 px-4 py-16">
        <FilesDisplay />
      </main>
    </HydrateClient>
  );
}
