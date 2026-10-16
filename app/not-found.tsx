import Link from "next/link";
import { ProsePage } from "@/components/prose-page";

export default function NotFound() {
  return (
    <ProsePage eyebrow="404" title="This page took a break.">
      <p>We couldn&apos;t find that page. It may have moved, or the link might be mistyped.</p>
      <p>
        <Link href="/">Build a break</Link> or <Link href="/routines">browse routines</Link>.
      </p>
    </ProsePage>
  );
}
