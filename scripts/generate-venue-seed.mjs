import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const venues = JSON.parse(fs.readFileSync(path.join(root, "data", "venues.json"), "utf8"));

function esc(value) {
  if (value === null || value === undefined) return "null";
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : "null";
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "object") return `'${JSON.stringify(value).replace(/'/g, "''")}'::jsonb`;
  return `'${String(value).replace(/'/g, "''")}'`;
}

const venueRows = venues.map((v) => {
  return `(${[
    esc(v.id),
    esc(v.name),
    esc(v.slug),
    esc(v.sport),
    esc(v.sportsAvailable || []),
    esc(v.locality),
    esc(v.city || "Hyderabad"),
    esc(v.address || ""),
    esc(v.mapQuery || ""),
    esc(v.mapLink || ""),
    esc(v.coordinates || {}),
    v.pricePerHour === null || v.pricePerHour === undefined ? "null" : v.pricePerHour,
    v.isPriceVerified ? "true" : "false",
    esc(v.priceNote || ""),
    v.rating ?? 0,
    v.reviewCount ?? 0,
    esc(v.environment || "Indoor"),
    esc(v.featuredImage || ""),
    esc(v.images || []),
    esc(v.amenities || []),
    esc(v.openingHours || ""),
    v.isOpenVerified ? "true" : "false",
    v.courtsCount ?? (v.courts || []).length,
    esc(v.description || ""),
    esc(v.rules || []),
    v.isFeatured ? "true" : "false",
    v.isPopular ? "true" : "false",
    esc(v.verificationBadge || "Preview Listing"),
  ].join(", ")})`;
});

const courtRows = [];
for (const v of venues) {
  for (const c of v.courts || []) {
    courtRows.push(
      `(${[esc(c.id), esc(v.id), esc(c.name), esc(c.type || ""), esc(c.surface || ""), c.pricePerHour === null || c.pricePerHour === undefined ? "null" : c.pricePerHour].join(", ")})`
    );
  }
}

const sql = `-- Auto-generated from data/venues.json
-- Re-run: node scripts/generate-venue-seed.mjs

insert into public.venues (
  id, name, slug, sport, sports_available, locality, city, address, map_query, map_link,
  coordinates, price_per_hour, is_price_verified, price_note, rating, review_count, environment,
  featured_image, images, amenities, opening_hours, is_open_verified, courts_count, description,
  rules, is_featured, is_popular, verification_badge
) values
${venueRows.join(",\n")}
on conflict (id) do update set
  name = excluded.name,
  slug = excluded.slug,
  sport = excluded.sport,
  sports_available = excluded.sports_available,
  locality = excluded.locality,
  address = excluded.address,
  price_per_hour = excluded.price_per_hour,
  featured_image = excluded.featured_image,
  images = excluded.images,
  courts_count = excluded.courts_count,
  description = excluded.description;

insert into public.courts (id, venue_id, name, type, surface, price_per_hour) values
${courtRows.join(",\n")}
on conflict (id) do update set
  name = excluded.name,
  type = excluded.type,
  surface = excluded.surface,
  price_per_hour = excluded.price_per_hour;
`;

fs.writeFileSync(path.join(root, "sql", "002_seed_venues.sql"), sql);
console.log(`Wrote ${venues.length} venues and ${courtRows.length} courts`);
