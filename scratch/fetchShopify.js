// fetchShopify.js – fetch real products using Storefront token
// Using built-in fetch (Node 18+)
require('dotenv').config({ path: '.env.local' });

const token = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN;
if (!token) {
  console.error('Storefront token not set');
  process.exit(1);
}

const query = `
  query GetProducts {
    products(first: 5) {
      edges {
        node {
          id
          title
          description
          images(first: 1) { edges { node { url } } }
        }
      }
    }
  }`;

fetch('https://YOUR_SHOPIFY_STORE.myshopify.com/api/2023-07/graphql.json', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Shopify-Storefront-Access-Token': token,
  },
  body: JSON.stringify({ query }),
})
  .then(res => res.json())
  .then(data => {
    console.log('Shopify response:', JSON.stringify(data, null, 2));
  })
  .catch(err => console.error('Error:', err));
