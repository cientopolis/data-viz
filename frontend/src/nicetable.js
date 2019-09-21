import utils from '@/components/utils'

class NiceTable {
  constructor(id, columns, rows) {
    this.setId(id)
    this.setRows(rows)
    this.setColumns(columns)
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

  static stringColumnsToObjects (columns, rows) {
    let curatedColumns = columns.map(column => {
      let example = this.getExample(column, rows)
      return {
        'dataIndex': column,
        'title': column,
        'type': this.predictType(column, example),
        'visible': true
      }
    })
    return curatedColumns
  }

  static getExample (columnIndex, rows) {
    let filtered = rows.filter(item => item[columnIndex] !== '' && item[columnIndex] !== null)
    return filtered ? filtered[0][columnIndex] : null
  }

  static predictType (column, example) {
    if (utils.isNumeric(example)) {
      return 'Number'
    }
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
      if (this.curatedColumns.some(column => column.type == 'Latitude')) {
        return 'Longitude'
      }
      return 'Latitude'
    }
    return 'String'
  }

  static clone (niceTable) {
    return new this(niceTable.id, niceTable.columns, niceTable.rows)
  }
}

export default NiceTable