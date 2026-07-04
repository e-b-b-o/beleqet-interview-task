import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clean up
  await prisma.notification.deleteMany();
  await prisma.profileBoostReport.deleteMany();
  await prisma.candidateScore.deleteMany();
  await prisma.application.deleteMany();
  await prisma.eventLog.deleteMany();
  await prisma.job.deleteMany();
  await prisma.jobCategory.deleteMany();
  await prisma.company.deleteMany();
  await prisma.user.deleteMany();

  // Create Categories
  const categories = [
    { slug: 'it-software', label: 'IT & Software', icon: 'laptop' },
    { slug: 'marketing', label: 'Marketing', icon: 'megaphone' },
    { slug: 'finance', label: 'Finance', icon: 'landmark' },
    { slug: 'health', label: 'Health', icon: 'heart-pulse' },
    { slug: 'education', label: 'Education', icon: 'graduation-cap' },
    { slug: 'engineering', label: 'Engineering', icon: 'cog' },
    { slug: 'other', label: 'Other', icon: 'more-horizontal' },
  ];

  const categoryMap: Record<string, any> = {};
  for (const cat of categories) {
    categoryMap[cat.slug] = await prisma.jobCategory.create({ data: cat });
  }

  // Create Users (Employers)
  const employers = [
    { email: 'hr@takacash.com', name: 'TakaCash', role: 'EMPLOYER' },
    { email: 'careers@ethiotelecom.et', name: 'ethio telecom', role: 'EMPLOYER' },
    { email: 'jobs@dashenbank.com', name: 'Dashen Bank', role: 'EMPLOYER' },
  ];

  const employerMap: Record<string, any> = {};
  for (const emp of employers) {
    const user = await prisma.user.create({
      data: {
        email: emp.email,
        passwordHash: crypto.createHash('sha256').update('password123').digest('hex'),
        firstName: 'Admin',
        lastName: emp.name,
        role: 'EMPLOYER',
        isActive: true,
        emailVerified: true,
      }
    });

    const company = await prisma.company.create({
      data: {
        name: emp.name,
        userId: user.id,
        verified: true,
      }
    });
    employerMap[emp.name] = company;
  }

  // Create Jobs
  const jobsData = [
    {
      title: "Full Stack Developer",
      company: "TakaCash",
      location: "Addis Ababa",
      type: "FULL_TIME",
      categorySlug: "it-software",
      status: "PUBLISHED",
      featured: true,
      tags: ["React", "Node.js", "PostgreSQL"],
      description: "TakaCash is looking for a Full Stack Developer to build and maintain customer-facing fintech products. You will work across our Next.js front end and Node services, ship features end to end, and collaborate closely with product and design.",
    },
    {
      title: "Digital Marketing Specialist",
      company: "ethio telecom",
      location: "Addis Ababa",
      type: "HYBRID",
      categorySlug: "marketing",
      status: "PUBLISHED",
      featured: true,
      tags: ["SEO", "Paid Ads", "Content"],
      description: "Plan and execute digital campaigns across search, social, and Telegram channels. Own performance reporting and work with the brand team to grow qualified leads.",
    },
    {
      title: "Customer Service Agent",
      company: "Dashen Bank",
      location: "Addis Ababa",
      type: "FULL_TIME",
      categorySlug: "finance",
      status: "PUBLISHED",
      featured: true,
      tags: ["Customer Care", "Banking"],
      description: "Handle customer inquiries across branch and digital channels, resolve account issues, and maintain Dashen Bank's service standards.",
    }
  ];

  for (const job of jobsData) {
    await prisma.job.create({
      data: {
        title: job.title,
        description: job.description,
        location: job.location,
        type: job.type as any,
        status: job.status as any,
        featured: job.featured,
        tags: job.tags,
        categoryId: categoryMap[job.categorySlug].id,
        companyId: employerMap[job.company].id,
      }
    });
  }

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
