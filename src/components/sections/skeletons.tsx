import { Skeleton } from "@/components/ui/skeleton";
import { Container, Section } from "@/components/ui/section";

/**
 * Placeholders for the three sections whose copy comes from the database.
 *
 * They hold the section's shape, not its detail: the same height, the same
 * grid, the same number of cards. A skeleton that reproduces every pill and
 * icon costs more to keep in step with the real section than it gives back,
 * and a block that is nearly the content is more unsettling to look at than
 * one that is obviously a placeholder.
 *
 * Each announces itself once rather than letting a screen reader walk a
 * field of empty divs, which is why every block inside is aria-hidden.
 */
function Loading({ what }: { what: string }) {
  return <span className="sr-only">Loading {what}…</span>;
}

export function HeroSkeleton() {
  return (
    <section
      aria-busy="true"
      className="relative flex min-h-screen flex-col justify-center overflow-hidden pb-16 pt-28 md:pt-32 lg:pb-14"
    >
      <Loading what="the hero" />
      <Container>
        <div className="grid items-center gap-14 lg:grid-cols-12 lg:gap-10">
          <div className="min-w-0 lg:col-span-7">
            <Skeleton className="h-3 w-40" />
            <div className="mt-6 flex flex-col gap-3">
              <Skeleton className="h-10 w-full max-w-lg sm:h-14" />
              <Skeleton className="h-10 w-4/5 max-w-md sm:h-14" />
            </div>
            <div className="mt-7 flex max-w-xl flex-col gap-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
            <div className="mt-9 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:gap-4">
              <Skeleton className="h-12 w-full rounded-full sm:w-48" />
              <Skeleton className="h-12 w-full rounded-full sm:w-40" />
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="glass-strong rounded-3xl p-6">
              <div className="flex items-center justify-between gap-3">
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
              {/* The live-tracking card's bar chart, at its real height. */}
              <div className="mt-7 flex h-40 items-end gap-2.5">
                {[38, 62, 46, 78, 58, 92, 70, 100].map((h) => (
                  <Skeleton
                    key={h}
                    className="flex-1 rounded-t-md"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
              <div className="mt-6 grid grid-cols-3 gap-3">
                <Skeleton className="h-12" />
                <Skeleton className="h-12" />
                <Skeleton className="h-12" />
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

export function ServicesSkeleton() {
  return (
    <div aria-busy="true">
      <Section>
        <Loading what="the services" />
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl flex-1">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="mt-4 h-8 w-full max-w-md sm:h-10" />
            <Skeleton className="mt-4 h-4 w-full max-w-lg" />
          </div>
          <Skeleton className="h-11 w-44 rounded-full" />
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:mt-14 lg:grid-cols-3 lg:gap-6">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-white/8 bg-white/[0.02] p-6 sm:p-7"
            >
              <Skeleton className="h-12 w-12 rounded-xl" />
              <Skeleton className="mt-6 h-5 w-28 rounded-full" />
              <Skeleton className="mt-3 h-6 w-3/4" />
              <Skeleton className="mt-3 h-4 w-full" />
              <Skeleton className="mt-2 h-4 w-5/6" />
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

export function ContactSkeleton() {
  return (
    <div aria-busy="true">
      <Section>
        <Loading what="the contact section" />
        <div className="max-w-2xl">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="mt-4 h-8 w-full max-w-md sm:h-10" />
        </div>

        <div className="mt-12 grid gap-12 lg:mt-14 lg:grid-cols-2 lg:gap-16">
          <div>
            <Skeleton className="h-3 w-28" />
            <Skeleton className="mt-4 h-7 w-3/4" />
            <Skeleton className="mt-3 h-4 w-full max-w-md" />
            <div className="mt-7 flex flex-col gap-3.5">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-5 w-full max-w-sm" />
              ))}
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 rounded-xl" />
              ))}
            </div>
          </div>

          <div className="glass rounded-3xl p-6 sm:p-8">
            <Skeleton className="h-3 w-24" />
            <div className="mt-6 flex flex-col gap-4">
              <Skeleton className="h-12 rounded-xl" />
              <Skeleton className="h-12 rounded-xl" />
              <Skeleton className="h-12 rounded-xl" />
            </div>
            <Skeleton className="mt-8 h-12 w-full rounded-full" />
          </div>
        </div>
      </Section>
    </div>
  );
}
