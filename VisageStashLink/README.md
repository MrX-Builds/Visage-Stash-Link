# VisageStashLink

Small independent companion UI plugin for Visage.

## With appreciation for Visage

VisageStashLink is intentionally a very small companion. **Visage is the
remarkable project doing the important work.** CC1234 (`@cc1234475`) created
the facial-recognition workflow, performer result experience, external-source
integration, and Stash bridge that make this convenience plugin possible.

Please visit and support the original project:

- [Visage in Stash CommunityScripts](https://github.com/stashapp/CommunityScripts/tree/main/plugins/visage)
- [Original Visage repository](https://github.com/cc1234475/visage)
- [Visage discussion on the Stash forum](https://discourse.stashapp.cc/t/visage/11785)
- [Support CC1234's work on Patreon](https://www.patreon.com/cw/cc12340)

This companion is independent, is not endorsed by the Visage creator, and
contains no Visage source code.

## What it does

Right-click a performer result card in the Visage modal. The plugin reads the
card's external stash-box performer ID, runs a read-only GraphQL lookup against
your local Stash, and shows an action to open the matching local performer
profile in a new browser tab.

If the performer is not present locally, the menu says **Not found in local
Stash** and offers the exact external profile link already supplied by Visage
(for example StashDB, JavStash, FansDB, or ThePornDB). If more than one local
record has the same external ID, each local match is shown separately.

## Installation

1. Extract the ZIP. It contains one folder named `VisageStashLink`.
2. Copy that complete folder into your Stash plugins directory. On a typical
   Windows installation this is `%USERPROFILE%\.stash\plugins`.
3. In Stash, open **Settings > Plugins** and click **Reload plugins**.
4. Confirm that **Visage Stash Link 1.1.0** appears in the installed plugins.
5. Reload the Stash browser page once.

Do not put only the ZIP into the plugins directory; extract the folder first.

## Use

Open a Visage result modal and right-click a performer card. After the read-only
lookup completes, choose **Open [name] in local Stash**. When no local match
exists, choose **Open performer on [external source]** instead.

## Compatibility and scope

- Verified against the public Visage 2.10.0 implementation dated 2026-11-01.
- Uses the same `FindPerformersDocument` and `stash_id_endpoint` lookup pattern
  used by Visage itself.
- Does not alter Visage files or intercept normal left-click selection.
- Performs no GraphQL mutations and makes no Stash metadata changes.


