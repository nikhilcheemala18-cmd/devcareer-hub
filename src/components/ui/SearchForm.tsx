import { buttonClasses, inputClasses, cn } from "@/lib/styles";

/** Plain GET form to /search — works without JavaScript and needs no client component. */
export function SearchForm({
  defaultValue = "",
  size = "md",
}: {
  defaultValue?: string;
  size?: "md" | "lg";
}) {
  return (
    <form action="/search" method="get" role="search" className="flex w-full max-w-xl gap-2">
      <label htmlFor="search-q" className="sr-only">
        Search jobs, articles, and guides
      </label>
      <input
        id="search-q"
        type="search"
        name="q"
        defaultValue={defaultValue}
        placeholder="Search jobs, articles, interview questions..."
        className={cn(inputClasses, size === "lg" && "py-3 text-base")}
      />
      <button type="submit" className={buttonClasses("primary")}>
        Search
      </button>
    </form>
  );
}
