# 09 — Refresh account usage on window focus (not only manual)

- **Type:** Enhancement
- **Priority:** P3
- **Effort:** S
- **Labels:** `enhancement`, `ux`, `accounts`

## Problem

The account usage `%` only updates when the user clicks **Làm mới % usage tất cả**
(refresh all) or a row's **Làm mới % usage** (refresh one). It never refreshes on its
own, so the numbers go stale.

## Current behavior

`web/src/AccountBadge.jsx` deliberately loads once and does **not** poll:

- `load()` fetches `/api/accounts` **without** usage (`?usage=1` omitted), and the
  effect comment says *"nạp 1 lần, KHÔNG tự poll định kỳ"* (load once, no periodic
  polling) — `useEffect(() => { load(); }, [load])`.
- Usage `%` is only fetched on demand: `refreshAll()` → `/api/accounts?usage=1`,
  `refreshOne(id)` → `/api/accounts/:id/usage`.

This was intentional to avoid hammering Anthropic's usage API (rate limits).

## Proposed fix (chosen approach: on-focus + manual, no background polling)

Refresh usage when the tab regains focus / becomes visible, plus on first load — but
**do not** add a background timer (keeps API calls bounded, respects rate limits).

- Add a `visibilitychange` / `window` `focus` listener in `AccountBadge` that calls the
  existing `refreshAll()` (which already hits `/api/accounts?usage=1`).
- Debounce so rapid focus/blur doesn't spam the API (e.g. skip if refreshed < ~30s ago).
- Keep both manual buttons working unchanged.

Sketch (`AccountBadge.jsx`):

```jsx
const lastRefresh = useRef(0);
useEffect(() => {
  const onFocus = () => {
    if (document.visibilityState !== "visible") return;
    if (Date.now() - lastRefresh.current < 30_000) return; // debounce
    lastRefresh.current = Date.now();
    refreshAll();
  };
  window.addEventListener("focus", onFocus);
  document.addEventListener("visibilitychange", onFocus);
  return () => {
    window.removeEventListener("focus", onFocus);
    document.removeEventListener("visibilitychange", onFocus);
  };
}, [refreshAll]);
```

(Set `lastRefresh.current` inside `refreshAll`/`refreshOne` too, so manual refreshes
also reset the debounce window.)

## Affected files

- `web/src/AccountBadge.jsx` (add focus/visibility listener + debounce ref)

## Acceptance criteria

- [ ] Returning to the tab (after ≥ debounce window) refreshes all accounts' usage.
- [ ] No background timer runs while the tab is focused (no periodic polling).
- [ ] Manual **Làm mới** buttons still work and share the debounce window.

## Risks / notes

- Rationale for on-focus over interval polling: bounds the number of usage-API calls
  and avoids throttling with several accounts.
- If a periodic refresh is ever wanted, make the interval configurable and keep it long
  (≥ 5 min) to stay within rate limits.
