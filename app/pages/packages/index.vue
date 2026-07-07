<template>
  <div class="space-y-6 max-w-7xl mx-auto">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60 dark:border-slate-800/80">
      <div>
        <h1 class="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <UIcon name="i-heroicons-gift" class="w-7 h-7 text-indigo-500" />
          {{ $t('packages.title') || 'Package Master' }}
        </h1>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {{ $t('packages.subtitle') || 'Configure multi-pack bundling and commercial packaging metrics' }}
        </p>
      </div>
    </div>
    <UCard class="glass-panel text-center py-12">
      <div class="max-w-md mx-auto space-y-4">
        <UIcon name="i-heroicons-gift" class="w-12 h-12 text-slate-400 mx-auto" />
        <h2 class="text-lg font-bold text-slate-800 dark:text-white">Packages Feature Coming Soon</h2>
        <p class="text-sm text-slate-500 dark:text-slate-400">
          We are currently focusing on category management first. Product bundling definitions will be available in future releases.
        </p>
      </div>
    </UCard>
  </div>
</template>
