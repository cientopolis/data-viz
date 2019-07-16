# infovis

### How To Use

Specify columns as an array of objects, each object should have the following properties: title, type and dataIndex. Types could be Latitude, Longitude, String, Number. String columns will be automatically searchables.
Specify data of Table as an array of data.

### Example:

```html
<template>
  <nice-table :columns=columns :data=data />
</template>
<script>
export  default {
  data () {
    return {
      columns: [
        {
          type: 'String',
          title: 'Site name',
          dataIndex: 'site_name'
        },
        {
          type: 'Latitude',
          title: 'Latitude',
          dataIndex: 'latitude'
        },
        {
          type: 'Longitude',
          title: 'Longitude',
          dataIndex: 'longitude'
        },
        {
          type: 'Number',
          title: 'Quality index',
          dataIndex: 'quality_index'
        },
        {
          type: 'Date',
          title: 'Date',
          dataIndex: 'date'
        }
      ],
      data: [
        {
          'site_name': 'SN',
          'latitude': '-35.115974',
          'longitude': '-58.172607',
          'quality_index': 32,
          'date': '30/05/2016'
        },
        {
          'site_name': 'ARROMORA1',
          'latitude': '-34.838684',
          'longitude': '-58.833248',
          'quality_index': 51.3,
          'date': '08/03/2016'
        },
        {
          'site_name': '',
          'latitude': '-34.874893',
          'longitude': '-58.030827',
          'quality_index': 62.5,
          'date': ''
        }
      ]
    }
  }
}
</script>
```

#### Properties

| Property      | Description                       | Type  |
| :---          | :---                              | :---  |
| columns       | Columns of table                  | Array |
| data          | Data record array to be displayed | Array |