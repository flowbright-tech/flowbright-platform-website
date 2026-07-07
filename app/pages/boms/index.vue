<template>
  <div class="space-y-6 max-w-7xl mx-auto">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60 dark:border-slate-800/80">
      <div>
        <h1 class="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <UIcon name="i-heroicons-cog-8-tooth" class="w-7 h-7 text-indigo-500" />
          {{ $t('boms.title') || 'Bill of Materials (BOM)' }}
        </h1>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {{ $t('boms.subtitle') || 'Design assembly structures and formula trees' }}
        </p>
      </div>
    </div>
    <UCard class="glass-panel text-center py-12">
      <div class="max-w-md mx-auto space-y-4">
        <UIcon name="i-heroicons-cog-8-tooth" class="w-12 h-12 text-slate-400 mx-auto" />
        <h2 class="text-lg font-bold text-slate-800 dark:text-white">BOMs Feature Coming Soon</h2>
        <p class="text-sm text-slate-500 dark:text-slate-400">
          We are currently focusing on category management first. Recipe and composition builders are coming soon.
        </p>
      </div>
    </UCard>
  </div>
</template>
