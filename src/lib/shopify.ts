import { GraphQLClient } from "graphql-request";

const domain = process.env.NEXT_PUBLIC_SHOPIFY_DOMAIN || process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || "glocasaglasswear.myshopify.com";
const storefrontToken = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN || "YOUR_STOREFRONT_TOKEN";

export const shopify = new GraphQLClient(
  `https://${domain}/api/2024-04/graphql.json`,
  {
    headers: {
      "X-Shopify-Storefront-Access-Token": storefrontToken,
    },
  }
);

// Queries
export const GET_PRODUCTS = `
query GetProducts($first: Int!) {
  products(first: $first) {
    edges {
      node {
        id
        title
        description
        productType
        tags
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
        images(first: 5) {
          edges { node { src url altText } }
        }
        variants(first: 10) {
          edges {
            node {
              id
              title
              price {
                amount
                currencyCode
              }
            }
          }
        }
      }
    }
  }
}`;

export const GET_PRODUCT = `
query GetProduct($id: ID!) {
  product(id: $id) {
    id
    title
    description
    priceRange { minVariantPrice { amount currencyCode } }
    images(first: 5) { edges { node { src altText } } }
  }
}`;

// ── Checkout Mutation ────────────────────────────────────────────────────────
const CHECKOUT_CREATE = `
mutation CheckoutCreate($input: CheckoutCreateInput!) {
  checkoutCreate(input: $input) {
    checkout {
      id
      webUrl
    }
    userErrors { field message }
  }
}`;

/**
 * Create a Shopify checkout and return the webUrl for redirection.
 * @param lineItems - Array of { variantId: string, quantity: number }
 */
export async function createCheckout(lineItems: { variantId: string; quantity: number }[]): Promise<string> {
  const input = { lineItems };
  const response: any = await shopify.request(CHECKOUT_CREATE, { input });
  const { checkout, userErrors } = response?.checkoutCreate || {};
  if (userErrors?.length) {
    throw new Error(userErrors.map((e: any) => e.message).join(", "));
  }
  if (!checkout?.webUrl) {
    throw new Error("Checkout URL not returned from Shopify");
  }
  return checkout.webUrl as string;
}
