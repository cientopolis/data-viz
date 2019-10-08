import utils from '@/utils/types'

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
      let type = this.predictType(column, example, curatedColumns)
      let curatedColumn = {
        'dataIndex': column,
        'title': column,
        'type': type,
        'visible': true
      }
      if (type == utils.date) {
        for (let i = 0; i < utils.dateFormats.length; i++) {
          const format = utils.dateFormats[i]
          if (utils.checkType(example, utils.date, format)) {
            curatedColumn['format'] = format
          }
        }
      }
      curatedColumns.push(curatedColumn)
    }
    return curatedColumns
  }

  static getExample (columnIndex, rows) {
    let filtered = rows.filter(item => item[columnIndex] !== '' && item[columnIndex] !== null)
    return filtered.length > 0 ? filtered[0][columnIndex] : null
  }

  static predictType (column, example, curatedColumns) {
    if (example) {
      if (utils.isDate(example)) {
        return utils.date
      }
      if (utils.isCoordinate(example)) {
        if ((column.toLowerCase() === 'lat') || (column.toLowerCase() === 'latitude')) {
          return utils.lat
        }
        if ((column.toLowerCase() === 'long') || (column.toLowerCase() === 'lng') || (column.toLowerCase() === 'longitude')) {
          return utils.lng
        }
        if (curatedColumns.some(column => column.type == utils.lat)) {
          return utils.lng
        }
        return utils.lat
      }
      if (utils.isNumeric(example)) {
        return utils.number
      }
    }
    // default type
    return utils.text
  }

  static clone (niceTable) {
    return new this(niceTable.id, niceTable.columns, niceTable.rows, niceTable.backend)
  }
}

export default NiceTable