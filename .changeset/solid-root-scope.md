---
"@ui-sdk/solid": patch
---

A root whose controlled input, like `open` or `checked`, is an async source that hasn't produced yet now waits in a scope of its own. The surrounding `Loading` shows its fallback and the root renders once the value arrives, instead of the component that renders the root being rebuilt and subscribing again.
