class PrismaClientMock {
  project = {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  }
  
  user = {
    upsert: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
  }
  
  contribution = {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  }
  
  comment = {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  }
  
  $connect = jest.fn()
  $disconnect = jest.fn()
}

// Mock da instância do Prisma
const mockPrismaInstance = new PrismaClientMock()

export const PrismaClient = PrismaClientMock
export default PrismaClientMock
