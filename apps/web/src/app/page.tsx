"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { client } from "@/utils/orpc";

const CATEGORIES = [
  "Buy Property",
  "Buy land to build homestay",
  "Buy Airbnb Profile",
  "Buy Airbnb Business",
] as const;

type Listing = Awaited<ReturnType<typeof client.buyHomestay.list>>[number];

const money = (value: string | number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(Number(value));

export default function Home() {
  const session = authClient.useSession();
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>(CATEGORIES[0]);
  const [whatsapp, setWhatsapp] = useState("");
  const [description, setDescription] = useState("");
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loadingListings, setLoadingListings] = useState(true);

  async function loadListings() {
    setLoadingListings(true);
    try {
      const result = await client.buyHomestay.list();
      setListings(result);
    } catch {
      setNotice("Could not load listings. Please try again.");
    } finally {
      setLoadingListings(false);
    }
  }

  useEffect(() => {
    void loadListings();
  }, []);

  async function submitListing(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("");

    if (!session.data?.user) {
      setNotice("Please sign in before submitting a listing.");
      return;
    }

    setSubmitting(true);
    try {
      await client.buyHomestay.create({
        title,
        price: Number(price),
        location,
        category,
        whatsapp,
        description,
      });

      setTitle("");
      setPrice("");
      setLocation("");
      setCategory(CATEGORIES[0]);
      setWhatsapp("");
      setDescription("");
      setNotice("Listing published successfully.");
      await loadListings();
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "Could not publish your listing. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="border-b">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-16 sm:px-8 sm:py-24 md:grid-cols-[1.2fr_0.8fr] md:items-center">
          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-primary">
              MyRehat · Direct stays & property
            </p>
            <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl">
              Book homestays directly with hosts
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
              Discover property opportunities and connect with hosts directly.
              Browse listings or publish your own opportunity.
            </p>
            <a
              href="#listings"
              className="mt-7 inline-flex rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Explore listings
            </a>
          </div>

          <div className="rounded-3xl border bg-card p-6 shadow-sm sm:p-8">
            <p className="text-sm font-medium text-muted-foreground">
              A simpler way to connect
            </p>
            <p className="mt-3 text-2xl font-semibold">
              Find an opportunity. Contact directly.
            </p>
            <div className="mt-6 grid gap-4">
              {[
                ["01", "Explore", "Browse available property listings."],
                ["02", "Connect", "Contact the listing owner on WhatsApp."],
                ["03", "Publish", "Share your own opportunity with the community."],
              ].map(([number, heading, copy]) => (
                <div key={number} className="flex gap-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold">
                    {number}
                  </span>
                  <div>
                    <h2 className="font-semibold">{heading}</h2>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {copy}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        id="listings"
        className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:px-8 lg:grid-cols-[0.85fr_1.15fr]"
      >
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Share an opportunity
          </p>
          <h2 className="mt-2 text-3xl font-bold">Publish a listing</h2>
          <p className="mt-3 leading-7 text-muted-foreground">
            Add the details below so interested buyers can contact you directly.
          </p>

          {!session.data?.user && (
            <div className="mt-5 rounded-xl border bg-muted/40 p-4 text-sm leading-6">
              You need to sign in before publishing a listing. You can still
              browse existing listings.
            </div>
          )}

          <form onSubmit={submitListing} className="mt-6 grid gap-4">
            <label className="grid gap-2 text-sm font-medium">
              Listing title
              <input
                required
                minLength={3}
                maxLength={120}
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="e.g. Beachside homestay opportunity"
                className="min-w-0 rounded-xl border bg-background px-4 py-3 font-normal"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium">
                Price (USD)
                <input
                  required
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={price}
                  onChange={(event) => setPrice(event.target.value)}
                  placeholder="150000"
                  className="min-w-0 rounded-xl border bg-background px-4 py-3 font-normal"
                />
              </label>
              <label className="grid gap-2 text-sm font-medium">
                Location
                <input
                  required
                  minLength={2}
                  maxLength={160}
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  placeholder="City, country"
                  className="min-w-0 rounded-xl border bg-background px-4 py-3 font-normal"
                />
              </label>
            </div>

            <label className="grid gap-2 text-sm font-medium">
              Listing category
              <select
                value={category}
                onChange={(event) =>
                  setCategory(event.target.value as (typeof CATEGORIES)[number])
                }
                className="min-w-0 rounded-xl border bg-background px-4 py-3 font-normal"
              >
                {CATEGORIES.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </label>

            <label className="grid gap-2 text-sm font-medium">
              WhatsApp number
              <input
                required
                minLength={8}
                maxLength={24}
                value={whatsapp}
                onChange={(event) => setWhatsapp(event.target.value)}
                placeholder="+628123456789"
                className="min-w-0 rounded-xl border bg-background px-4 py-3 font-normal"
              />
            </label>

            <label className="grid gap-2 text-sm font-medium">
              Description <span className="font-normal text-muted-foreground">(optional)</span>
              <textarea
                maxLength={3000}
                rows={4}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Describe the property or business opportunity..."
                className="min-w-0 resize-y rounded-xl border bg-background px-4 py-3 font-normal"
              />
            </label>

            {notice && (
              <p role="status" className="rounded-lg bg-muted p-3 text-sm">
                {notice}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Publishing..." : "Publish listing"}
            </button>
          </form>
        </div>

        <div>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-primary">
                Discover
              </p>
              <h2 className="mt-2 text-3xl font-bold">Latest listings</h2>
            </div>
            <span className="text-sm text-muted-foreground">
              {listings.length} {listings.length === 1 ? "listing" : "listings"}
            </span>
          </div>

          {loadingListings ? (
            <p className="py-10 text-muted-foreground">Loading listings...</p>
          ) : listings.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed p-8 text-center">
              <h3 className="font-semibold">No listings yet</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Be the first to share a property or homestay business opportunity.
              </p>
            </div>
          ) : (
            <div className="mt-6 grid gap-4">
              {listings.map((listing) => (
                <article
                  key={listing.id}
                  className="rounded-2xl border bg-card p-5 transition-shadow hover:shadow-md sm:p-6"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium">
                      {listing.category}
                    </span>
                    <span className="text-lg font-bold">
                      {money(listing.price)}
                    </span>
                  </div>
                  <h3 className="mt-4 text-xl font-semibold">{listing.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {listing.location}
                  </p>
                  {listing.description && (
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                      {listing.description}
                    </p>
                  )}
                  <a
                    href={`https://wa.me/${listing.whatsapp.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-5 inline-flex rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-muted"
                  >
                    Contact on WhatsApp ↗
                  </a>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <footer className="border-t px-5 py-8 text-center text-sm text-muted-foreground">
        MyRehat · Connect directly with property hosts.
      </footer>
    </main>
  );
}
