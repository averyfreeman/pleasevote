# PLEASE VOTE

### A project with certain urgency

The project is designed to deliver information to voters about upcoming elections provided by the [Google Civic API](https://developers.google.com/civic-information).

Information provided includes:

- Upcoming elections
- Polling locations

* - Detailed information about:
* - Primary Elections
* - General Elections
* - Referendums Elections

Also includes links to official external sites which allow user to:

- Register to vote
- Find state's local election office

Additional feature(s):

- LCD-styled Countdown clock w/ customizable deadline

Planned soon:

- Google map to show coordinates of provided address (and possibly choose address)
- US District maps created by geocode coordinates

Possible changes:

- A different election info provider such as Open States (Google Civic API leaves a lot to be desired)

Technical:

- API interface parses query params to custom js using [googleapis package](https://www.npmjs.com/package/googleapis) to query Google API using `electionQuery()` and `voterInfoQuery()` methods, which return standard objects.

## NextJS boilerplate:

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.js`. The page auto-updates as you edit the file.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/import?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
