<script setup lang="ts">
import SectionHeader from "@/components/layout/SectionHeader.vue"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { projects, teamMembers, auditLogs } from "@/examples/data"
</script>

<template>
  <section class="mx-auto flex w-full max-w-[1440px] flex-col gap-5 pb-[var(--app-page-bottom-gap,1rem)]">
    <SectionHeader
      title="Drawbridge"
      subtitle="可复用后台模板"
    />

    <div class="grid gap-3 md:grid-cols-3">
      <Card class="gap-0 p-0">
        <CardHeader>
          <CardTitle class="text-sm">项目模板</CardTitle>
        </CardHeader>
        <CardContent>
          <p class="text-[32px] font-semibold leading-none tabular-nums">{{ projects.length }}</p>
          <p class="mt-2 text-sm text-muted-foreground">TablePage / DetailLayout / FormPage mock</p>
        </CardContent>
      </Card>
      <Card class="gap-0 p-0">
        <CardHeader>
          <CardTitle class="text-sm">成员样例</CardTitle>
        </CardHeader>
        <CardContent>
          <p class="text-[32px] font-semibold leading-none tabular-nums">{{ teamMembers.length }}</p>
          <p class="mt-2 text-sm text-muted-foreground">权限、用户和菜单由 adapter 驱动</p>
        </CardContent>
      </Card>
      <Card class="gap-0 p-0">
        <CardHeader>
          <CardTitle class="text-sm">审计记录</CardTitle>
        </CardHeader>
        <CardContent>
          <p class="text-[32px] font-semibold leading-none tabular-nums">{{ auditLogs.length }}</p>
          <p class="mt-2 text-sm text-muted-foreground">展示可替换的后台通用信息面</p>
        </CardContent>
      </Card>
    </div>

    <Card class="gap-0 p-0">
      <CardHeader>
        <CardTitle class="text-sm">迁移策略</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="grid gap-0 text-sm md:grid-cols-3">
          <div class="border-b border-dashed border-border py-3 md:border-r md:pr-4">
            <p class="font-medium">完整复制视觉基线</p>
            <p class="mt-1 text-muted-foreground">shadcn-vue primitives、shell、table、detail、form 来自 buildguard-admin。</p>
          </div>
          <div class="border-b border-dashed border-border py-3 md:border-r md:px-4">
            <p class="font-medium">删除具体业务</p>
            <p class="mt-1 text-muted-foreground">客户、园区、工单、检测、地图、COS、报告等 API 不进入模板核心。</p>
          </div>
          <div class="border-b border-dashed border-border py-3 md:pl-4">
            <p class="font-medium">保留模板边界</p>
            <p class="mt-1 text-muted-foreground">品牌、菜单、权限、用户、API/Auth adapter 由 Drawbridge 配置接管。</p>
          </div>
        </div>
      </CardContent>
    </Card>
  </section>
</template>
