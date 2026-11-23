import { MountainSnow } from "lucide-react";

export function CatalogMedia({ src, className }: { src?: string; className: string }) {
  return (
    <div className={`relative isolate overflow-hidden ${className}`}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="size-full object-cover" />
      ) : (
        <>
          <div aria-hidden className="absolute top-[16%] right-[15%] aspect-square h-[27%] rounded-full bg-hairline" />
          <div aria-hidden className="absolute -inset-x-15 -bottom-1/2 h-full rounded-[50%] bg-canvas-subtle" />
          <div className="absolute inset-0 grid place-items-center">
            <MountainSnow aria-hidden className="size-1/3 max-w-32" strokeWidth={1.25} />
          </div>
        </>
      )}
    </div>
  );
}
