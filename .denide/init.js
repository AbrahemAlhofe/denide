module.exports = (page) => {
  // if we are not in browser enviroment cancel everything
  if ( typeof window !== 'object' ) return page

  // init denide methods
  if ( !window.$__denide__pages ) { window.$__denide__pages = {} }
  if ( !window.$__denide__onPageLoad ) { window.$__denide__onPageLoad = () => {} }

  // submit page to pages
  window.$__denide__pages[page.name] = page

  // call on page load
  window.$__denide__onPageLoad(page)

}
