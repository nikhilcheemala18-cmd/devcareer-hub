/**
 * Renders a JSON-LD `<script>` tag, following Next.js's own recommended
 * pattern (docs: app/guides/json-ld). dangerouslySetInnerHTML is the only
 * way to put literal JSON text inside a `<script>` tag; the `<` escape
 * prevents a `</script>` sequence inside a string value from breaking out.
 */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
