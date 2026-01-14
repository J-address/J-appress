type DecorativeBirdProps = {
  svgClassName: string;
};

function DecorativeBird({ svgClassName }: DecorativeBirdProps) {
  return (
    <div className="pointer-events-none flex h-10 w-10 items-center justify-center rounded-full bg-white/1 text-black">
      <svg viewBox="0 0 256 128" className={svgClassName} aria-hidden="true">
        <path
          d="M10 86 C46 22 102 14 128 56 C156 60 206 18 246 86"
          fill="none"
          stroke="currentColor"
          strokeWidth="20"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

const birds = [
  { id: "bird-1", svgClassName: "h-20 w-14" },
  { id: "bird-2", svgClassName: "h-10 w-14" },
  { id: "bird-3", svgClassName: "h-10 w-14" },
] as const;

const extraBirds = [
  { id: "bird-4", svgClassName: "h-10 w-14" },
  { id: "bird-5", svgClassName: "h-10 w-14" },
] as const;

export default function DecorativeBirds() {
  return (
    <div className="absolute top-0 left-[65%] z-10 flex -translate-x-1/2 pt-6 sm:pt-8">
      <div className="relative flex flex-col items-center gap-0.5 sm:gap-1">
        {birds.map((bird, index) => {
          const offsetClass =
            index === 0
              ? "translate-x-26 translate-y-9"
              : index === 2
                ? "translate-x-16"
                : "";
          return (
            <div key={bird.id} className={offsetClass}>
              <div
                className={
                  index === 1
                    ? "-translate-y-16 scale-40"
                    : index === 2
                      ? "scale-90"
                      : ""
                }
              >
                <DecorativeBird svgClassName={bird.svgClassName} />
              </div>
            </div>
          );
        })}
        {extraBirds.map((bird, index) => {
          const extraClass =
            index === 0
              ? "absolute left-full top-0 translate-x-50"
              : "absolute left-full top-16 translate-x-25";
          return (
            <div key={bird.id} className={extraClass}>
              <div className={index === 0 ? "scale-55" : ""}>
                <DecorativeBird svgClassName={bird.svgClassName} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
