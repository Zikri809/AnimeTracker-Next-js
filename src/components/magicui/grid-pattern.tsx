import { useId, useMemo } from "react";
import type { SVGProps } from "react";

import { cn } from "@/lib/utils";

interface GridPatternProps extends SVGProps<SVGSVGElement> {
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  strokeDasharray?: string;
  squares?: Array<[number, number]>;
}

export function GridPattern({
  width = 40,
  height = 40,
  x = -1,
  y = -1,
  strokeDasharray = "0",
  squares,
  className,
  ...props
}: GridPatternProps) {
  const id = useId();

  const uniqueSquares = useMemo(() => {
    if (!squares) return [];
    const seen = new Set<string>();
    return squares.filter(([sX, sY]) => {
      const key = `${sX}-${sY}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [squares]);

  return (
    <svg
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 h-full w-full fill-gray-400/30 stroke-gray-400/30",
        className
      )}
      {...props}
    >
      <defs>
        <pattern
          id={id}
          width={width}
          height={height}
          patternUnits="userSpaceOnUse"
          x={x}
          y={y}
        >
          <path d={`M.5 ${height}V.5H${width}`} fill="none" strokeDasharray={strokeDasharray} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" strokeWidth={0} fill={`url(#${id})`} />
      {uniqueSquares.length > 0 && (
        <svg x={x} y={y} className="overflow-visible">
          {uniqueSquares.map(([squareX, squareY]) => (
            <rect
              strokeWidth="0"
              key={`${squareX}-${squareY}`}
              width={width - 1}
              height={height - 1}
              x={squareX * width + 1}
              y={squareY * height + 1}
            />
          ))}
        </svg>
      )}
    </svg>
  );
}
