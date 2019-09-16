/**
 * converts array-like object to array
 * @param  collection the object to be converted
 * @return {Array} the converted object
 */
function arrayify(collection) {
  return Array.prototype.slice.call(collection);
}

/**
 * generates factory functions to convert table rows to objects,
 * based on the titles in the table's <thead>
 * @param  {Array[String]} headings the values of the table's <thead>
 * @return {Function}      a function that takes a table row and spits out an object
 */
function factory(headings) {
  return function(row) {
    return arrayify(row.cells).reduce(function(prev, curr, i) {
      prev[headings[i]] = curr.innerText;
      return prev;
    }, {});
  }
}
/**
 * given a table, generate an array of objects.
 * each object corresponds to a row in the table.
 * each object's key/value pairs correspond to a column's heading and the row's value for that column
 * 
 * @param  {HTMLTableElement} table the table to convert
 * @return {Array[Object]}       array of objects representing each row in the table
 */
function parseHead(table) {
  let headings = arrayify(table.tHead.rows[0].cells).map(function(heading) {
    return heading.innerText;
  })
  return headings
}

function parseTable(table) {
  let headings = parseHead(table)
  return arrayify(table.tBodies[0].rows).map(factory(headings))
}

function parse (table) {
  let columns = parseHead(table)
  //columns = columns.map(column => {
  //  return {
  //    'value': column,
  //    'label': column
  //  }
  //})
  let data = parseTable(table)
  return { columns, data }
}

const getTable = (document, tableId) => {
  console.log('documenttt', document)
  let table = document.querySelector(`#${tableId}`) || document.getElementById(`#${tableId}`)
  if (table) {
    return parse(table)
  } else {
    console.log(`No table with id ${tableId} found`)
    let columns = []
    let data = []
    return { columns, data }
  }
}

export default {
  getTable
}