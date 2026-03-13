export function isOrganizationManager(role: string | null | undefined) {
  return role === "owner" || role === "admin"
}

export function canManageOrganization(role: string | null | undefined) {
  return isOrganizationManager(role)
}

export function canManageProject({
  role,
  createdByUserId,
  userId,
}: {
  role: string | null | undefined
  createdByUserId: string
  userId: string
}) {
  return isOrganizationManager(role) || createdByUserId === userId
}
