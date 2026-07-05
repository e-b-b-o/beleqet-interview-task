import { PrismaClient, JobType, JobStatus, ApplicationStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const hashPassword = (password: string) => bcrypt.hashSync(password, 12);

async function main() {
  console.log('Seeding database...');

  // Clean up existing data to ensure a clean state
  await prisma.notification.deleteMany();
  await prisma.profileBoostReport.deleteMany();
  await prisma.candidateScore.deleteMany();
  await prisma.application.deleteMany();
  await prisma.jobQuestion.deleteMany();
  await prisma.job.deleteMany();
  await prisma.jobCategory.deleteMany();
  await prisma.company.deleteMany();
  await prisma.user.deleteMany();

  console.log('Cleaned up old data.');

  // 1. Create Categories
  const categoriesData = [
    { slug: 'it-software', label: 'IT & Software', icon: 'laptop' },
    { slug: 'marketing', label: 'Marketing', icon: 'megaphone' },
    { slug: 'finance', label: 'Finance & Banking', icon: 'landmark' },
    { slug: 'health', label: 'Healthcare', icon: 'heart-pulse' },
    { slug: 'education', label: 'Education', icon: 'graduation-cap' },
    { slug: 'engineering', label: 'Engineering', icon: 'cog' },
    { slug: 'design', label: 'Design & Creative', icon: 'palette' },
    { slug: 'sales', label: 'Sales', icon: 'briefcase' },
    { slug: 'hr', label: 'Human Resources', icon: 'users' },
  ];

  const categories: Record<string, any> = {};
  for (const cat of categoriesData) {
    categories[cat.slug] = await prisma.jobCategory.create({ data: cat });
  }

  // 2. Create Employers (Companies + Recruiter Users)
  const employersData = [
    { email: 'hr@takacash.com', name: 'TakaCash', industry: 'FinTech', location: 'Addis Ababa' },
    { email: 'careers@ethiotelecom.et', name: 'Ethio Telecom', industry: 'Telecommunications', location: 'Addis Ababa' },
    { email: 'jobs@dashenbank.com', name: 'Dashen Bank', industry: 'Banking', location: 'Addis Ababa' },
    { email: 'hr@safaricom.et', name: 'Safaricom Ethiopia', industry: 'Telecommunications', location: 'Addis Ababa' },
    { email: 'recruitment@ethiopianairlines.com', name: 'Ethiopian Airlines', industry: 'Aviation', location: 'Addis Ababa' },
    { email: 'careers@gebeya.com', name: 'Gebeya Inc.', industry: 'IT Services', location: 'Addis Ababa' },
    { email: 'jobs@awashbank.com', name: 'Awash Bank', industry: 'Banking', location: 'Addis Ababa' },
    { email: 'hr@min-health.gov.et', name: 'Ministry of Health', industry: 'Government', location: 'Addis Ababa' },
  ];

  const companies: any[] = [];
  for (const emp of employersData) {
    const user = await prisma.user.create({
      data: {
        email: emp.email,
        passwordHash: hashPassword('password123'),
        firstName: 'HR',
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
        industry: emp.industry,
        location: emp.location,
        description: `Leading company in the ${emp.industry} sector, providing top-notch services and empowering the workforce in ${emp.location}.`,
      }
    });
    companies.push(company);
  }

  // 3. Create Job Seekers
  const jobSeekersData = [
    { email: 'abebe.kebede@example.com', first: 'Abebe', last: 'Kebede', title: 'Senior Software Engineer', skills: ['React', 'Node.js', 'TypeScript'] },
    { email: 'chaltu.bekele@example.com', first: 'Chaltu', last: 'Bekele', title: 'Marketing Manager', skills: ['SEO', 'Content Strategy', 'Social Media'] },
    { email: 'dawit.alemayehu@example.com', first: 'Dawit', last: 'Alemayehu', title: 'Financial Analyst', skills: ['Excel', 'Financial Modeling', 'Accounting'] },
    { email: 'sara.tesfaye@example.com', first: 'Sara', last: 'Tesfaye', title: 'UX/UI Designer', skills: ['Figma', 'Adobe XD', 'Prototyping'] },
    { email: 'yosef.girma@example.com', first: 'Yosef', last: 'Girma', title: 'DevOps Engineer', skills: ['AWS', 'Docker', 'Kubernetes'] },
  ];

  const jobSeekers: any[] = [];
  for (const seeker of jobSeekersData) {
    const user = await prisma.user.create({
      data: {
        email: seeker.email,
        passwordHash: hashPassword('password123'),
        firstName: seeker.first,
        lastName: seeker.last,
        role: 'JOB_SEEKER',
        isActive: true,
        emailVerified: true,
        headline: seeker.title,
        skills: seeker.skills,
        bio: `I am a passionate ${seeker.title} with experience in ${seeker.skills.join(', ')}. Looking for exciting opportunities to grow and contribute.`
      }
    });
    jobSeekers.push(user);
  }

  // 4. Create ~50 Jobs
  console.log('Generating jobs...');
  const jobTemplates = [
    { title: 'Frontend Developer', slug: 'it-software', type: JobType.FULL_TIME, tags: ['React', 'CSS', 'JavaScript'] },
    { title: 'Backend Engineer', slug: 'it-software', type: JobType.FULL_TIME, tags: ['Node.js', 'PostgreSQL', 'API'] },
    { title: 'Full Stack Developer', slug: 'it-software', type: JobType.HYBRID, tags: ['Next.js', 'NestJS', 'TypeScript'] },
    { title: 'Data Scientist', slug: 'it-software', type: JobType.FULL_TIME, tags: ['Python', 'Machine Learning', 'SQL'] },
    { title: 'DevOps Specialist', slug: 'it-software', type: JobType.REMOTE, tags: ['AWS', 'CI/CD', 'Docker'] },
    { title: 'Marketing Executive', slug: 'marketing', type: JobType.FULL_TIME, tags: ['Digital Marketing', 'SEO', 'Campaigns'] },
    { title: 'Social Media Manager', slug: 'marketing', type: JobType.PART_TIME, tags: ['Facebook', 'Instagram', 'Content Creation'] },
    { title: 'Financial Analyst', slug: 'finance', type: JobType.FULL_TIME, tags: ['Excel', 'Reporting', 'Analysis'] },
    { title: 'Bank Branch Manager', slug: 'finance', type: JobType.FULL_TIME, tags: ['Management', 'Operations', 'Banking'] },
    { title: 'Registered Nurse', slug: 'health', type: JobType.FULL_TIME, tags: ['Nursing', 'Patient Care', 'Healthcare'] },
    { title: 'Medical Officer', slug: 'health', type: JobType.FULL_TIME, tags: ['Medicine', 'Clinical', 'Health'] },
    { title: 'High School Teacher', slug: 'education', type: JobType.FULL_TIME, tags: ['Teaching', 'Education', 'Mentoring'] },
    { title: 'Civil Engineer', slug: 'engineering', type: JobType.FULL_TIME, tags: ['AutoCAD', 'Construction', 'Project Management'] },
    { title: 'Mechanical Engineer', slug: 'engineering', type: JobType.FULL_TIME, tags: ['SolidWorks', 'Design', 'Manufacturing'] },
    { title: 'UX Designer', slug: 'design', type: JobType.REMOTE, tags: ['Figma', 'Wireframing', 'User Research'] },
    { title: 'Graphic Designer', slug: 'design', type: JobType.PART_TIME, tags: ['Photoshop', 'Illustrator', 'Branding'] },
    { title: 'Sales Representative', slug: 'sales', type: JobType.FULL_TIME, tags: ['B2B', 'Negotiation', 'CRM'] },
    { title: 'HR Manager', slug: 'hr', type: JobType.FULL_TIME, tags: ['Recruitment', 'Employee Relations', 'Payroll'] },
  ];

  const jobs: any[] = [];
  const locations = ['Addis Ababa', 'Hawassa', 'Dire Dawa', 'Bahir Dar', 'Adama', 'Mekelle'];

  // Generate 50 jobs by repeating and slightly randomizing templates
  for (let i = 0; i < 50; i++) {
    const template = jobTemplates[i % jobTemplates.length];
    const company = companies[i % companies.length];
    const location = template.type === JobType.REMOTE ? 'Remote' : locations[i % locations.length];
    
    // Vary salaries
    const minSalary = 10000 + (Math.floor(Math.random() * 20) * 1000);
    const maxSalary = minSalary + 5000 + (Math.floor(Math.random() * 10) * 1000);

    const job = await prisma.job.create({
      data: {
        title: `${template.title} ${i > jobTemplates.length ? (i % 2 === 0 ? '(Senior)' : '(Junior)') : ''}`.trim(),
        description: `We are looking for a skilled ${template.title} to join our team at ${company.name}. The ideal candidate will have strong experience in relevant technologies and a proven track record.

**Responsibilities:**
- Collaborate with cross-functional teams to deliver high-quality results.
- Analyze requirements and propose effective solutions.
- Maintain documentation and follow industry best practices.

**Requirements:**
- Bachelor's degree in a relevant field.
- 2+ years of professional experience.
- Proficiency in ${template.tags.join(', ')}.`,
        location: location,
        type: template.type,
        status: i % 10 === 0 ? JobStatus.DRAFT : JobStatus.PUBLISHED,
        featured: i % 5 === 0,
        tags: template.tags,
        salaryMin: minSalary,
        salaryMax: maxSalary,
        currency: 'ETB',
        categoryId: categories[template.slug].id,
        companyId: company.id,
      }
    });
    jobs.push(job);

    // Create a question for some jobs
    if (i % 3 === 0) {
      await prisma.jobQuestion.create({
        data: {
          jobId: job.id,
          question: 'Why do you want to work for our company?',
          type: 'TEXT',
          required: true,
        }
      });
    }
  }

  console.log(`Created ${jobs.length} jobs.`);

  // 5. Create Applications & Scores
  console.log('Generating applications...');
  for (let i = 0; i < 20; i++) {
    const seeker = jobSeekers[i % jobSeekers.length];
    const job = jobs[i % (jobs.length / 2)]; // Apply to first half of jobs
    
    // Check if application already exists (jobId + userId unique constraint)
    const existingApp = await prisma.application.findUnique({
      where: {
        jobId_userId: { jobId: job.id, userId: seeker.id }
      }
    });

    if (!existingApp) {
      const statuses = [ApplicationStatus.SUBMITTED, ApplicationStatus.SCREENING, ApplicationStatus.INTERVIEW_SCHEDULED, ApplicationStatus.REJECTED];
      const appStatus = statuses[i % statuses.length];
      
      const app = await prisma.application.create({
        data: {
          jobId: job.id,
          userId: seeker.id,
          coverLetter: `I am very interested in the ${job.title} position at your company. My background in ${seeker.skills.join(', ')} aligns well with your requirements.`,
          status: appStatus,
        }
      });

      // Create CandidateScore for some applications
      if (appStatus !== ApplicationStatus.SUBMITTED) {
        await prisma.candidateScore.create({
          data: {
            applicationId: app.id,
            userId: seeker.id,
            overallScore: 75 + (i % 20),
            skillScore: 80,
            experienceScore: 70,
            cultureFitScore: 85,
            reasoning: 'Candidate shows strong potential and relevant skill matches.',
            modelUsed: 'mock-ai',
          }
        });
      }

      // Create notifications
      await prisma.notification.create({
        data: {
          userId: seeker.id,
          type: 'application_update',
          title: 'Application Update',
          body: `Your application for ${job.title} is now in ${appStatus} status.`,
          channel: 'IN_APP',
        }
      });
    }
  }

  // Create a profile boost report for a seeker
  await prisma.profileBoostReport.create({
    data: {
      userId: jobSeekers[0].id,
      score: 85,
      feedback: 'Great profile! Highlight your leadership experience more to attract senior roles.',
      missingSkills: ['Agile Methodologies', 'Cloud Architecture'],
      headlineSuggest: 'Senior Software Engineer | React & Node.js Expert',
      bioSuggest: 'Experienced software engineer specializing in full-stack development with a passion for building scalable web applications. Proven ability to deliver high-quality solutions.',
    }
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
