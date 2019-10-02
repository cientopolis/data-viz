import utils from '@/components/utils'

class NiceTable {
  constructor(id, columns, rows, backend=false) {
    this.setId(id)
    this.setRows(rows)
    this.setColumns(columns)
    this.setBackend(backend)
  }

  getId () {
    return this.id
  }

  setId (id) {
    this.id = id
  }

  getColumns () {
    return this.columns
  }

  getVisibleColumns () {
    return this.columns.filter(column => column.visible == true)
  }

  setColumns (columns) {
    this.columns = columns
  }

  getRows () {
    return this.rows
  }

  setRows (rows) {
    this.rows = rows
  }

  getBackend () {
    return this.backend
  }

  setBackend (backend) {
    this.backend = backend
  }

  static stringColumnsToObjects (columns, rows) {
    let curatedColumns = []
    for (let i = 0; i < columns.length; i++) {
      let column = columns[i]
      let example = this.getExample(column, rows)
      let curatedColumn = {
        'dataIndex': column,
        'title': column,
        'type': this.predictType(column, example, curatedColumns),
        'visible': true
      }
      curatedColumns.push(curatedColumn)
    }
    return curatedColumns
  }

  static getExample (columnIndex, rows, ) {
    let filtered = rows.filter(item => item[columnIndex] !== '' && item[columnIndex] !== null)
    return filtered.length > 0 ? filtered[0][columnIndex] : null
  }

  static predictType (column, example, curatedColumns) {
    if (example) {
      if (utils.isDate(example)) {
        return 'Date'
      }
      if (utils.isCoordinate(example)) {
        if ((column.toLowerCase() === 'lat') || (column.toLowerCase() === 'latitude')) {
          return 'Latitude'
        }
        if ((column.toLowerCase() === 'long') || (column.toLowerCase() === 'lng') || (column.toLowerCase() === 'longitude')) {
          return 'Longitude'
        }
        if (curatedColumns.some(column => column.type == 'Latitude')) {
          return 'Longitude'
        }
        return 'Latitude'
      }
      if (utils.isNumeric(example)) {
        return 'Number'
      }
    }
    // default type
    return 'String'
  }

  static clone (niceTable) {
    return new this(niceTable.id, niceTable.columns, niceTable.rows)
  }
}

export default NiceTable