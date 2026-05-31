import { RefObject } from "react";

export default function overflow_detect(
  elementref: RefObject<HTMLElement | null | undefined>
): boolean {
  if (!elementref || !elementref.current) return false;
  const scrollHeight = elementref.current.scrollHeight;
  const offsetHeight = elementref.current.offsetHeight;

  console.log("scroll heigth ", scrollHeight, " offset heigth ", offsetHeight);
  return scrollHeight > offsetHeight;
}
