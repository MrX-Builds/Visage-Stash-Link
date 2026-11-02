/*
 * VisageStashLink v1.1.0
 *
 * Independent companion UI plugin for Visage. Right-click a Visage performer
 * result card to resolve its external stash-box performer ID against local
 * Stash, then open the matching local performer profile in a new tab.
 *
 * This plugin performs read-only GraphQL queries. It does not modify Visage,
 * Stash metadata, files, settings, or other plugins.
 *
 * VisageStashLink is a companion to Visage by CC1234 (@cc1234475). Visage's
 * facial-recognition workflow, performer result cards, and external-source
 * integration are the substantial work that makes this small extension useful.
 * https://github.com/stashapp/CommunityScripts/tree/main/plugins/visage
 */
(function () {
  'use strict';

  if (window.top !== window.self) return;
  if (window.__visageStashLinkLoaded) return;
  window.__visageStashLinkLoaded = true;

  const PLUGIN = 'VisageStashLink';
  const CARD_SELECTOR = '.visage-performer-card[data-performer-id]';
  const MENU_ID = 'visage-stash-link-menu';
  const STYLE_ID = 'visage-stash-link-style';
  let requestNumber = 0;

  function injectStyles() {
    if (document.getElementById(STYLE_ID) || !document.head) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      #${MENU_ID} {
        position: fixed;
        z-index: 2147483647;
        min-width: 245px;
        max-width: min(360px, calc(100vw - 16px));
        padding: 6px;
        border: 1px solid #596775;
        border-radius: 8px;
        color: #f4f6f8;
        background: #20262d;
        box-shadow: 0 10px 30px rgba(0, 0, 0, .55);
        font: 14px/1.35 system-ui, -apple-system, "Segoe UI", sans-serif;
      }
      #${MENU_ID} .visage-stash-link-heading {
        padding: 6px 9px 7px;
        color: #aeb9c4;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: .04em;
        text-transform: uppercase;
      }
      #${MENU_ID} button {
        display: block;
        width: 100%;
        padding: 9px 10px;
        border: 0;
        border-radius: 5px;
        color: inherit;
        background: transparent;
        text-align: left;
        cursor: pointer;
      }
      #${MENU_ID} button:hover,
      #${MENU_ID} button:focus-visible {
        color: #fff;
        background: #3f5163;
        outline: none;
      }
      #${MENU_ID} button:disabled {
        color: #98a2ac;
        cursor: default;
        background: transparent;
      }
      #${MENU_ID} .visage-stash-link-error {
        color: #ffb7bd;
      }
    `;
    document.head.appendChild(style);
  }

  function closeMenu() {
    const menu = document.getElementById(MENU_ID);
    if (menu) menu.remove();
  }

  function positionMenu(menu, clientX, clientY) {
    menu.style.left = Math.max(8, clientX) + 'px';
    menu.style.top = Math.max(8, clientY) + 'px';

    const rect = menu.getBoundingClientRect();
    const left = Math.max(8, Math.min(clientX, window.innerWidth - rect.width - 8));
    const top = Math.max(8, Math.min(clientY, window.innerHeight - rect.height - 8));
    menu.style.left = left + 'px';
    menu.style.top = top + 'px';
  }

  function makeMenu(clientX, clientY, externalId) {
    closeMenu();
    injectStyles();

    const menu = document.createElement('div');
    menu.id = MENU_ID;
    menu.setAttribute('role', 'menu');
    menu.setAttribute('aria-label', 'Visage performer actions');
    menu.dataset.externalPerformerId = externalId;

    const heading = document.createElement('div');
    heading.className = 'visage-stash-link-heading';
    heading.textContent = 'Visage performer';
    menu.appendChild(heading);

    const status = document.createElement('button');
    status.type = 'button';
    status.disabled = true;
    status.textContent = 'Looking up performer in local Stash…';
    menu.appendChild(status);

    document.body.appendChild(menu);
    positionMenu(menu, clientX, clientY);
    return menu;
  }

  function localPerformerPath(localId) {
    return '/performers/' + encodeURIComponent(String(localId));
  }

  function sourceNameForUrl(url) {
    const host = url.hostname.toLowerCase().replace(/^www\./, '');
    if (host === 'stashdb.org') return 'StashDB';
    if (host === 'theporndb.net' || host === 'api.theporndb.net') return 'ThePornDB';
    if (host === 'javstash.org') return 'JavStash';
    if (host === 'fansdb.cc') return 'FansDB';
    return host || 'external source';
  }

  function externalProfileFromCard(card, externalId) {
    const anchor = card.querySelector('a.visage-performer-name[href], a[href*="/performers/"]');
    if (anchor) {
      try {
        const url = new URL(anchor.getAttribute('href'), location.href);
        if (url.protocol === 'https:' || url.protocol === 'http:') {
          return { url: url.href, sourceName: sourceNameForUrl(url) };
        }
      } catch (_) { /* use Visage's current default below */ }
    }

    const fallback = new URL(
      'https://stashdb.org/performers/' + encodeURIComponent(String(externalId))
    );
    return { url: fallback.href, sourceName: 'StashDB' };
  }

  function openInNewTab(url) {
    const opened = window.open(url, '_blank');
    if (opened) opened.opener = null;
    return opened;
  }

  function addOpenButton(menu, performer) {
    const button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('role', 'menuitem');
    button.textContent = performer.name
      ? 'Open ' + performer.name + ' in local Stash'
      : 'Open performer in local Stash';
    button.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      const opened = openInNewTab(localPerformerPath(performer.id));
      closeMenu();
      if (!opened) {
        window.alert('The performer page was blocked. Allow popups for this Stash site and try again.');
      }
    });
    menu.appendChild(button);
    return button;
  }

  function addExternalButton(menu, externalProfile) {
    const button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('role', 'menuitem');
    button.textContent = 'Open performer on ' + externalProfile.sourceName;
    button.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      const opened = openInNewTab(externalProfile.url);
      closeMenu();
      if (!opened) {
        window.alert('The external performer page was blocked. Allow popups for this Stash site and try again.');
      }
    });
    menu.appendChild(button);
    return button;
  }

  function showLookupResult(menu, performers, externalProfile, clientX, clientY) {
    if (!menu.isConnected) return;
    const oldStatus = menu.querySelector('button');
    if (oldStatus) oldStatus.remove();

    if (!performers.length) {
      const status = document.createElement('button');
      status.type = 'button';
      status.disabled = true;
      status.textContent = 'Not found in local Stash';
      menu.appendChild(status);
      addExternalButton(menu, externalProfile);
    } else {
      for (const performer of performers) addOpenButton(menu, performer);
    }

    positionMenu(menu, clientX, clientY);
    const firstAction = menu.querySelector('button:not(:disabled)');
    if (firstAction) firstAction.focus({ preventScroll: true });
  }

  function showLookupError(menu, error, externalProfile, clientX, clientY) {
    if (!menu.isConnected) return;
    const status = menu.querySelector('button');
    if (status) {
      status.textContent = 'Could not query local Stash';
      status.classList.add('visage-stash-link-error');
      status.title = error && error.message ? error.message : String(error || 'Unknown error');
    }
    addExternalButton(menu, externalProfile);
    positionMenu(menu, clientX, clientY);
    console.error('[' + PLUGIN + '] Performer lookup failed:', error);
  }

  async function findLocalPerformers(externalPerformerId) {
    const api = window.PluginApi;
    if (!api || !api.GQL || !api.utils || !api.utils.StashService) {
      throw new Error('Stash PluginApi is unavailable.');
    }

    const client = api.utils.StashService.getClient();
    const result = await client.query({
      query: api.GQL.FindPerformersDocument,
      variables: {
        performer_filter: {
          stash_id_endpoint: {
            endpoint: '',
            stash_id: externalPerformerId,
            modifier: 'EQUALS'
          }
        }
      },
      fetchPolicy: 'network-only'
    });

    const performers = result && result.data && result.data.findPerformers
      ? result.data.findPerformers.performers
      : [];
    return Array.isArray(performers)
      ? performers.filter(function (performer) { return performer && performer.id; })
      : [];
  }

  async function handleContextMenu(event) {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const card = target.closest(CARD_SELECTOR);
    if (!card) return;

    const externalId = card.getAttribute('data-performer-id');
    if (!externalId) return;

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    const currentRequest = ++requestNumber;
    const x = event.clientX;
    const y = event.clientY;
    const externalProfile = externalProfileFromCard(card, externalId);
    const menu = makeMenu(x, y, externalId);

    try {
      const performers = await findLocalPerformers(externalId);
      if (currentRequest !== requestNumber || !menu.isConnected) return;
      showLookupResult(menu, performers, externalProfile, x, y);
    } catch (error) {
      if (currentRequest !== requestNumber || !menu.isConnected) return;
      showLookupError(menu, error, externalProfile, x, y);
    }
  }

  document.addEventListener('contextmenu', handleContextMenu, true);
  document.addEventListener('pointerdown', function (event) {
    const menu = document.getElementById(MENU_ID);
    if (menu && event.target instanceof Node && !menu.contains(event.target)) closeMenu();
  }, true);
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') closeMenu();
  }, true);
  window.addEventListener('blur', closeMenu);
  window.addEventListener('resize', closeMenu);
  window.addEventListener('scroll', closeMenu, true);
})();


