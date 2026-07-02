// app.config.ts
export default defineAppConfig({
  ui: {
    primary: 'indigo',
    gray: 'slate',
    button: {
      default: {
        color: 'primary',
        loadingIcon: 'i-heroicons-arrow-path-20-solid'
      }
    },
    card: {
      background: 'bg-white dark:bg-slate-900',
      divide: 'divide-y divide-slate-100 dark:divide-slate-800',
      ring: 'ring-1 ring-slate-200 dark:ring-slate-800'
    },
    table: {
      wrapper: 'relative overflow-x-auto',
      base: 'min-w-full table-fixed divide-y divide-slate-200 dark:divide-slate-800',
      tbody: 'divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900',
      th: {
        base: 'text-left rtl:text-right font-semibold text-slate-900 dark:text-white',
        padding: 'px-4 py-3.5',
        color: 'text-slate-900 dark:text-white',
        font: 'font-semibold',
        size: 'text-sm'
      },
      td: {
        base: 'whitespace-nowrap',
        padding: 'px-4 py-3',
        color: 'text-slate-700 dark:text-slate-300',
        size: 'text-sm'
      }
    }
  }
})
