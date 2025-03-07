(function () {
  if (window['turnstile']) return;

  function rewrite([d, e]) {
    const f = d['parentElement'] || d;
    if (!f['id']) {
      f['id'] = 'turnstile-input-' + e['sitekey'];
    }
    if (e['callback']) {
      window['turnstileCallback'] = e['callback'];
    }

    window['registerTurnstileData'] = {
      sitekey: e['sitekey'],
    };

    window.postMessage({
      type: 'registerTurnstile',
      sitekey: e['sitekey'],
    })
  }

  window['turnstile'] = new Proxy(
    {
      render: function () {},
      reset: function () {},
      ready: function () {},
      remove: function () {},
      execute: function () {},
    },
    {
      set: function (target, prop, value, receiver) {
        return Reflect.set(target, prop, value, receiver);
      },
      get: function (target, prop) {
        if (prop === 'render') {
          return new Proxy(target[prop], {
            apply: function (target, thisArg, argArray) {
              rewrite(argArray);
              return target.apply(thisArg, argArray);
            }
          });
        }

        return target[prop];
      },
    }
  )

  window.addEventListener('message', function (event) {
    if (event.data?.type !== 'turnstileSolved') return;

    window?.turnstileCallback(event.data?.token);
  })
})();
