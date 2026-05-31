import type { PaginatedResponse } from "@/lib/api-client"
import { projects, type ProjectRecord, type ProjectStatus } from "@/examples/data"

export type ProjectPageQuery = {
  keyword?: string
  owner?: string
  status?: ProjectStatus | ""
}

export type ProjectPageRequest = ProjectPageQuery & {
  page: number
  pageSize: number
}

export type ProjectPageResponse = PaginatedResponse<ProjectRecord> & {
  tabCounts: Record<string, number>
}

export async function fetchProjectPage(request: ProjectPageRequest): Promise<ProjectPageResponse> {
  await wait(140)

  const searchableRows = projects
    .filter(project => matchesKeyword(project, request.keyword))
    .filter(project => matchesOwner(project, request.owner))
  const tabCounts = countByStatus(searchableRows)
  const filteredRows = searchableRows
    .filter(project => !request.status || project.status === request.status)
    .sort(compareByLastDeployDesc)
  const page = Math.max(1, request.page)
  const pageSize = Math.max(1, request.pageSize)
  const start = (page - 1) * pageSize

  return {
    data: filteredRows.slice(start, start + pageSize),
    total: filteredRows.length,
    page,
    pageSize,
    tabCounts,
  }
}

function countByStatus(rows: ProjectRecord[]) {
  return rows.reduce<Record<string, number>>((counts, project) => {
    counts[""] += 1
    counts[project.status] += 1
    return counts
  }, {
    "": 0,
    active: 0,
    paused: 0,
    draft: 0,
  })
}

function matchesKeyword(project: ProjectRecord, keyword = "") {
  const normalizedKeyword = keyword.trim().toLowerCase()

  if (!normalizedKeyword) {
    return true
  }

  return [
    project.id,
    project.name,
    project.owner,
    project.lastDeploy,
  ].some(value => value.toLowerCase().includes(normalizedKeyword))
}

function matchesOwner(project: ProjectRecord, owner = "") {
  return !owner.trim() || project.owner === owner.trim()
}

function compareByLastDeployDesc(left: ProjectRecord, right: ProjectRecord) {
  return toTimestamp(right.lastDeploy) - toTimestamp(left.lastDeploy)
}

function toTimestamp(value: string) {
  if (!value || value === "-") {
    return 0
  }

  const timestamp = new Date(value.replace(" ", "T")).getTime()
  return Number.isFinite(timestamp) ? timestamp : 0
}

function wait(duration: number) {
  return new Promise(resolve => window.setTimeout(resolve, duration))
}
