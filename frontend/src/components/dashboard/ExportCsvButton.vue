<template>
  <q-btn :loading="loading" color="primary" icon="download" label="Exportar CSV" @click="exportCsv"/>
</template>

<script setup lang="ts">
import { ref } from 'vue'

type CsvRow = Record<string, unknown>

const props = defineProps<{ filename: string; rows: CsvRow[]; columns: Array<{ name: string; label?: string }>; mapper?: (row: CsvRow) => CsvRow }>()
const loading = ref(false)

function toCsvValue(val: unknown): string {
  if (val == null) return ''
  let valueStr = ''
  if (typeof val === 'string') valueStr = val
  else if (typeof val === 'number' || typeof val === 'boolean') valueStr = String(val)
  else if (typeof val === 'object') valueStr = JSON.stringify(val)
  else valueStr = ''
  if (valueStr.includes(',') || valueStr.includes('"') || valueStr.includes('\n')) {
    return '"' + valueStr.replace(/"/g, '""') + '"'
  }
  return valueStr
}

function buildCsv(): string {
  const header = props.columns.map(c => toCsvValue(c.label || c.name)).join(',')
  const body = props.rows.map(r => {
    const mapped = props.mapper ? props.mapper(r) : r
    return props.columns.map(c => toCsvValue(mapped[c.name])).join(',')
  }).join('\n')
  return header + '\n' + body
}

function exportCsv() {
  loading.value = true
  try {
    const csv = buildCsv()
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = props.filename.endsWith('.csv') ? props.filename : (props.filename + '.csv')
    a.click()
    URL.revokeObjectURL(url)
  } finally {
    loading.value = false
  }
}
</script>


