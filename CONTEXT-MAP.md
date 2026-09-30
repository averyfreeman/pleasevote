# Context Map

PleaseVote currently has one bounded product context. This map is kept as a
small navigation point for Git-BBQ and future agents if the API, companion, or
provider domains become independent contexts later.

## Contexts

- [PleaseVote domain context](./CONTEXT.md): neutral voter-information
  vocabulary, product boundaries, and correctness invariants.

## Relationships

- The Go provider/API and TypeScript UI share the vocabulary and invariants in
  the root context through the OpenAPI contract.
- The optional consent companion is operationally separate and must not link
  its intake records to the PleaseVote lookup context.
