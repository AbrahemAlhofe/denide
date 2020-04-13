module.exports = (page, pagename) => {
  // if we are not in browser enviroment cancel everything
  if ( typeof window !== 'object' ) return page

  // init denide methods
  if ( !window.$__denide__pages ) { window.$__denide__pages = {} }
  if ( !window.$__denide__onPageLoad ) { window.$__denide__onPageLoad = () => {} }

  window.$__denide__pages[pagename] = page
  window.$__denide__currentPage = pagename

  // call on page load
  window.$__denide__onPageLoad(page)
}
