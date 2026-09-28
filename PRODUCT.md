# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

The primary customers are households in Brașov buying vegetables for personal use. The store also accepts individual customers from elsewhere in Romania. Grădina Kasper does not sell to businesses.

Customers shop when they need produce; the product is not a recurring subscription service.

## Product Purpose

Grădina Kasper enables individuals to discover and buy the garden's own fresh vegetables as boxes online, then receive their order through the available fulfillment options on one of the predetermined fulfillment dates.

Success means helping customers confidently choose available produce, understand when and how they will receive it, create an account when required, and complete a card payment.

## Positioning

Grădina Kasper sells vegetables grown locally in its own greenhouse. The confirmed product promise is fresh, organic produce grown by the Grădina Kasper team rather than a general marketplace assortment.

Organic certification status has not been specified. Future work must not invent certification marks or third-party endorsements.

## Operating Context

- Customers choose products in the quantities they need and place one-off orders.
- The catalogue contains 18 vegetable boxes. A small number are mixed boxes with broad vegetable variety; most focus primarily on one type of vegetable.
- Fulfillment happens twice per week on predetermined dates rather than on demand.
- The product supports delivery and pickup workflows. Exact geographic and pickup details remain CMS-managed product content.
- Customers must create an account before they can complete an order.
- Payment is by card only.
- The current storefront language is Romanian. Additional languages are planned, so interfaces must tolerate translation and text expansion without assuming a specific future locale set.

## Capabilities and Constraints

- Public product discovery, product detail pages, cart, and checkout.
- Account creation, sign-in, email verification, password recovery, optional two-factor authentication, saved addresses, order history, and customer cancellation requests.
- Delivery or pickup selection during checkout, subject to the configured fulfillment schedule.
- Card payment through the configured payment provider.
- CMS-managed inventory, availability windows, prices in RON including VAT, delivery fees, minimum delivery subtotal, fulfillment dates, page content, navigation, and support information.
- Editorial articles, FAQ, pickup information, support by phone, email, and WhatsApp, and legal/content pages.
- Administrator workflows for products, content, users, orders, order statuses, fulfillment schedules, and commerce settings.
- Product and editorial text should remain CMS-managed. Design work may use temporary template copy where content is absent but must not move editable business content into hard-coded presentation code.

## Brand Commitments

- The product name is **Grădina Kasper**.
- The existing logos, photographs, and people shown in the supplied reference images are real brand assets and content, not fictional placeholders.
- Romanian is the current customer-facing language.
- Confirmed brand facts include local greenhouse cultivation, the team's own vegetables, freshness, and organic growing.

## Evidence on Hand

- Real Grădina Kasper reference assets are stored in `reference-pictures/`, including the home, article, footer, and “Cum funcționează?” examples.
- `reference-pictures/other-i-like/random-site.png` is an additional inspiration reference rather than Grădina Kasper product evidence.
- The repository contains working commerce, authentication, order, fulfillment, support, editorial, and CMS functionality.
- No testimonials, customer counts, awards, certifications, press coverage, or performance claims have been supplied. Future work must not fabricate them.

## Product Principles

1. Make freshness and direct-from-our-greenhouse provenance easy to understand without unsupported claims.
2. Make product selection and quantity management fast for ordinary household shopping.
3. Set clear expectations about the next available fulfillment date and delivery or pickup before payment.
4. Introduce the required account step early enough that it never surprises a customer at the end of checkout.
5. Keep business content editable through the CMS and make the customer interface resilient to future translations.
