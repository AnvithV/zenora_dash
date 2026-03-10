import { unitRepository, type UnitFilters } from '@/server/repositories/unit.repository'
import { auditRepository } from '@/server/repositories/audit.repository'
import type { CreateUnitInput, UpdateUnitInput } from '@/lib/validations/unit'

export const unitService = {
  async list(filters: UnitFilters) {
    return unitRepository.findMany(filters)
  },

  async getById(id: string, organizationId: string) {
    const unit = await unitRepository.findById(id, organizationId)
    if (!unit) throw new Error('Unit not found')
    return unit
  },

  async create(data: CreateUnitInput, organizationId: string, userId: string) {
    const unit = await unitRepository.create({
      number: data.number,
      floor: data.floor,
      bedrooms: data.bedrooms,
      bathrooms: data.bathrooms,
      sqft: data.sqft,
      rent: data.rent,
      deposit: data.deposit,
      status: data.status,
      features: data.features,
      property: { connect: { id: data.propertyId } },
    })

    await auditRepository.create({
      action: 'unit.created',
      entityType: 'Unit',
      entityId: unit.id,
      userId,
      organizationId,
      metadata: { number: unit.number, propertyId: data.propertyId },
    })

    return unit
  },

  async update(id: string, data: UpdateUnitInput, organizationId: string, userId: string) {
    const existing = await unitRepository.findById(id, organizationId)
    if (!existing) throw new Error('Unit not found')

    const unit = await unitRepository.update(id, data)

    await auditRepository.create({
      action: 'unit.updated',
      entityType: 'Unit',
      entityId: id,
      userId,
      organizationId,
      metadata: { changes: data },
    })

    return unit
  },

  async delete(id: string, organizationId: string, userId: string) {
    const existing = await unitRepository.findById(id, organizationId)
    if (!existing) throw new Error('Unit not found')

    await unitRepository.delete(id)

    await auditRepository.create({
      action: 'unit.deleted',
      entityType: 'Unit',
      entityId: id,
      userId,
      organizationId,
      metadata: { number: existing.number },
    })
  },
}
