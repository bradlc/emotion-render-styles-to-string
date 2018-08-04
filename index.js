var emotion = require('emotion')

function generateStyleTag(cssKey, ids, styles, nonceString) {
  return (
    '<style data-emotion-' +
    cssKey +
    '="' +
    ids.substring(1) +
    '"' +
    nonceString +
    '>' +
    styles +
    '</style>'
  )
}

function createRenderStylesToString(emotion, nonceString) {
  return function(html) {
    var _emotion$caches = emotion.caches,
      inserted = _emotion$caches.inserted,
      cssKey = _emotion$caches.key,
      registered = _emotion$caches.registered
    var regex = new RegExp('<|' + cssKey + '-([a-zA-Z0-9-]+)', 'gm')
    var seen = {}
    var result = ''
    var globalIds = ''
    var globalStyles = ''

    for (var id in inserted) {
      if (inserted.hasOwnProperty(id)) {
        var style = inserted[id]
        var key = cssKey + '-' + id

        if (style !== true && registered[key] === undefined) {
          globalStyles += style
          globalIds += ' ' + id
        }
      }
    }

    if (globalStyles !== '') {
      result = generateStyleTag(cssKey, globalIds, globalStyles, nonceString)
    }

    var ids = ''
    var styles = ''
    var lastInsertionPoint = 0
    var match

    while ((match = regex.exec(html)) !== null) {
      // $FlowFixMe
      if (match[0] === '<') {
        if (ids !== '') {
          result += generateStyleTag(cssKey, ids, styles, nonceString)
          ids = ''
          styles = ''
        } // $FlowFixMe

        result += html.substring(lastInsertionPoint, match.index) // $FlowFixMe

        lastInsertionPoint = match.index
        continue
      } // $FlowFixMe

      var _id = match[1]
      var _style = inserted[_id]

      if (_style === true || seen[_id]) {
        continue
      }

      seen[_id] = true
      styles += _style
      ids += ' ' + _id
    }

    result += html.substring(lastInsertionPoint)
    return result
  }
}

var nonceString =
  emotion.caches.nonce !== undefined
    ? ' nonce="' + emotion.caches.nonce + '"'
    : ''

module.exports = createRenderStylesToString(emotion, nonceString)
