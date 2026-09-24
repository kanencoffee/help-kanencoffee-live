(function() {
  var clarityEvents = {
    booking: 'HelpBookingClick',
    repair_info: 'HelpRepairInfoClick',
    store: 'HelpStoreClick',
    phone: 'HelpPhoneClick',
    email: 'HelpEmailClick'
  };

  function getClickType(url) {
    var path = url.pathname;

    if (url.protocol === 'tel:') return 'phone';
    if (url.protocol === 'mailto:') return 'email';
    if (url.hostname !== 'kanencoffee.com') return null;
    if (path === '/pages/book-appointment') return 'booking';
    if (path === '/pages/repairs') return 'repair_info';

    return 'store';
  }

  /* 2026-09-23: in-page "Watch the fix" jump. Help pages embed their videos ~85%
     of the way down against 18-61% average scroll depth, so almost nobody reached
     them; the CTA at the top now links to the anchor. It is a same-page href so the
     kanencoffee.com branch below never sees it - track it separately. */
  document.addEventListener('click', function(event) {
    var t = event.target;
    var a = t && t.closest && t.closest('a[href="#watch-the-fix"]');
    if (!a) return;
    if (typeof window.gtag === 'function') {
      try { window.gtag('event', 'help_video_cta_click', {
        event_category: 'help_site', page_path: window.location.pathname }); } catch (e) {}
    }
    if (typeof window.clarity === 'function') {
      try { window.clarity('event', 'HelpVideoCtaClick'); } catch (e) {}
    }
  });

  document.addEventListener('click', function(event) {
    var target = event.target;
    var link = target && target.closest && target.closest('a[href]');
    if (!link) return;

    var url;
    try {
      url = new URL(link.href, window.location.href);
    } catch (error) {
      return;
    }
    var clickType = getClickType(url);
    if (!clickType) return;

    // Keep each tracker independent so a blocked tag does not hide the other event.
    if (typeof window.gtag === 'function') {
      try {
        window.gtag('event', 'help_site_conversion_click', {
          event_category: 'help_site',
          event_label: link.textContent.trim().slice(0, 100),
          link_url: link.href,
          click_type: clickType
        });
      } catch (error) {}
    }
    if (typeof window.clarity === 'function') {
      try {
        window.clarity('event', clarityEvents[clickType]);
      } catch (error) {}
    }
  });
})();
