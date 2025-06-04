import type { Prettify, UnionToTuple } from "@/lib/custom-utility-types";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { randomUUID, type UUID } from "node:crypto";
import { z } from "zod";

export const filesRouter = createTRPCRouter({
  getAll: publicProcedure.query(() => {
    return RootDirectory;
  }),

  removeById: publicProcedure
    .input(
      z.object({
        id: z
          .string()
          .uuid()
          .transform((id) => id as UUID),
      }),
    )
    .mutation(async ({ input }) => {
      if (input.id === RootDirectory.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot remove root directory!",
        });
      }

      for (const child of RootDirectory.children) {
        doForAll(child, RootDirectory, (current, parent) => {
          if (current.id === input.id) {
            const idx = parent.children.findIndex((c) => c.id === input.id);
            parent.children.splice(idx, 1);
          }
        });
      }
    }),

  addToDirectoryWithId: publicProcedure
    .input(
      z.object({
        id: z
          .string()
          .uuid()
          .transform((id) => id as UUID),
        fileType: z.enum(["cards", "directory"]),
        name: z
          .string()
          .nonempty("Please provide a non-empty name.")
          .max(255, "Name length cannot exceed 255 characters.")
          .regex(
            /^[a-zA-Z0-9\-_\(\)\ ]+$/,
            "Name must only include letters, numbers, dashes, underscoers, and parentheses.",
          ),
      }),
    )
    .mutation(({ input }) => {
      const res = doFor(RootDirectory, input.id, (element, parent) => {
        const dir = element.fileType === "directory" ? element : parent!;
        dir.children.push(
          input.fileType === "cards"
            ? {
                fileType: "cards",
                id: randomUUID(),
                name: input.name,
                cards: [],
              }
            : {
                fileType: "directory",
                id: randomUUID(),
                name: input.name,
                children: [],
              },
        );
      });

      if (res === "not found") {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
    }),
});

function doFor<T>(
  root: Directory,
  id: Id,
  action: (element: Directory | CardFile, parent: Directory | null) => T,
): T | "not found" {
  if (root.id === id) {
    return action(root, null);
  }

  for (const child of root.children) {
    if (child.id === id) {
      return action(child, root);
    }

    if (child.fileType === "directory") {
      const res = doFor(child, id, action);
      if (res !== "not found") {
        return res;
      }
    }
  }

  return "not found";
}

function doForAll(
  current: Directory | CardFile,
  parent: Directory,
  action: (val: Directory | CardFile, parent: Directory) => void,
) {
  action(current, parent);

  if (current.fileType === "cards") {
    return;
  }

  for (const child of current.children) {
    doForAll(child, current, action);
  }
}

export type Id = UUID;

export const DIRECTORY_FILE_TYPE = "directory";
export type Directory = Prettify<{
  id: Id;
  fileType: typeof DIRECTORY_FILE_TYPE;
  name: string;
  children: File[];
}>;

export const CARDS_FILE_TYPE = "cards";
export type CardFile = {
  id: Id;
  fileType: typeof CARDS_FILE_TYPE;
  name: string;
  cards: Card[];
};

export type File = Prettify<Directory | CardFile>;
export type FileType = File["fileType"];
type FileTypeTupleType = UnionToTuple<FileType>;

export const FILE_TYEPS: FileTypeTupleType = [
  CARDS_FILE_TYPE,
  DIRECTORY_FILE_TYPE,
] as const;

export type Card = {
  id: Id;
  front: string;
  back: string;
};

export type CardProgress = {
  id: Id;
  card: Card;
  side: "front" | "back";
};

export const RootDirectory = {
  id: randomUUID(),
  fileType: "directory",
  name: "root",
  children: [
    {
      id: randomUUID(),
      fileType: "directory",
      name: "Schule",
      children: [
        {
          id: randomUUID(),
          fileType: "cards",
          name: "RW Test am 3.6.2025",
          cards: [
            {
              id: randomUUID(),
              front: "Imparitätischer Realisationsprinzip",
              back: "Nicht-realisierte Gewinne sind NIE in der Bilanz auszuweisen, nicht-realisierte Verluste sind in der Bilanz IMMER auszuweisen.",
            },
            {
              id: randomUUID(),
              front: "Anhang",
              back: "Um ein möglichst getreues Bild über Finanz-, Vermögens- und Ertragslage des Unternehmenslage zu verschaffen, werden im Anhang viele Details im Anhang angehängt.",
            },
          ],
        },
        {
          id: randomUUID(),
          fileType: "cards",
          name: "TypeScript",
          cards: [
            {
              id: randomUUID(),
              front:
                "Wie heißt der Utility-Type, der jede Eigenschaft eines Objekts optional macht?",
              back: "Partail<T>",
            },
          ],
        },
      ],
    },
    {
      id: randomUUID(),
      fileType: "cards",
      name: "Kochen",
      cards: [
        {
          id: randomUUID(),
          front: "Wo kocht man Wasser?",
          back: "Am Herd! Wo denn sonst?",
        },
      ],
    },
    {
      id: randomUUID(),
      fileType: "directory",
      name: "Allgemeinwissen",
      children: [
        {
          id: randomUUID(),
          fileType: "cards",
          name: "Bücher",
          cards: [
            {
              id: randomUUID(),
              front: "Karpowicz",
              back: "- 1984\n- Fahrenheit Irgendwas",
            },
          ],
        },
        {
          id: randomUUID(),
          fileType: "directory",
          name: "Natur",
          children: [
            {
              id: randomUUID(),
              fileType: "cards",
              name: "Tiere",
              cards: [],
            },
            {
              id: randomUUID(),
              fileType: "directory",
              name: "Pflanzen",
              children: [
                {
                  id: randomUUID(),
                  fileType: "cards",
                  name: "Gräser",
                  cards: [],
                },
                {
                  id: randomUUID(),
                  fileType: "cards",
                  name: "Früchte",
                  cards: [],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
} as Directory;
