This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Paystack payment mode

Paystack mode is controlled by the server-side `PAYSTACK_MODE` environment variable:

- `PAYSTACK_MODE=test` uses a `PAYSTACK_SECRET_KEY` beginning with `sk_test_`.
- If `PAYSTACK_MODE` is unset or blank, the application safely defaults to `test`.
- Live processing requires `PAYSTACK_MODE=live` and a `PAYSTACK_SECRET_KEY` beginning with `sk_live_`. The mode and key must match.
- Keep `PAYSTACK_SECRET_KEY` server-side only. Never name it `NEXT_PUBLIC_*`, commit it, or paste it into chat/issues.
- Configure production secrets only in the hosting provider's environment settings. Keep preview/development deployments on test credentials.

Allowing a live key in configuration is not, by itself, a production-readiness approval. Before enabling live payments, verify the Paystack account's supported currencies, production webhook URL/signature configuration, approved catalogue prices, transaction fulfilment/idempotency, and the full automated test/build results.
