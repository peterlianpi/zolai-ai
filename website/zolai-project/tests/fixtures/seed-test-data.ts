import prisma from '@/lib/prisma';
import { createHash } from 'crypto';

/**
 * Seed test data for the testing environment
 * This should only be run in test environments
 */
export async function seedTestData() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Cannot seed test data in production environment');
  }

  console.log('Seeding test data...');

  try {
    // Clean existing test data
    await prisma.user.deleteMany({
      where: {
        email: {
          contains: 'test'
        }
      }
    });

    // Create test users
    const hashedPassword = createHash('sha256').update('TestPassword123!').digest('hex');
    
    // Create test users with accounts for email/password auth
    const testUser = await prisma.user.create({
      data: {
        id: 'test-user-id',
        email: 'test-user@example.com',
        name: 'Test User',
        role: 'USER',
        emailVerified: true,
      }
    });

    // Create account with password for test user
    await prisma.account.create({
      data: {
        id: 'test-user-account-id',
        accountId: 'test-user-account',
        providerId: 'credential',
        userId: testUser.id,
        password: hashedPassword,
      }
    });

    const adminUser = await prisma.user.create({
      data: {
        id: 'admin-user-id',
        email: 'admin@example.com',
        name: 'Admin User', 
        role: 'ADMIN',
        emailVerified: true,
      }
    });

    // Create account with password for admin user  
    await prisma.account.create({
      data: {
        id: 'admin-user-account-id',
        accountId: 'admin-user-account',
        providerId: 'credential',
        userId: adminUser.id,
        password: hashedPassword,
      }
    });

    // Create test content
    const testPost = await prisma.post.create({
      data: {
        title: 'Sample Test Post',
        contentHtml: '<p>This is a sample post for testing purposes.</p>',
        contentRaw: 'This is a sample post for testing purposes.',
        excerpt: 'Sample test post excerpt',
        slug: 'sample-test-post',
        type: 'POST',
        status: 'PUBLISHED',
        authorId: testUser.id,
        publishedAt: new Date(),
      }
    });

    // Create test comments
    await prisma.comment.create({
      data: {
        content: 'This is a test comment',
        postId: testPost.id,
        authorId: testUser.id,
        authorName: testUser.name,
        status: 'APPROVED',
      }
    });

    // Create test media
    await prisma.media.create({
      data: {
        url: 'https://example.com/test-image.jpg',
        mimeType: 'image/jpeg',
        filePath: 'test/test-image.jpg',
        fileSize: 1024000,
        width: 800,
        height: 600,
      }
    });

    // Create site settings
    await prisma.siteSetting.upsert({
      where: { key: 'site_title' },
      update: { value: 'Zolai AI - Test' },
      create: { key: 'site_title', value: 'Zolai AI - Test' }
    });

    await prisma.siteSetting.upsert({
      where: { key: 'site_description' },
      update: { value: 'Test environment for Zolai AI' },
      create: { key: 'site_description', value: 'Test environment for Zolai AI' }
    });

    console.log('Test data seeded successfully');
    console.log(`Created users: ${testUser.email}, ${adminUser.email}`);
    console.log(`Created post: ${testPost.title}`);

  } catch (error) {
    console.error('Error seeding test data:', error);
    throw error;
  }
}

/**
 * Clean up test data after tests
 */
export async function cleanupTestData() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Cannot cleanup test data in production environment');
  }

  console.log('Cleaning up test data...');

  try {
    // Delete in correct order to avoid foreign key constraints
    await prisma.comment.deleteMany({
      where: {
        author: {
          email: {
            contains: 'test'
          }
        }
      }
    });

    await prisma.post.deleteMany({
      where: {
        author: {
          email: {
            contains: 'test'
          }
        }
      }
    });

    await prisma.user.deleteMany({
      where: {
        email: {
          contains: 'test'
        }
      }
    });

    await prisma.media.deleteMany({
      where: {
        filePath: {
          startsWith: 'test/'
        }
      }
    });

    console.log('Test data cleaned up successfully');

  } catch (error) {
    console.error('Error cleaning up test data:', error);
    throw error;
  }
}

// Run seeding if called directly
if (require.main === module) {
  seedTestData()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
