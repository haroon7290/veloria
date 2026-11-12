# Valoria London: Shopify theme

A custom Shopify Online Store 2.0 theme for **Valoria London**, a UK retailer of genuine designer fragrances.
Version **4.1.0**. Tested with Shopify Theme Check (no issues), 141 automated interaction checks and an axe accessibility audit (WCAG 2.1 AA, no violations) on desktop and mobile.

## Install

**Option A: upload the ZIP**
1. Use `valoria-london-theme-v4.1.0.zip` (shared alongside this repository). Theme folders must sit at the root of the ZIP.
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
| `how_to_wear`, `ingredients`, `fragrance_details`, `faqs` | Multi-line or rich text | Accordions |
| `character` | Single line text | One-line character statement in About the fragrance |
| `scent_profile`, `manufacturer_info` | Multi-line text | About the fragrance |
| `popularity_note` | Single line text | Overrides the bestseller line for one product |
| `reviews` | List of metaobject references (Product review) | Customer reviews |
| `perfumer`, `launch_year` | Text / number | Fragrance details |

Star ratings appear automatically when a reviews app fills Shopify's standard `reviews.rating` metafields.

## Product page

Purchase column: brand, name, concentration, star rating from your own reviews, price with saving, an honest bestseller line, sizes, stock, quantity, Add to bag, Buy it now, trust icons, the multi-buy offer, short description, accordions (details, ingredients, how to wear, delivery, returns, FAQs) and a WhatsApp help link.

Below: Fragrance notes (top, heart, base), About the fragrance, Frequently bought together, Customer reviews, Delivery and returns, You may also love, More from this brand and Recently viewed. A sticky purchase bar appears on mobile and desktop once Add to bag scrolls away.

### 1. Customer reviews (no app needed)

Create a metaobject definition in Shopify admin › Settings › Custom data › Metaobjects › Add definition:

- Name: **Product review** (type `product_review`), Storefront access on.
- Fields:

| Field name | Key | Type |
| --- | --- | --- |
| Name | `name` | Single line text |
| Rating | `rating` | Integer (min 1, max 5) |
| Date | `date` | Date |
| Title | `title` | Single line text (optional) |
| Review | `body` | Multi-line text |
| Photo | `photo` | File (images), optional |
| Verified buyer | `verified` | True or false |
| Source | `source` | Single line text, e.g. WhatsApp (optional) |
| Location | `location` | Single line text (optional) |

Then add a product metafield definition: Settings › Custom data › Products › Add definition, name **Reviews**, key `custom.reviews`, type **Metaobject › Product review**, **List of entries**.

To add a review: open the product, scroll to Metafields › Reviews, click it and create a new entry. The average, count, breakdown, sorting, filtering and photos all update automatically. Products without reviews show a "No reviews yet" message with a "Share your experience" button (WhatsApp or your contact page).

Publish genuine feedback only, include critical reviews, don't change their meaning, tick Verified buyer only when you've matched the review to an order, and ask permission before using a customer's name or photo (UK DMCC Act 2024).

### 2. Multi-buy offer (Buy 2 save 10%, Buy 3 save 20%)

The saving is given by Shopify's own automatic discounts, so it is applied in the cart and at checkout. No app is needed.

1. Create (or choose) the collection of eligible fragrances, for example `multi-buy`.
2. Shopify admin › Discounts › Create discount › **Amount off products** › Method: **Automatic discount**.
   - Title: `Multi-buy 10%`. Value: 10%. Applies to: the eligible collection.
   - Minimum purchase requirements: **Minimum quantity of items: 2**.
   - Combinations: leave all unticked.
3. Create a second one: `Multi-buy 20%`, 20%, same collection, **Minimum quantity of items: 3**, no combinations.
4. When a bag qualifies for both, Shopify applies the better one (20%). Because neither combines with other discounts, a customer can't stack them with a code: Shopify gives whichever is better.
5. Online Store › Themes › Customize › Theme settings › **Multi-buy offer**: choose the same collection, check the percentages match, then tick **Show the multi-buy offer**.
6. Test: add two eligible fragrances and open the bag. You should see "Multi-buy 10%" on the lines.

Frequently bought together uses the same discount: when two or three eligible fragrances are ticked, the same saving applies at checkout.

### 3. Trust and delivery details

Theme settings › **Trust and delivery** holds six reassurance points and the delivery, dispatch, returns and "shopping with confidence" text. The delivery times and prices are examples: replace them, then tick "I've checked these details are accurate". Add your WhatsApp number in Theme settings › Social media.

### 4. Complementary products (optional)

Install Shopify's free **Search & Discovery** app, open a product › Complementary products, and pick 2–3 fragrances. Frequently bought together uses them; otherwise it suggests products from the multi-buy collection.

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
