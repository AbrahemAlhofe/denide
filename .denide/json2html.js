var $createElement = (document) => function (tagname, attributes, options) {
  let element = document.createElement(tagname)
  options = Object.assign({
    innerHTML : element.innerHTML
  }, options)

  delete attributes.innerHTML

  for( let attribute in attributes ) {
    const value = attributes[attribute]
    element.setAttribute( attribute, value )
  }

  element.innerHTML = options.innerHTML
  
  return element
}

module.exports = function (json, document, middlewares={}) {

  let createElement = $createElement(document)

  middlewares.push = middlewares.push || function (parent, element) {
    parent.appendChild( element )
  }

  // iterable blocks in json like head and body
  for ( let block in json ) {

    // get elements in block
    let elements = json[ block ]

    // if block what passed is not a body or head
    if ( !document[block] ) {
      throw new Error(`"${block}" is not a block like body or head`)
    }

    // get tagname of each elements in block
    for ( let tagname in elements ) {

      // element is array so we should repeat it
      if ( Array.isArray( elements[tagname] ) ) {

        for ( let attributes of elements[tagname] ) {
          attributes = ( middlewares[tagname] ) ? middlewares[tagname](attributes) : attributes
          middlewares.push(document[block], createElement(tagname, attributes, attributes))
        }

      } else {
        const elm = document.getElementsByTagName(tagname)[0]
        if ( elm ) {
          document[block].replaceChild( createElement(tagname, [], { innerHTML : elements[tagname] }), elm )
        } else {
          document[block].appendChild( createElement(tagname, [], { innerHTML : elements[tagname] }) )
        }
      }

    }

  }
  return document
}
