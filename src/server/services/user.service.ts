import { userRepository, type UserFilters } from '@/server/repositories/user.repository'
import { auditRepository } from '@/server/repositories/audit.repository'
import type { UpdateUserInput } from '@/lib/validations/user'

export const userService = {
  async list(filters: UserFilters) {
    return userRepository.findMany(filters)
  },

  async getById(id: string) {
    const user = await userRepository.findById(id)
    if (!user) throw new Error('User not found')
    return user
  },

  async update(id: string, data: UpdateUserInput, organizationId: string, adminId: string) {
    const existing = await userRepository.findById(id)
    if (!existing) throw new Error('User not found')

    const user = await userRepository.update(id, data)

    await auditRepository.create({
      action: 'user.updated',
      entityType: 'User',
      entityId: id,
      userId: adminId,
      organizationId,
      metadata: { changes: data },
    })

    return user
  },

  async delete(id: string, organizationId: string, adminId: string) {
    const existing = await userRepository.findById(id)
    if (!existing) throw new Error('User not found')

    await userRepository.delete(id)

    await auditRepository.create({
      action: 'user.deleted',
      entityType: 'User',
      entityId: id,
      userId: adminId,
      organizationId,
      metadata: { email: existing.email },
    })
  },
}
