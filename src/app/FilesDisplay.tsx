"use client";

import {
  ContextMenuContent,
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuItem,
  ContextMenuSubTrigger,
  ContextMenuSub,
  ContextMenuSubContent,
} from "@/components/ui/context-menu";
import { Skeleton } from "@/components/ui/skeleton";
import type { CardFile, Directory } from "@/server/api/routers/files";
import { api } from "@/trpc/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function FilesDisplay() {
  const { error, isLoading, data } = api.files.getAll.useQuery();

  if (error) {
    return <h1>Ooops!</h1>;
  }

  return (
    <div className="flex min-w-150 flex-col gap-3">
      {isLoading || data === undefined ? (
        <Skeleton className="h-[50dvh] w-full rounded bg-gray-500 p-10" />
      ) : (
        <div className="w-full rounded bg-gray-600/30 p-10">
          <FileView dir={{ ...data, isCollabsed: false }} className="w-full" />
        </div>
      )}
    </div>
  );
}

function FileView(props: {
  dir: (Directory & { isCollabsed: boolean }) | CardFile;
  depth?: number;
  isNested?: boolean;
  className?: string;
}) {
  const [isCollabsed, setIsCollabsed] = useState<boolean | null>(
    props.dir.fileType === "directory" ? props.dir.isCollabsed : null,
  );

  const apiUtils = api.useUtils();
  const deleteMutation = api.files.removeById.useMutation({
    onSuccess: async () => {
      await apiUtils.files.getAll.invalidate();
    },
  });
  const addMutation = api.files.addToDirectoryWithId.useMutation({
    onSuccess: async () => {
      await apiUtils.files.getAll.invalidate();
    },
  });

  useEffect(() => {
    if (deleteMutation?.error) {
      toast.error("Ooops!", {
        description: deleteMutation.error.message,
        position: "top-center",
      });
    }
  }, [deleteMutation?.error]);

  useEffect(() => {
    if (addMutation?.error && addMutation.error.data?.code === "BAD_REQUEST") {
      const err = addMutation.error.data.zodError?.fieldErrors.name;

      if (!err) {
        toast.error("Unknown error", {
          description: "Please contact admin!",
          position: "top-center",
        });
        console.error(addMutation.error);
        return;
      }

      toast.error("Ooops!", {
        description: err[0],
        position: "top-center",
      });
    }
  }, [addMutation?.error]);

  const addFile = async (
    fileType: (Directory | CardFile)["fileType"],
    directory: Directory,
  ) => {
    await addMutation.mutateAsync({
      fileType: fileType,
      id: directory.id,
      name: prompt("Enter name...", "here")!,
    });
  };

  return (
    <div className={`flex flex-col ${props.className}`}>
      <ContextMenu>
        <ContextMenuTrigger>
          <button
            className="relative flex items-center gap-3"
            style={{ marginLeft: (props.depth ?? 0) * 20 }}
            onClick={() => setIsCollabsed(!isCollabsed)}
          >
            <span className="flex">
              {props.dir.fileType === "directory" ? (
                <div
                  className={`flex w-5 items-center justify-center ${props.isNested ? "" : "absolute -left-5"}`}
                >
                  <span
                    className={` ${
                      isCollabsed
                        ? "icon-[mingcute--right-small-fill]"
                        : "icon-[mingcute--down-small-fill]"
                    } text-xl text-white`}
                  />
                </div>
              ) : (props.isNested ?? false) ? (
                <span className="icon-[iconamoon--arrow-bottom-left-2-bold] text-md aspect-square w-5 text-white" />
              ) : (
                <></>
              )}

              <span
                className={`w-5 ${props.dir.fileType === "directory" ? "icon-[mingcute--folder-fill]" : "icon-[mingcute--rectangle-fill]"} aspect-square text-xl ${props.dir.fileType === "directory" ? "text-white" : "rotate-5 text-blue-400"}`}
              />
            </span>

            <h2>{props.dir.name}</h2>
            {props.dir.fileType === "cards" && (
              <p>
                ({props.dir.cards.length}{" "}
                {`card${props.dir.cards.length === 1 ? "" : "s"}`})
              </p>
            )}
          </button>
        </ContextMenuTrigger>
        <ContextMenuContent className="px-5 py-3">
          {props.dir.fileType === "directory" && (
            <>
              <ContextMenuSub>
                <ContextMenuSubTrigger>Add</ContextMenuSubTrigger>
                <ContextMenuSubContent>
                  <ContextMenuItem
                    className="flex items-center gap-2"
                    onClick={async () =>
                      await addFile("directory", props.dir as Directory)
                    }
                  >
                    <span className="icon-[mingcute--folder-fill] aspect-square text-xl text-white" />
                    Directory
                  </ContextMenuItem>
                  <ContextMenuItem
                    className="flex items-center gap-2"
                    onClick={async () =>
                      await addFile("cards", props.dir as Directory)
                    }
                  >
                    <span className="icon-[mingcute--rectangle-fill] aspect-square rotate-5 text-xl text-blue-400" />
                    Cards
                  </ContextMenuItem>
                </ContextMenuSubContent>
              </ContextMenuSub>
            </>
          )}
          <ContextMenuItem
            className="flex items-center gap-2"
            onClick={async () => {
              await deleteMutation.mutateAsync({ id: props.dir.id });
            }}
          >
            <span className="icon-[mingcute--delete-fill] text-xl text-red-500" />
            Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      {props.dir.fileType === "directory" && !isCollabsed && (
        <div className="flex flex-col">
          {props.dir.children.map((child) => (
            <div className="flex" key={child.id}>
              <FileView
                dir={
                  child.fileType === "directory"
                    ? { ...child, isCollabsed: true }
                    : child
                }
                depth={(props.depth ?? 0) + 1}
                isNested={true}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
