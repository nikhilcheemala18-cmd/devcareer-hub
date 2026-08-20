import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { buttonClasses } from "@/lib/styles";

export default function NotFound() {
  return (
    <Container className="flex flex-col items-center gap-4 py-24 text-center">
      <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">404</p>
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
        Page not found
      </h1>
      <p className="max-w-md text-zinc-600 dark:text-zinc-400">
        The page you&apos;re looking for doesn&apos;t exist, or the content is no longer
        published.
      </p>
      <Link href="/" className={buttonClasses("primary")}>
        Back to Home
      </Link>
    </Container>
  );
}
