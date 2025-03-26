import { JSX } from "preact";
import { IS_BROWSER } from "$fresh/runtime.ts";

export function Button(props: JSX.HTMLAttributes<HTMLAnchorElement>) {
  return (
    <a
      {...props}
      class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
    />
  );
}
