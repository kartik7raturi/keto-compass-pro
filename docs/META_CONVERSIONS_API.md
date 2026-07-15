# Meta Conversions API setup

Meta Pixel browser events are configured for pixel `1759880568532895` and test event code `TEST1841`.

Server-side Conversions API events are proxied through the Supabase Edge Function `meta-conversions-api` so the access token is not exposed in the website bundle.

Configure the token as a Supabase secret before deploying the function:

```bash
supabase secrets set META_CAPI_ACCESS_TOKEN='<token from Meta Events Manager>'
supabase functions deploy meta-conversions-api
```

Do not commit the Conversions API access token to source control or place it in client-side environment variables.
