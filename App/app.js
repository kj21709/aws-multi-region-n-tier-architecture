(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const status = $('app-status'), form = $('checkout-form'), submit = $('checkout-submit');
  const name = $('borrower-name'), email = $('borrower-email'), retry = $('checkout-retry');
  let books = [], selected = null, draft = null, uncertain = false, busy = false, catalogSequence = 0, operation = 0;
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
  const trim = value => value.replace(/^[ \t\r\n]+|[ \t\r\n]+$/g, '');
  const codepoints = value => [...value].length;
  const config = window.HOMENUB_CONFIG;
  const loopback = ['localhost', '127.0.0.1'].includes(location.hostname);
  function validConfig() {
    if (!config || config.contractVersion !== 1 || config.apiContractMajor !== 1 || typeof config.releaseId !== 'string' || !config.releaseId || config.releaseId.length > 120) return false;
    if (config.environment === 'production') return config.mode === 'api' && config.allowDemo === false && config.siteOrigin === 'https://www.homenub.com' && config.apiBaseUrl === 'https://api.homenub.com' && location.origin === config.siteOrigin;
    if (!loopback || location.protocol !== 'http:' || config.environment !== 'local') return false;
    if (config.mode === 'demo') return config.allowDemo === true && config.siteOrigin === null && config.apiBaseUrl === null;
    const origin = /^http:\/\/(localhost|127\.0\.0\.1)(:[0-9]{1,5})?$/;
    return config.mode === 'api' && config.allowDemo === false && origin.test(config.siteOrigin) && origin.test(config.apiBaseUrl) && config.siteOrigin === location.origin;
  }
  function validEmail(value) {
    if (!/^[\x00-\x7f]+$/.test(value) || value.length > 254 || value.split('@').length !== 2) return false;
    const [local, domain] = value.split('@');
    return local.length >= 1 && local.length <= 64 && /^[A-Za-z0-9.!#$%&'*+\-/=?^_`{|}~]+$/.test(local) && !local.startsWith('.') && !local.endsWith('.') && !local.includes('..') && domain.split('.').length >= 2 && domain.split('.').every(label => /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?$/.test(label));
  }
  function fieldError(input, target, message) {
    input.setAttribute('aria-invalid', String(Boolean(message)));
    $(target).textContent = message;
  }
  function validate() {
    const normalizedName = trim(name.value), normalizedEmail = trim(email.value);
    const nameError = codepoints(name.value) < 1 || codepoints(name.value) > 120 || !normalizedName || /[\u0000-\u001f\u007f-\u009f]/u.test(normalizedName) ? 'Enter your name using 1 to 120 characters without control characters.' : '';
    const emailError = codepoints(email.value) > 254 || !validEmail(normalizedEmail) ? 'Enter a valid email address.' : '';
    fieldError(name, 'name-error', nameError); fieldError(email, 'email-error', emailError);
    if (nameError || emailError) { (nameError ? name : email).focus(); return null; }
    return {borrowerName: normalizedName, borrowerEmail: normalizedEmail};
  }
  function syncControls() {
    const locked = Boolean(draft);
    name.readOnly = locked; email.readOnly = locked;
    submit.disabled = busy || locked || !selected || !selected.checkoutAllowed;
    submit.textContent = busy ? 'Confirming checkout…' : 'Check out this book';
    retry.hidden = !uncertain; retry.disabled = busy;
    $('refresh').disabled = busy;
    form.setAttribute('aria-busy', String(busy));
  }
  function renderBooks(showEmpty = true) {
    const list = $('catalog-list'); list.replaceChildren();
    for (const book of books) {
      const card = document.createElement('article'); card.className = 'book-card' + (selected?.id === book.id ? ' selected' : '');
      const cover = document.createElement('div'); cover.className = 'book-cover'; cover.setAttribute('aria-hidden', 'true'); cover.textContent = 'Homenub Library';
      const title = document.createElement('h3'); title.textContent = book.title;
      const author = document.createElement('p'); author.className = 'author'; author.textContent = book.author;
      const stock = document.createElement('p'); stock.className = 'stock'; stock.textContent = book.checkoutAllowed ? `${book.availableCopies} ${book.availableCopies === 1 ? 'copy' : 'copies'} available` : book.unavailableReason === 'NO_COPIES' ? 'All copies are checked out' : 'Temporarily unavailable';
      const button = document.createElement('button'); button.type = 'button'; button.dataset.testid = 'book-select-button'; button.setAttribute('aria-label', `Select ${book.title} by ${book.author}`); button.disabled = !book.checkoutAllowed || Boolean(draft);
      button.textContent = selected?.id === book.id ? 'Selected' : book.checkoutAllowed ? 'Choose this book' : 'Unavailable';
      button.addEventListener('click', () => { selected = book; $('selection').textContent = `${book.title} — ${book.author}`; renderBooks(); syncControls(); name.focus(); });
      card.append(cover, title, author, stock, button); list.append(card);
    }
    if (!books.length) { const empty = document.createElement('p'); empty.textContent = showEmpty ? 'The shelf is empty for now. Please check back soon.' : 'Books are unavailable right now. Refresh to try again.'; list.append(empty); }
  }
  function validCatalog(value) {
    const ids = new Set();
    return value && Array.isArray(value.books) && ['AVAILABLE','LIMITED','UNAVAILABLE'].includes(value.checkoutStatus) && value.books.every(book => {
      if (!Number.isInteger(book.id) || book.id < 1 || book.id > 2147483647 || ids.has(book.id)) return false;
      ids.add(book.id);
      return typeof book.title === 'string' && codepoints(book.title) >= 1 && codepoints(book.title) <= 300 && typeof book.author === 'string' && codepoints(book.author) >= 1 && codepoints(book.author) <= 200 && Number.isInteger(book.availableCopies) && book.availableCopies >= 0 && typeof book.checkoutAllowed === 'boolean' && (book.checkoutAllowed ? book.availableCopies > 0 && book.unavailableReason === null : book.availableCopies === 0 && ['NO_COPIES','TEMPORARILY_UNAVAILABLE'].includes(book.unavailableReason));
    });
  }
  function validResult(value) {
    if (!value || !uuidPattern.test(value.checkoutReference) || value.checkoutReference === draft?.checkoutRequestId || !value.book || value.book.id !== draft?.bookId || typeof value.book.title !== 'string' || !value.book.title || codepoints(value.book.title)>300 || typeof value.book.author !== 'string' || !value.book.author || codepoints(value.book.author)>200) return false;
    if (typeof value.checkedOutAt !== 'string' || !/Z$/.test(value.checkedOutAt) || !/^\d{4}-\d{2}-\d{2}$/.test(value.dueDate)) return false;
    const checked = new Date(value.checkedOutAt);
    if (!Number.isFinite(checked.valueOf())) return false;
    const due = new Date(Date.UTC(checked.getUTCFullYear(), checked.getUTCMonth(), checked.getUTCDate() + 14));
    return due.toISOString().slice(0,10) === value.dueDate;
  }
  const demoBooks = Array.from({length:100}, (_, i) => ({id:i+1,title:`Sample Book ${String(i+1).padStart(3,'0')}`,author:'Homenub Sample Author',availableCopies:1,checkoutAllowed:true,unavailableReason:null}));
  const demoLoans = new Map();
  async function request(path, payload) {
    if (config.mode === 'demo') {
      await new Promise(resolve => setTimeout(resolve, 180));
      if (!payload) return {ok:true,status:200,value:{books:structuredClone(demoBooks),checkoutStatus:'AVAILABLE'},contract:true};
      if (demoLoans.has(payload.checkoutRequestId)) return {ok:true,status:200,value:demoLoans.get(payload.checkoutRequestId),contract:true};
      const book = demoBooks.find(item => item.id === payload.bookId);
      if (!book?.availableCopies) return {ok:false,status:409,value:{error:{code:'BOOK_UNAVAILABLE',outcome:'NOT_CREATED',retryable:false,message:'No demo copies remain.'}},contract:true};
      const now = new Date(), due = new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),now.getUTCDate()+14));
      const value = {checkoutReference:crypto.randomUUID(),book:{id:book.id,title:book.title,author:book.author},checkedOutAt:now.toISOString(),dueDate:due.toISOString().slice(0,10)};
      book.availableCopies = 0; book.checkoutAllowed = false; book.unavailableReason = 'NO_COPIES'; demoLoans.set(payload.checkoutRequestId,value);
      return {ok:true,status:201,value,contract:true};
    }
    const controller = new AbortController(), timeout = setTimeout(() => controller.abort(),15000);
    try {
      const response = await fetch(config.apiBaseUrl + path,{method:payload?'POST':'GET',cache:'no-store',credentials:'omit',headers:payload?{'Content-Type':'application/json'}:{},body:payload?JSON.stringify(payload):undefined,signal:controller.signal});
      const value = await response.json();
      return {ok:response.ok,status:response.status,value,contract:response.headers.get('X-Homenub-Contract-Version')==='1' && response.headers.get('Cache-Control')?.includes('no-store'),retryAfter:response.headers.get('Retry-After')};
    } finally {clearTimeout(timeout);}
  }
  async function loadCatalog() {
    const sequence = ++catalogSequence; $('catalog-list').setAttribute('aria-busy','true'); status.textContent = 'Loading the bookshelf…';
    try {
      const result = await request('/books');
      if (sequence !== catalogSequence) return;
      if (!result.ok || !result.contract || !validCatalog(result.value)) throw new Error('catalog');
      books = result.value.books;
      if (selected) selected = books.find(book => book.id === selected.id) || selected;
      renderBooks(); syncControls(); status.textContent = result.value.checkoutStatus === 'UNAVAILABLE' ? 'Checkout is temporarily unavailable. You can still browse.' : result.value.checkoutStatus === 'LIMITED' ? 'Some books are temporarily unavailable.' : `${books.length} books on the shelf.`;
    } catch {
      if (sequence !== catalogSequence) return;
      books = []; renderBooks(false); status.textContent = 'We couldn’t load the books. Choose Refresh books to try again.';
      if (!draft) {selected = null; syncControls();}
    } finally {if (sequence === catalogSequence) $('catalog-list').setAttribute('aria-busy','false');}
  }
  async function performCheckout() {
    if (busy || !draft) return;
    const submitted = draft, token = ++operation; busy = true; syncControls(); $('checkout-status').textContent = 'Confirming your checkout. Please wait…';
    try {
      const result = await request('/checkouts',submitted);
      if (token !== operation || submitted !== draft) return;
      if (result.ok && result.contract && [200,201].includes(result.status) && validResult(result.value)) {
        $('confirmed-book').textContent = result.value.book.title;
        const [year,month,day] = result.value.dueDate.split('-');
        $('due-date').textContent = new Intl.DateTimeFormat('en',{dateStyle:'long',timeZone:'UTC'}).format(new Date(Date.UTC(Number(year),Number(month)-1,Number(day))));
        $('reference').textContent = result.value.checkoutReference;
        form.hidden = true; $('confirmation').hidden = false; $('confirmation').focus();
        $('checkout-status').textContent = 'Checkout confirmed.'; uncertain = false; await loadCatalog(); return;
      }
      const error = result.value?.error;
      if (!result.ok && result.contract && error && error.outcome === 'NOT_CREATED' && !uncertain && [400,404,409,413,415].includes(result.status)) {
        draft = null; renderBooks(); $('checkout-status').textContent = error.code === 'BOOK_UNAVAILABLE' ? 'This copy was just checked out. Please choose another book.' : error.code === 'BOOK_NOT_FOUND' ? 'This book is no longer available.' : 'Check your name, email and selected book, then try again.';
        if ([404,409].includes(result.status)) {selected = null; await loadCatalog();}
      } else {
        uncertain = true;
        $('checkout-status').textContent = error?.code === 'REQUEST_CONFLICT' ? 'We could not confirm this request. Keep these details and contact the library. Do not start another checkout.' : 'Your checkout may have completed. Keep these details and choose Retry same checkout to safely check again.';
        if (error?.code === 'REQUEST_CONFLICT') retry.dataset.conflict = 'true';
        const seconds = Number(result.retryAfter); if (Number.isInteger(seconds) && seconds >= 1 && seconds <= 60) retry.dataset.after = String(Date.now()+seconds*1000);
      }
    } catch {
      if (token !== operation || submitted !== draft) return;
      uncertain = true; $('checkout-status').textContent = 'Your checkout may have completed. Keep these details and choose Retry same checkout to safely check again.';
    } finally {
      if (token === operation) {busy = false; syncControls(); if (uncertain) {retry.disabled = retry.dataset.conflict === 'true'; retry.focus();} else if (!form.hidden) name.focus();}
    }
  }
  form.addEventListener('submit', event => {
    event.preventDefault(); if (busy || draft || !selected?.checkoutAllowed) return;
    const values = validate(); if (!values) return;
    draft = Object.freeze({...values,bookId:selected.id,checkoutRequestId:crypto.randomUUID()}); uncertain = false; renderBooks(); performCheckout();
  });
  retry.addEventListener('click', () => {if (retry.dataset.conflict === 'true') return; if (Date.now()<Number(retry.dataset.after||0)) {$('checkout-status').textContent='Please wait a moment before retrying the same checkout.';return;} performCheckout();});
  $('refresh').addEventListener('click',loadCatalog);
  $('new-checkout').addEventListener('click', () => {operation++; draft=null; uncertain=false; selected=null; delete retry.dataset.conflict; delete retry.dataset.after; name.value=''; email.value=''; $('confirmation').hidden=true;form.hidden=false;$('selection').textContent='Select a book from the shelf.';$('checkout-status').textContent='';renderBooks();syncControls();$('refresh').focus();});
  if (!validConfig()) {status.textContent='Library configuration is unavailable. Please try again later.'; $('refresh').disabled=true; name.disabled=true;email.disabled=true;return;}
  $('demo-notice').hidden=config.mode!=='demo'; loadCatalog();
})();
