# Valoria London: Shopify theme

A custom Shopify Online Store 2.0 theme for **Valoria London**, a UK retailer of genuine designer fragrances.
Version **4.0.0**. Tested with Shopify Theme Check (no issues), 106 automated interaction checks and an axe accessibility audit (WCAG 2.1 AA, no violations) on desktop and mobile.

## Install

**Option A: upload the ZIP**
1. Use `valoria-london-theme-v4.0.0.zip` (shared alongside this repository). Theme folders must sit at the root of the ZIP.
2. Shopify admin › Online Store › Themes › Add theme › Upload zip file.
3. Click **Customize** to preview, then **Publish** when you are happy with it.

**Option B: connect this repository**
1. Shopify admin › Online Store › Themes › Add theme › **Connect from GitHub**.
2. Choose this repository and the `main` branch.
3. Shopify keeps the theme in sync with the branch. Changes you make in the theme editor are committed back to the branch.

## Homepage sections (in order)

| Section | What it does |
| --- | --- |
| Hero | Full-screen campaign image, separate mobile image, transparent header, slow zoom and staggered text on load, scroll indicator |
| Shop by category | Category tabs with search and add to bag on every product card |
| Trust strip | Short assurances (only claims you can support) |
| Image with text | Brand introduction, asymmetric layout with optional detail image |
| Collection list | Editorial mosaic of collections (For Her, For Him, Unisex, Bestsellers, New Arrivals, Gift Edit) |
| Featured products | The Signature Edit: products from a collection or hand-picked, grid or carousel, optional label |
| Campaign banner | Second Hero section for an editorial campaign image |
| Scent families | Fragrance family tiles linked to collections |
| Scent finder | Two questions (who it is for, which mood) that show matching products live |
| Brand story | The philosophy section, magazine layout |
| Values | Why Valoria London, numbered points |
| Customer feedback | Genuine reviews only on the live store (samples show in the editor, labelled); also accepts review app blocks |
| Social gallery | Instagram-style gallery, hidden until you add images |
| Newsletter | Shopify customer sign-up with validation and success state |

All sections can be added, removed, reordered and edited in the theme editor. Most have background and spacing settings.

## Image slots

When an image is empty, visitors see a quiet designed surface. In the theme editor each slot shows its name and recommended size.

| Slot | Where | Recommended size |
| --- | --- | --- |
| HERO_CAMPAIGN_IMAGE | Hero › Desktop image | 2400 × 1350 px (16:9) |
| HERO_MOBILE_IMAGE | Hero › Mobile image | 1080 × 1440 px |
| BRAND_INTRODUCTION_IMAGE | Image with text | 1600 × 2000 px (4:5) |
| COLLECTION_*_IMAGE | Collection list › each collection | 1600 × 2000 px (4:5), or the collection's own image |
| EDITORIAL_CAMPAIGN_IMAGE | Campaign banner | 2400 × 1350 px |
| FRAGRANCE_FAMILY_IMAGE | Scent families › each family | 900 × 1200 px (3:4) |
| BRAND_STORY_IMAGE | Brand story | 2000 × 1400 px |
| INSTAGRAM_IMAGE_01–06 | Social gallery | 1080 × 1350 px |
| MEGA_MENU_IMAGE | Header › Menu image blocks | 900 × 1125 px |
| COLLECTION_BANNER_IMAGE | Collection page banner | 2400 × 900 px, or the collection image |

Product photos always come from the product's own media in Shopify.

## Menus

- Header: `main-menu`. Suggested top level: Shop, Collections, Our Story. Add sub-links to create dropdowns.
  Add a **Menu image** block in the Header section and type the top-level title (for example `Shop`) to show an image in that dropdown.
- Footer: `footer` (Explore) and `customer-care` (Information: Our Story, Contact, FAQs, policies).
- Optional: a "Popular searches" menu in Theme settings › Search.

## Product metafields (namespace `custom`)

Shown only when filled in. Nothing is invented.

| Key | Type | Used for |
| --- | --- | --- |
| `concentration` | Single line text | Eau de Parfum, Eau de Toilette… (otherwise detected from title, type or tags) |
| `fragrance_family` | Single line text or list | Product page, product cards |
| `top_notes`, `heart_notes` (or `middle_notes`), `base_notes` | List of single line text | Notes pyramid |
| `occasions` | List of single line text | Fragrance details |
| `season` | List of single line text | Fragrance details |
| `gender` | Single line text | Highlights |
| `how_to_wear`, `ingredients`, `fragrance_details` | Multi-line or rich text | Accordions |
| `perfumer`, `launch_year` | Text / number | Fragrance details |

Star ratings appear automatically when a reviews app fills Shopify's standard `reviews.rating` metafields.

## Product page

Gallery with thumbnails, arrows, swipe and zoom; variant pills; quantity; add to bag; Buy it now; stock status; delivery and returns from your policies; then About the fragrance, an Apps area for reviews (`#reviews`), You may also like, Complete your collection (set complementary products in the Search & Discovery app), More from this brand, Trending now and Recently viewed.

## Cart

Drawer or page. Discount codes (validated by Shopify), recommendations in the drawer, optional free-delivery progress bar (only when you set a threshold), order note.

## Content rules this theme follows

- Valoria London is presented as a retailer of genuine designer fragrances. It does not claim to make fragrances, own brands or be an authorised retailer.
- Sample reviews never appear on the live store (UK DMCC Act 2024). Tick "This is a genuine customer review" only for real, permitted feedback.
- No delivery promises are hard-coded. Delivery and returns text comes from your settings and policies.

## Development

- No build step and no third-party JavaScript. `assets/theme.js` is plain JavaScript; `assets/base.css` holds all styles.
- Fonts (Bodoni Moda, Inter) are self-hosted under the SIL Open Font License.
- Motion respects the visitor's reduced-motion setting.
