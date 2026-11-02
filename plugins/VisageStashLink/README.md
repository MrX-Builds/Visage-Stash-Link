# Visage Stash Link

Visage Stash Link is a small, read-only companion plugin for
[Visage](https://github.com/stashapp/CommunityScripts/tree/main/plugins/visage)
and [Stash](https://stashapp.cc/).

Right-click a performer result card in the Visage modal. If that performer
already exists in your local Stash, the menu opens the local performer profile
in a new tab. If there is no local match, it opens the exact external performer
profile supplied by Visage instead.

## First: thank you to Visage and CC1234

**Visage is the remarkable project here.**

CC1234 ([@cc1234475](https://github.com/cc1234475)) created the facial-
recognition workflow, performer result experience, external-source integration,
and Stash bridge that make this tiny convenience plugin possible. Visage Stash
Link does not reproduce any of that work. It simply adds one right-click route
on top of the thoughtful interface Visage already provides.

If this companion is useful to you, please give your attention and appreciation
to the original project first:

- [Visage in Stash CommunityScripts](https://github.com/stashapp/CommunityScripts/tree/main/plugins/visage)
- [Original Visage repository](https://github.com/cc1234475/visage)
- [Visage discussion on the Stash forum](https://discourse.stashapp.cc/t/visage/11785)
- [Support CC1234's work on Patreon](https://www.patreon.com/cw/cc12340)

Visage Stash Link is an independent companion, is not endorsed by the Visage
creator, and contains no Visage source code.

## Features

- Adds a context menu to `.visage-performer-card` result cards.
- Resolves the card's external stash-box performer ID against local Stash.
- Opens a matching local performer profile in a new browser tab.
- Falls back to the exact external profile URL embedded by Visage when the
  performer is not in local Stash.
- Recognizes StashDB, JavStash, FansDB, and ThePornDB profile hosts.
- Clearly reports when the local lookup fails while preserving the external
  route.
- Leaves Visage's normal left-click selection and quick-add behavior untouched.
- Performs read-only GraphQL queries only.

## Install with Stash Plugin Manager

In Stash, open **Settings -> Plugins -> Available Plugins -> Add Source** and
add:

```text
https://mrx-builds.github.io/Visage-Stash-Link/main/index.yml
```

Reload the available plugins, find **Visage Stash Link**, and install it. The
index and installable ZIP are automatically published through GitHub Pages.

Visage must also be installed and enabled.

## Manual installation

1. Download `VisageStashLink_v1.1.0.zip` from the
   [v1.1.0 release](https://github.com/MrX-Builds/Visage-Stash-Link/releases/tag/v1.1.0).
2. Extract the ZIP.
3. Copy the enclosed `VisageStashLink` folder into your Stash plugins folder.
4. Confirm the manifest path is
   `.../plugins/VisageStashLink/VisageStashLink.yml`.
5. In Stash, select **Settings -> Plugins -> Reload plugins**.
6. Hard-refresh the browser page with **Ctrl+F5**.

On a typical Windows installation, the plugins folder is:

```text
%USERPROFILE%\.stash\plugins
```

## Usage

1. Open a Visage performer-results modal.
2. Right-click any performer card.
3. Choose **Open [name] in local Stash** when a local match exists.
4. Otherwise choose **Open performer on [external source]**.

If more than one local performer record carries the same external ID, every
match is shown separately instead of silently guessing.

## How it works

Visage exposes each result as a `.visage-performer-card` with a
`data-performer-id` attribute and an external profile link. Visage Stash Link
uses Stash's UI Plugin API to run the same read-only `FindPerformersDocument`
plus `stash_id_endpoint` lookup pattern used by Visage itself.

The plugin uses the local performer ID only after Stash returns an exact match.
For the fallback route it reuses Visage's own external link; it does not assume
that an ID from one database belongs to another database.

## Read-only boundary

Visage Stash Link sends no GraphQL mutations. It does not create, edit, delete,
tag, organize, scrape, or otherwise modify Stash metadata, files, settings, or
the database. It does not modify or replace Visage.

## Compatibility and testing

Version 1.1.0 was human-tested against Visage 2.10.0. Visage 2.10.1 changes only
scene-list menu placement and leaves the performer-card path used here unchanged.

Automated Chromium smoke tests cover:

- right-click card detection;
- exact external-ID GraphQL variables;
- local performer navigation;
- missing-local external fallback; and
- network-fresh read behavior.

Stash's UI Plugin API is experimental, and Visage is actively developed, so a
future interface change may require a compatibility update.

## License

MIT. See [LICENSE.md](LICENSE.md).



## LLM-assisted development disclosure

Version 1.1.0 was developed with LLM assistance. The maintainer reviewed the
resulting plugin, human-tested both navigation paths in a live Stash
installation, and accepts responsibility for the code and license compliance.
