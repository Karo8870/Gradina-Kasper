# Grădina Kasper design contract

This storefront should feel friendly, grounded, locally grown, and lightly playful—not premium/luxury, synthetic, or decorative for decoration's sake. The information architecture, routes, commerce behaviour, and CMS ownership remain unchanged.

## Visual language

- Use the existing green system only for emphasis: white and pale green surfaces, deep green type/actions, and the established primary and secondary scales in `src/app/(frontend)/globals.css`. Muted UI, borders, dividers, and inputs use quiet neutral tokens rather than a green tint; do not introduce an unrelated accent palette.
- Keep most surface and component styling in Tailwind v4 utilities. `globals.css` is limited to the Tailwind theme tokens and base layer (including focus, selection, scrollbar, and type defaults), rather than page-specific styles.
- `Lexend` is loaded in `src/app/(frontend)/layout.tsx` and applied to the site body. The global font token names are `--font-heading` and `--font-sans` in `globals.css`; headings use the heading token with a slightly tight letter spacing.
- Use generous whitespace, large softly rounded photo/surface planes, and almost no visible borders. Rounded corners should support warmth and grouping, not turn every label into a pill.
- Buttons are restrained rounded green controls: solid deep-green primary actions, quiet pale/outlined alternatives, clear focus rings, and a subtle hover lift/shadow only on the primary treatment. Keep labels direct and action-led.

## Home page

The home page inherits the composition of the public `gradinakasper.ro` storefront and refines it rather than replacing it:

1. A true viewport-filling, real-photography greenhouse hero with a soft neutral light wash, dark-green editorial copy, and one direct catalogue action.
2. A separate featured-box section with an editorial heading and a wide image/content product panel.
3. A straightforward three-column article section that becomes a single column on mobile.

The navigation overlays the hero on a translucent white surface, then becomes more opaque after scrolling. Mobile preserves the viewport-filling photographic hero but keeps the headline, body, and action within a readable measure instead of allowing them to crowd the image.

Featured availability and stock are quiet inline supporting text, not a badge collection. The initial purchase action, details link, and familiar combined minus/count/plus control share a 3.5rem height and the same available width before and after adding an item. The quantity control uses the established Grădina Kasper green container with softly inset white controls. Do not add stickers, doodles, testimonials, invented trust marks, or AI-looking ornament.

## Imagery, articles, and shell

- Use only real Grădina Kasper imagery and the existing logo. CMS media must be populated Payload media rendered with `RenderMedia`; do not substitute stock, generated, or decorative images.
- Article links follow the live storefront's image-led cards, refined with a neutral border, 16:10 media, stronger spacing, and restrained hover movement.
- The header overlays the home hero transparently and becomes a compact white navigation surface after scrolling. Other routes retain the sticky white header. Mobile navigation remains the existing sheet.
- The footer remains the deep-green brand field with the CMS logo, social links, and CMS-managed columns.

## Products page

- The Products Page global owns a **Featured boxes** multi-select. Its selected boxes appear first as wide, image-led product panels in the chosen order; all other available boxes follow in a compact responsive grid.
- The split is presentation only: availability, cart behavior, product routes, and product data ownership stay the same. Use the global selection for a small editorial choice rather than creating a separate catalogue or duplicating products.

## Content and data guardrails

- Do not hardcode delivery dates, weights, inventory promises, or template business copy. Product and fulfilment decision data belongs to the CMS/model; page and navigation text remains CMS-managed where the model provides it.
- The current model does **not** expose product weight or next-delivery fields. Do not invent them to satisfy a layout; this is a data/model constraint that must be addressed in the model before it can be shown.
- Local seed media currently uses invalid `test` URLs, so development captures can show alt text/fallbacks. Treat that as a seed-data issue, not a visual replacement or justification for fake imagery.

When extending the design, preserve existing routes, business rules, checkout/cart behaviour, and the current content ownership boundaries.
