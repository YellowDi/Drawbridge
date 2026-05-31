<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref, watch } from "vue"
import { useRoute, useRouter } from "vue-router"
import { toast } from "vue-sonner"

import FormDatePicker from "@/components/form/FormDatePicker.vue"
import FormFieldSection from "@/components/form/FormFieldSection.vue"
import FormPage from "@/components/form/FormPage.vue"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { getProjectById } from "@/examples/data"

type ProjectFormState = {
  name: string
  code: string
  owner: string
  team: string
  status: "active" | "paused" | "draft"
  launchDate: string
  visibility: "team" | "workspace" | "private"
  apiMode: "mock" | "adapter" | "remote"
  enableAudit: boolean
  description: string
}

type QuickNavItem = {
  id: string
  label: string
}

const STICKY_HEADER_OFFSET = 112

const quickNavItems: QuickNavItem[] = [
  { id: "section-project-name", label: "项目名称" },
  { id: "section-project-code", label: "项目编号" },
  { id: "section-owner", label: "负责人" },
  { id: "section-team", label: "所属团队" },
  { id: "section-status", label: "初始状态" },
  { id: "section-launch-date", label: "上线日期" },
  { id: "section-visibility", label: "可见范围" },
  { id: "section-api-mode", label: "API 接入" },
  { id: "section-audit", label: "审计日志" },
  { id: "section-description", label: "模板说明" },
]

const teamOptions = [
  { value: "platform", label: "平台组" },
  { value: "operations", label: "运营组" },
  { value: "delivery", label: "交付组" },
]

const route = useRoute()
const router = useRouter()
const project = computed(() => getProjectById(String(route.params.id ?? "")))
const isEdit = computed(() => route.name === "project-edit")
const activeNavId = ref(quickNavItems[0]?.id ?? "")
const loadingContext = ref(false)
const contextError = ref("")
const submitting = ref(false)
const form = reactive<ProjectFormState>(createInitialForm())
const initialForm = ref<ProjectFormState>(cloneForm(form))
const formDisabled = computed(() => loadingContext.value || submitting.value || Boolean(contextError.value))
const canSubmit = computed(() =>
  Boolean(
    form.name.trim()
      && form.code.trim()
      && form.owner.trim()
      && form.team
      && form.status
      && form.launchDate
      && !contextError.value
      && !loadingContext.value
      && !submitting.value,
  ),
)
let latestRequestId = 0

onMounted(() => {
  void loadFormContext()
})

watch(
  () => route.fullPath,
  () => {
    void loadFormContext()
  },
)

async function loadFormContext() {
  const requestId = ++latestRequestId
  loadingContext.value = true
  contextError.value = ""

  await new Promise(resolve => window.setTimeout(resolve, 260))

  if (requestId !== latestRequestId) {
    return
  }

  if (isEdit.value && !project.value) {
    contextError.value = "未找到当前项目，无法编辑。"
  }

  hydrateForm(createInitialForm())
  initialForm.value = cloneForm(form)
  loadingContext.value = false
}

function createInitialForm(): ProjectFormState {
  const currentProject = project.value
  return {
    name: currentProject?.name ?? "",
    code: currentProject?.id ?? "prj-next",
    owner: currentProject?.owner ?? "",
    team: "platform",
    status: (currentProject?.status as ProjectFormState["status"] | undefined) ?? "draft",
    launchDate: "2026-06-15",
    visibility: "workspace",
    apiMode: "mock",
    enableAudit: true,
    description: "这是一个用于展示 Drawbridge 表单能力的 mock 记录。真实项目可在此替换为业务字段和提交接口。",
  }
}

function cloneForm(value: ProjectFormState): ProjectFormState {
  return { ...value }
}

function hydrateForm(nextForm: ProjectFormState) {
  Object.assign(form, nextForm)
}

function handleFocus(sectionId: string) {
  activeNavId.value = sectionId
}

