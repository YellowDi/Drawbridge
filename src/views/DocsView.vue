<script setup lang="ts">
import { docsSections } from "@/content/docs"
</script>

<template>
  <section class="mx-auto grid w-full max-w-[1320px] gap-4 xl:grid-cols-[280px_minmax(0,1fr)]">
    <aside class="sticky top-4 hidden h-[calc(100dvh-96px)] rounded-lg bg-card p-3 shadow-[var(--shadow-panel)] xl:block">
      <nav class="scrollbar-thin h-full space-y-1 overflow-y-auto" aria-label="文档目录">
        <a
          v-for="section in docsSections"
          :key="section.id"
          :href="`#${section.id}`"
          class="flex min-h-9 items-center rounded-md px-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          {{ section.title }}
        </a>
      </nav>
    </aside>

    <div class="space-y-4">
      <section class="rounded-lg bg-card p-5 shadow-[var(--shadow-panel)]">
        <p class="text-sm font-medium text-primary">Drawbridge Docs</p>
        <h2 class="mt-2 text-2xl font-semibold text-balance">可复用后台管理模板文档</h2>
        <p class="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground text-pretty">
          本页面随应用一起部署，覆盖安装、配置、页面扩展、API/权限接入和从现有后台抽离的边界。后续项目可以直接把这里作为开发手册维护。
        </p>
      </section>

      <article
        v-for="section in docsSections"
        :id="section.id"
        :key="section.id"
        class="scroll-mt-20 rounded-lg bg-card p-5 shadow-[var(--shadow-panel)]"
      >
        <h3 class="text-lg font-semibold text-balance">{{ section.title }}</h3>
        <p class="mt-2 text-sm leading-6 text-muted-foreground text-pretty">{{ section.summary }}</p>

        <ul class="mt-4 grid gap-2">
          <li v-for="point in section.points" :key="point" class="flex gap-2 text-sm leading-6">
            <i class="ri-checkbox-circle-line mt-1 text-base text-primary" />
            <span class="min-w-0 text-pretty">{{ point }}</span>
          </li>
        </ul>

        <pre v-if="section.code" class="mt-4 overflow-x-auto rounded-lg bg-[#151515] p-4 text-sm leading-6 text-[#f3f3ef]"><code>{{ section.code }}</code></pre>
      </article>
    </div>
  </section>
</template>
