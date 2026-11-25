# Google reviews on concept pages: setup

Shows a business's live Google rating, review count and up to 5 reviews
(Google's limit) inside the concept page, sorted highest rating first.

Sign in to the company Google account (the same one as the other scripts).

## 1. Get a Places API key (Google Cloud)

1. Go to <https://console.cloud.google.com/> and create a project named
   `Avenza reviews`.
2. **Billing:** Menu → Billing → link a billing account. Google requires a card
   even for its free monthly allowance; this script calls Google only a few
   times a day.
3. **Enable the API:** Menu → APIs & Services → Library → search
   **"Places API (New)"** → Enable.
4. **Create the key:** APIs & Services → Credentials → **Create credentials →
   API key**.
5. **Restrict the key:** open the key → *API restrictions* → **Restrict key** →
   tick only **Places API (New)** → Save.
6. Optional safety net: Billing → **Budgets & alerts** → create a small monthly
   budget (e.g. $5) with email alerts.

Keep the key private. Don't paste it into chats, emails or website code.

## 2. Create the script

1. Go to <https://script.google.com/> → **New project**, name it
   `Avenza reviews proxy`.
2. Replace everything in `Code.gs` with [`ReviewsProxy.gs`](ReviewsProxy.gs).
   Save.
3. **Project Settings** (gear icon) → **Script Properties** → **Add script
   property**: name `PLACES_API_KEY`, value = your key. Save.
4. Back in the editor, choose the function **`testSweetAndSuch`** and click
   **Run**. Authorize when asked ("Google hasn't verified this app" → Advanced →
   Go to Avenza reviews proxy → Allow). The log should show the rating
   (about 4.7), the review count and `reviews: 5`.

## 3. Deploy

**Deploy → New deployment → Web app**: Execute as **Me**, Who has access
**Anyone** → Deploy. Copy the **Web app URL** (`https://script.google.com/macros/s/.../exec`)
and send it to be connected to the page.

Check it by opening `<URL>?site=sweet-and-such` in a browser: it should show
JSON with `"ok":true`.

## Notes

- Results are cached for 6 hours. Add `&refresh=1` to the URL to force an
  update.
- Only businesses listed in `SITES` at the top of the script can be looked up.
  Add a line there for each new client.
- Google's terms require showing each reviewer's name with their review and
  attributing the reviews to Google; the page does both.