function scrollToSection(id: string) {
  activeNavId.value = id
  const section = document.getElementById(id)

  if (!section) {
    return
  }

  const rect = section.getBoundingClientRect()
  const top = rect.top + window.scrollY - STICKY_HEADER_OFFSET
  window.scrollTo({ top: Math.max(0, top), behavior: "smooth" })

  void nextTick(() => {
    const focusable = section.querySelector<HTMLElement>(
      'input:not([type=hidden]):not([disabled]), textarea:not([disabled]), button:not([disabled])',
    )
    focusable?.focus({ preventScroll: true })
  })
}

function handleReset() {
  hydrateForm(initialForm.value)
  toast.success("表单已恢复到初始状态")
}

function handleHeaderAction(key: string) {
  if (key === "preview") {
    if (contextError.value) {
      return
    }

    toast.info("预览入口已保留，真实项目可打开详情预览或抽屉。")
  }
}

async function submit() {
  if (!canSubmit.value) {
    toast.error("请补全必填信息")
    return
  }

  submitting.value = true
  try {
    await new Promise(resolve => window.setTimeout(resolve, 320))

    const targetId = project.value?.id ?? "prj-1024"
    toast.success(isEdit.value ? "项目已更新" : "项目已创建", {
      description: "当前为模板 mock 表单，后续可替换为真实 API 提交。",
    })
    void router.push(`/projects/${targetId}`)
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <FormPage
    :title="isEdit ? '编辑项目' : '新建项目'"
    back-to="/projects"
    max-width="lg"
    :saving="submitting"
    :loading="loadingContext"
    :submit-disabled="!canSubmit"
    :error="contextError"
    :submit-label="isEdit ? '更新项目' : '创建项目'"
    :submit-icon="isEdit ? 'ri-save-3-line' : 'ri-add-line'"
    :secondary-actions="[
      { key: 'preview', label: '预览详情', icon: 'ri-eye-line' },
      { key: 'reset', label: '重置表单' },
    ]"
    :reset-dialog="{ description: '当前已填写的项目信息都会恢复到初始状态，此操作不可撤销。' }"
    notice-title="模板表单参考"
    notice-description="该页面按 buildguard-admin 表单模式重建：分段字段、说明列、右侧快速导航和 sticky 表头，数据仍为本地 mock。"
    :quick-nav-items="quickNavItems"
    :active-quick-nav-id="activeNavId"
    @action="handleHeaderAction"
    @reset="handleReset"
    @quick-nav-select="scrollToSection"
    @submit="submit"
  >
    <FormFieldSection
      id="section-project-name"
      quick-nav-label="项目名称"
      label="项目名称"
      label-for="project-name"
      description="用于列表、详情和面包屑展示。建议使用能被团队快速识别的名称。"
    >
      <Input
        id="project-name"
        v-model="form.name"
        required
        :disabled="formDisabled"
        placeholder="例如：Operations Admin"
        class="w-full"
        @focus="handleFocus('section-project-name')"
      />
    </FormFieldSection>

    <FormFieldSection
      id="section-project-code"
      quick-nav-label="项目编号"
      label="项目编号"
      label-for="project-code"
      description="模板中只用于展示，真实项目可换成后端生成的唯一编码。"
    >
      <Input
        id="project-code"
        v-model="form.code"
        required
        :disabled="formDisabled"
        placeholder="例如：prj-2048"
        class="w-full font-mono"
        @focus="handleFocus('section-project-code')"
      />
    </FormFieldSection>

    <FormFieldSection
      id="section-owner"
      quick-nav-label="负责人"
      label="负责人"
      label-for="project-owner"
      description="后续项目可以把自由输入替换为成员选择器或远程搜索。"
    >
      <Input
        id="project-owner"
        v-model="form.owner"
        required
        :disabled="formDisabled"
        placeholder="负责人姓名"
        class="w-full"
        @focus="handleFocus('section-owner')"
      />
    </FormFieldSection>

    <FormFieldSection
      id="section-team"
      quick-nav-label="所属团队"
      label="所属团队"
      label-for="project-team"
      description="展示 Select 原语和分段说明列的组合方式。"
    >
      <Select v-model="form.team" :disabled="formDisabled">
        <SelectTrigger id="project-team" class="w-full" @focus="handleFocus('section-team')">
          <SelectValue placeholder="请选择团队" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem
            v-for="option in teamOptions"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </SelectItem>
        </SelectContent>
      </Select>
    </FormFieldSection>

    <FormFieldSection
      id="section-status"
      quick-nav-label="初始状态"
      label="初始状态"
      label-for="project-status"
    >
      <Select v-model="form.status" :disabled="formDisabled">
        <SelectTrigger id="project-status" class="w-full" @focus="handleFocus('section-status')">
          <SelectValue placeholder="请选择状态" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="active">运行中</SelectItem>
          <SelectItem value="paused">已暂停</SelectItem>
          <SelectItem value="draft">草稿</SelectItem>
        </SelectContent>
      </Select>
    </FormFieldSection>

    <FormFieldSection
      id="section-launch-date"
      quick-nav-label="上线日期"
      label="上线日期"
      label-for="project-launch-date"
      description="使用原项目日期选择器，后续可接入时区和格式化策略。"
    >
      <FormDatePicker
        id="project-launch-date"
        v-model="form.launchDate"
        :disabled="formDisabled"
        placeholder="请选择上线日期"
        @focus="handleFocus('section-launch-date')"
      />
    </FormFieldSection>

    <FormFieldSection
      id="section-visibility"
      quick-nav-label="可见范围"
      label="可见范围"
      label-for="project-visibility"
      description="展示业务无关的访问范围配置，真实项目可绑定权限模型。"
    >
      <Select v-model="form.visibility" :disabled="formDisabled">
        <SelectTrigger id="project-visibility" class="w-full" @focus="handleFocus('section-visibility')">
          <SelectValue placeholder="请选择可见范围" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="workspace">整个工作空间</SelectItem>
          <SelectItem value="team">仅所属团队</SelectItem>
          <SelectItem value="private">仅负责人</SelectItem>
        </SelectContent>
      </Select>
    </FormFieldSection>

    <FormFieldSection
      id="section-api-mode"
      quick-nav-label="API 接入"
      label="API 接入"
      label-for="project-api-mode"
      description="用于演示模板从 mock 过渡到 adapter 或真实远程接口的边界。"
    >
      <Select v-model="form.apiMode" :disabled="formDisabled">
        <SelectTrigger id="project-api-mode" class="w-full" @focus="handleFocus('section-api-mode')">
          <SelectValue placeholder="请选择 API 模式" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="mock">本地 mock</SelectItem>
          <SelectItem value="adapter">项目 adapter</SelectItem>
          <SelectItem value="remote">远程 API</SelectItem>
        </SelectContent>
      </Select>
    </FormFieldSection>

    <FormFieldSection
      id="section-audit"
      quick-nav-label="审计日志"
      label="审计日志"
      description="展示开关类配置在横向分段表单中的排布。"
    >
      <div class="flex h-9 items-center justify-end">
        <Switch
          :checked="form.enableAudit"
          :disabled="formDisabled"
          @update:checked="form.enableAudit = Boolean($event)"
          @focus="handleFocus('section-audit')"
        />
      </div>
    </FormFieldSection>

    <FormFieldSection
      id="section-description"
      quick-nav-label="模板说明"
      label="模板说明"
      label-for="project-description"
      description="记录此页面如何作为真实项目的起点。"
      align="start"
      last
    >
      <Textarea
        id="project-description"
        v-model="form.description"
        :disabled="formDisabled"
        rows="5"
        placeholder="填写模板使用说明"
        class="min-h-28 resize-y"
        @focus="handleFocus('section-description')"
      />
    </FormFieldSection>
  </FormPage>
</template>
