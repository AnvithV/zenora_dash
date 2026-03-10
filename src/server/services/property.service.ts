import { propertyRepository, type PropertyFilters } from '@/server/repositories/property.repository'
import { auditRepository } from '@/server/repositories/audit.repository'
import type { CreatePropertyInput, UpdatePropertyInput } from '@/lib/validations/property'
import type { UserRole } from '@prisma/client'

export const propertyService = {
  async list(filters: PropertyFilters, userRole: UserRole, userId: string) {
    // Scope by role
    if (userRole === 'LANDLORD') {
      filters.ownerId = userId
    }
    return propertyRepository.findMany(filters)
  },

  async getById(id: string, organizationId: string) {
    const property = await propertyRepository.findById(id, organizationId)
    if (!property) throw new Error('Property not found')
    return property
  },

  async create(data: CreatePropertyInput, organizationId: string, userId: string) {
    const property = await propertyRepository.create({
      ...data,
      organization: { connect: { id: organizationId } },
      ...(data.ownerId && { owner: { connect: { id: data.ownerId } } }),
      ...(data.managerId && { manager: { connect: { id: data.managerId } } }),
    })

    await auditRepository.create({
      action: 'property.created',
      entityType: 'Property',
      entityId: property.id,
      userId,
      organizationId,
      metadata: { name: property.name },
    })

    return property
  },

  async update(id: string, data: UpdatePropertyInput, organizationId: string, userId: string) {
    const existing = await propertyRepository.findById(id, organizationId)
    if (!existing) throw new Error('Property not found')

    const updateData: Record<string, unknown> = { ...data }
    if (data.ownerId !== undefined) {
      delete updateData.ownerId
      updateData.owner = data.ownerId ? { connect: { id: data.ownerId } } : { disconnect: true }
    }
    if (data.managerId !== undefined) {
      delete updateData.managerId
      updateData.manager = data.managerId ? { connect: { id: data.managerId } } : { disconnect: true }
    }

    const property = await propertyRepository.update(id, organizationId, updateData)

    await auditRepository.create({
      action: 'property.updated',
      entityType: 'Property',
      entityId: id,
      userId,
      organizationId,
      metadata: { changes: data },
    })

    return property
  },

  async delete(id: string, organizationId: string, userId: string) {
    const existing = await propertyRepository.findById(id, organizationId)
    if (!existing) throw new Error('Property not found')

    await propertyRepository.delete(id, organizationId)

    await auditRepository.create({
      action: 'property.deleted',
      entityType: 'Property',
      entityId: id,
      userId,
      organizationId,
      metadata: { name: existing.name },
    })
  },
}
