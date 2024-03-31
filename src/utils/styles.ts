import { twMerge } from "tailwind-merge";

export function clsxm(...classes: string[]) {
  return twMerge(classes);
}
