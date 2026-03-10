import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create default organization
  const org = await prisma.organization.upsert({
    where: { slug: 'default' },
    update: {},
    create: {
      name: 'ZenPortal Demo',
      slug: 'default',
    },
  })

  // Create users with different roles
  const password = await bcrypt.hash('password123', 12)

  const platformAdmin = await prisma.user.upsert({
    where: { email: 'admin@zenportal.com' },
    update: {},
    create: {
      name: 'Anvith Admin',
      email: 'admin@zenportal.com',
      password,
      role: 'PLATFORM_ADMIN',
      status: 'ACTIVE',
      memberships: { create: { organizationId: org.id, role: 'PLATFORM_ADMIN' } },
    },
  })

  const landlord = await prisma.user.upsert({
    where: { email: 'owner@zenportal.com' },
    update: {},
    create: {
      name: 'John Owner',
      email: 'owner@zenportal.com',
      password,
      role: 'LANDLORD',
      status: 'ACTIVE',
      memberships: { create: { organizationId: org.id, role: 'LANDLORD' } },
    },
  })
  

  const tenant1 = await prisma.user.upsert({
    where: { email: 'tenant1@zenportal.com' },
    update: {},
    create: {
      name: 'Alice Tenant',
      email: 'tenant1@zenportal.com',
      password,
      role: 'TENANT',
      status: 'ACTIVE',
      memberships: { create: { organizationId: org.id, role: 'TENANT' } },
    },
  })

  const tenant2 = await prisma.user.upsert({
    where: { email: 'tenant2@zenportal.com' },
    update: {},
    create: {
      name: 'Bob Tenant',
      email: 'tenant2@zenportal.com',
      password,
      role: 'TENANT',
      status: 'ACTIVE',
      memberships: { create: { organizationId: org.id, role: 'TENANT' } },
    },
  })

  // Create properties
  const property1 = await prisma.property.upsert({
    where: { id: 'prop-1' },
    update: {},
    create: {
      id: 'prop-1',
      name: 'Sunset Apartments',
      address: '123 Sunset Blvd',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90001',
      type: 'RESIDENTIAL',
      status: 'ACTIVE',
      description: 'Beautiful apartment complex with ocean views',
      yearBuilt: 2015,
      totalUnits: 4,
      organizationId: org.id,
      ownerId: landlord.id,
      managerId: platformAdmin.id,
    },
  })

  await prisma.property.upsert({
    where: { id: 'prop-2' },
    update: {},
    create: {
      id: 'prop-2',
      name: 'Downtown Office Plaza',
      address: '456 Main Street',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90002',
      type: 'COMMERCIAL',
      status: 'ACTIVE',
      description: 'Modern office space in the heart of downtown',
      yearBuilt: 2020,
      totalUnits: 3,
      organizationId: org.id,
      ownerId: landlord.id,
      managerId: platformAdmin.id,
    },
  })

  // Create units
  const unit1 = await prisma.unit.upsert({
    where: { propertyId_number: { propertyId: property1.id, number: '101' } },
    update: {},
    create: {
      number: '101',
      floor: 1,
      bedrooms: 2,
      bathrooms: 1,
      sqft: 850,
      rent: 1500,
      deposit: 1500,
      status: 'OCCUPIED',
      propertyId: property1.id,
    },
  })

  const unit2 = await prisma.unit.upsert({
    where: { propertyId_number: { propertyId: property1.id, number: '102' } },
    update: {},
    create: {
      number: '102',
      floor: 1,
      bedrooms: 1,
      bathrooms: 1,
      sqft: 650,
      rent: 1200,
      deposit: 1200,
      status: 'OCCUPIED',
      propertyId: property1.id,
    },
  })

  await prisma.unit.upsert({
    where: { propertyId_number: { propertyId: property1.id, number: '201' } },
    update: {},
    create: {
      number: '201',
      floor: 2,
      bedrooms: 3,
      bathrooms: 2,
      sqft: 1200,
      rent: 2200,
      deposit: 2200,
      status: 'AVAILABLE',
      propertyId: property1.id,
    },
  })

  await prisma.unit.upsert({
    where: { propertyId_number: { propertyId: property1.id, number: '202' } },
    update: {},
    create: {
      number: '202',
      floor: 2,
      bedrooms: 2,
      bathrooms: 2,
      sqft: 950,
      rent: 1800,
      deposit: 1800,
      status: 'MAINTENANCE',
      propertyId: property1.id,
    },
  })

  // Create leases
  const lease1 = await prisma.lease.create({
    data: {
      unitId: unit1.id,
      tenantId: tenant1.id,
      organizationId: org.id,
      startDate: new Date('2025-01-01'),
      endDate: new Date('2026-01-01'),
      monthlyRent: 1500,
      securityDeposit: 1500,
      status: 'ACTIVE',
    },
  })

  await prisma.lease.create({
    data: {
      unitId: unit2.id,
      tenantId: tenant2.id,
      organizationId: org.id,
      startDate: new Date('2025-06-01'),
      endDate: new Date('2026-06-01'),
      monthlyRent: 1200,
      securityDeposit: 1200,
      status: 'ACTIVE',
    },
  })

  // Create maintenance requests
  await prisma.maintenanceRequest.create({
    data: {
      title: 'Leaky faucet in kitchen',
      description: 'The kitchen faucet has been dripping constantly. Water is pooling under the sink.',
      status: 'OPEN',
      priority: 'HIGH',
      category: 'PLUMBING',
      unitId: unit1.id,
      propertyId: property1.id,
      organizationId: org.id,
      requesterId: tenant1.id,
    },
  })

  await prisma.maintenanceRequest.create({
    data: {
      title: 'AC not cooling properly',
      description: 'The air conditioning unit is running but not cooling the apartment effectively.',
      status: 'IN_PROGRESS',
      priority: 'MEDIUM',
      category: 'HVAC',
      unitId: unit2.id,
      propertyId: property1.id,
      organizationId: org.id,
      requesterId: tenant2.id,
      assigneeId: platformAdmin.id,
    },
  })

  await prisma.maintenanceRequest.create({
    data: {
      title: 'Broken window lock',
      description: 'The lock on the bedroom window is broken and the window cannot be secured.',
      status: 'OPEN',
      priority: 'URGENT',
      category: 'STRUCTURAL',
      unitId: unit1.id,
      propertyId: property1.id,
      organizationId: org.id,
      requesterId: tenant1.id,
    },
  })

  // Create announcements
  await prisma.announcement.create({
    data: {
      title: 'Building Maintenance Notice',
      content: 'The building elevator will be undergoing maintenance on March 15-16. Please use the stairs during this period.',
      priority: 'high',
      targetRoles: ['TENANT', 'LANDLORD'],
      organizationId: org.id,
      propertyId: property1.id,
      authorId: platformAdmin.id,
      publishedAt: new Date(),
    },
  })

  await prisma.announcement.create({
    data: {
      title: 'Community BBQ Event',
      content: 'Join us for a community BBQ this Saturday at 2 PM in the courtyard! Food and drinks will be provided.',
      priority: 'normal',
      targetRoles: ['TENANT'],
      organizationId: org.id,
      propertyId: property1.id,
      authorId: platformAdmin.id,
      publishedAt: new Date(),
    },
  })

  // Create audit events
  await prisma.auditEvent.create({
    data: {
      action: 'property.created',
      entityType: 'Property',
      entityId: property1.id,
      userId: platformAdmin.id,
      organizationId: org.id,
      metadata: { name: 'Sunset Apartments' },
    },
  })

  await prisma.auditEvent.create({
    data: {
      action: 'lease.created',
      entityType: 'Lease',
      entityId: lease1.id,
      userId: platformAdmin.id,
      organizationId: org.id,
      metadata: { tenant: 'Alice Tenant', unit: '101' },
    },
  })

  await prisma.auditEvent.create({
    data: {
      action: 'maintenance.created',
      entityType: 'MaintenanceRequest',
      entityId: 'req-1',
      userId: tenant1.id,
      organizationId: org.id,
      metadata: { title: 'Leaky faucet' },
    },
  })

  console.log('Seed completed!')
  console.log('')
  console.log('Login credentials (all use password: password123):')
  console.log('  Platform Admin: admin@zenportal.com')
  console.log('  Landlord:       owner@zenportal.com')
  console.log('  Tenant 1:       tenant1@zenportal.com')
  console.log('  Tenant 2:       tenant2@zenportal.com')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
