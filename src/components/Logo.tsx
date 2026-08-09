const CELL = 20;
const PAD = 0.6;
const GRID = [
  [0, 0, 0, 0, 0, 1, 1, 0, 0],
  [0, 0, 0, 0, 1, 1, 0, 0, 0],
  [0, 1, 0, 0, 0, 0, 0, 1, 0],
  [0, 1, 0, 0, 0, 0, 0, 1, 0],
  [0, 1, 0, 0, 0, 0, 0, 1, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 0],
];
const DOMINO_A = new Set(["0,5", "0,6"]);
const DOMINO_B = new Set(["1,4", "1,5"]);

type LogoProps = {
  width: number;
  className?: string;
};

export const Logo = ({ width, className }: LogoProps) => {
  const height = (width * 2) / 3;
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 180 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      shapeRendering="crispEdges"
      className={className}
      aria-label="boxed.ink"
    >
      {GRID.map((row, ri) =>
        row.map((on, ci) => {
          if (!on) return null;
          const key = `${ri},${ci}`;
          const fill = DOMINO_A.has(key)
            ? "#2fbf71"
            : DOMINO_B.has(key)
              ? "#f5a244"
              : "currentColor";
          return (
            <rect
              key={key}
              x={ci * CELL - PAD}
              y={ri * CELL - PAD}
              width={CELL + PAD * 2}
              height={CELL + PAD * 2}
              fill={fill}
            />
          );
        }),
      )}
    </svg>
  );
};
