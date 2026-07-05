import { PrismaClient, JobType, JobStatus, ApplicationStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const hashPassword = (password: string) => bcrypt.hashSync(password, 12);

async function main() {
  console.log('🌱 Starting database seed...');

  // ─── 1. Categories (upsert — safe to run multiple times) ────────────────
  const categoriesData = [
    { slug: 'it-software',  label: 'IT & Software',       icon: 'laptop' },
    { slug: 'marketing',    label: 'Marketing',             icon: 'megaphone' },
    { slug: 'finance',      label: 'Finance & Banking',     icon: 'landmark' },
    { slug: 'health',       label: 'Healthcare',            icon: 'heart-pulse' },
    { slug: 'education',    label: 'Education',             icon: 'graduation-cap' },
    { slug: 'engineering',  label: 'Engineering',           icon: 'cog' },
    { slug: 'design',       label: 'Design & Creative',     icon: 'palette' },
    { slug: 'sales',        label: 'Sales',                 icon: 'briefcase' },
    { slug: 'hr',           label: 'Human Resources',       icon: 'users' },
  ];

  const categories: Record<string, any> = {};
  for (const cat of categoriesData) {
    categories[cat.slug] = await prisma.jobCategory.upsert({
      where:  { slug: cat.slug },
      update: { label: cat.label, icon: cat.icon },
      create: cat,
    });
  }
  console.log(`✅ ${categoriesData.length} categories seeded`);

  // ─── 2. Employer users + companies (upsert by email / userId) ───────────
  const employersData = [
    { email: 'hr@takacash.com',                    first: 'HR', last: 'TakaCash',        name: 'TakaCash',          industry: 'FinTech',            loc: 'Addis Ababa' },
    { email: 'careers@ethiotelecom.et',            first: 'HR', last: 'EthioTelecom',    name: 'Ethio Telecom',     industry: 'Telecommunications', loc: 'Addis Ababa' },
    { email: 'jobs@dashenbank.com',                first: 'HR', last: 'DashenBank',      name: 'Dashen Bank',       industry: 'Banking',            loc: 'Addis Ababa' },
    { email: 'hr@safaricom.et',                    first: 'HR', last: 'Safaricom',       name: 'Safaricom Ethiopia',industry: 'Telecommunications', loc: 'Addis Ababa' },
    { email: 'recruitment@ethiopianairlines.com',  first: 'HR', last: 'EthiopianAir',   name: 'Ethiopian Airlines', industry: 'Aviation',           loc: 'Addis Ababa' },
    { email: 'careers@gebeya.com',                 first: 'HR', last: 'Gebeya',          name: 'Gebeya Inc.',       industry: 'IT Services',         loc: 'Addis Ababa' },
    { email: 'jobs@awashbank.com',                 first: 'HR', last: 'AwashBank',       name: 'Awash Bank',        industry: 'Banking',            loc: 'Addis Ababa' },
    { email: 'hr@min-health.gov.et',               first: 'HR', last: 'MinistryHealth',  name: 'Ministry of Health',industry: 'Government',         loc: 'Addis Ababa' },
  ];

  const companies: any[] = [];
  for (const emp of employersData) {
    const user = await prisma.user.upsert({
      where:  { email: emp.email },
      update: {},
      create: {
        email:         emp.email,
        passwordHash:  hashPassword('password123'),
        firstName:     emp.first,
        lastName:      emp.last,
        role:          'EMPLOYER',
        isActive:      true,
        emailVerified: true,
      },
    });

    const company = await prisma.company.upsert({
      where:  { userId: user.id },
      update: {},
      create: {
        name:        emp.name,
        userId:      user.id,
        verified:    true,
        industry:    emp.industry,
        location:    emp.loc,
        description: `${emp.name} is a leading organization in the ${emp.industry} sector, committed to empowering Ethiopia's workforce.`,
      },
    });
    companies.push(company);
  }
  console.log(`✅ ${employersData.length} employers + companies seeded`);

  // ─── 3. Job seekers ──────────────────────────────────────────────────────
  const jobSeekersData = [
    { email: 'abebe.kebede@example.com',   first: 'Abebe',  last: 'Kebede',    title: 'Senior Software Engineer', skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL'] },
    { email: 'chaltu.bekele@example.com',  first: 'Chaltu', last: 'Bekele',    title: 'Marketing Manager',        skills: ['SEO', 'Content Strategy', 'Social Media', 'Google Ads'] },
    { email: 'dawit.alemayehu@example.com',first: 'Dawit',  last: 'Alemayehu', title: 'Financial Analyst',        skills: ['Excel', 'Financial Modeling', 'Accounting', 'Power BI'] },
    { email: 'sara.tesfaye@example.com',   first: 'Sara',   last: 'Tesfaye',   title: 'UX/UI Designer',           skills: ['Figma', 'Adobe XD', 'Prototyping', 'User Research'] },
    { email: 'yosef.girma@example.com',    first: 'Yosef',  last: 'Girma',     title: 'DevOps Engineer',          skills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD'] },
  ];

  const jobSeekers: any[] = [];
  for (const seeker of jobSeekersData) {
    const user = await prisma.user.upsert({
      where:  { email: seeker.email },
      update: {},
      create: {
        email:         seeker.email,
        passwordHash:  hashPassword('password123'),
        firstName:     seeker.first,
        lastName:      seeker.last,
        role:          'JOB_SEEKER',
        isActive:      true,
        emailVerified: true,
        headline:      seeker.title,
        skills:        seeker.skills,
        bio:           `Experienced ${seeker.title} with expertise in ${seeker.skills.slice(0, 2).join(' and ')}. Passionate about delivering results and continuous learning.`,
      },
    });
    jobSeekers.push(user);
  }
  console.log(`✅ ${jobSeekersData.length} job seekers seeded`);

  // ─── 4. Jobs ─────────────────────────────────────────────────────────────
  // Check if jobs already seeded to avoid duplicate inserts
  const existingJobCount = await prisma.job.count();
  if (existingJobCount >= 45) {
    console.log(`⏭  Jobs already seeded (${existingJobCount} found), skipping`);
  } else {
    const jobTemplates = [
      { title: 'Frontend Developer',           slug: 'it-software',  type: JobType.FULL_TIME,  tags: ['React', 'CSS', 'JavaScript'],              minSal: 25000, maxSal: 45000 },
      { title: 'Backend Engineer',             slug: 'it-software',  type: JobType.FULL_TIME,  tags: ['Node.js', 'PostgreSQL', 'API Design'],      minSal: 28000, maxSal: 50000 },
      { title: 'Full Stack Developer',         slug: 'it-software',  type: JobType.HYBRID,     tags: ['Next.js', 'NestJS', 'TypeScript'],          minSal: 30000, maxSal: 55000 },
      { title: 'Data Scientist',               slug: 'it-software',  type: JobType.FULL_TIME,  tags: ['Python', 'Machine Learning', 'SQL'],        minSal: 32000, maxSal: 60000 },
      { title: 'DevOps Engineer',              slug: 'it-software',  type: JobType.REMOTE,     tags: ['AWS', 'Docker', 'Kubernetes'],              minSal: 35000, maxSal: 65000 },
      { title: 'Mobile Developer (Android)',   slug: 'it-software',  type: JobType.FULL_TIME,  tags: ['Kotlin', 'Android SDK', 'Firebase'],        minSal: 25000, maxSal: 48000 },
      { title: 'Digital Marketing Manager',    slug: 'marketing',    type: JobType.FULL_TIME,  tags: ['Google Ads', 'SEO', 'Analytics'],           minSal: 20000, maxSal: 38000 },
      { title: 'Social Media Specialist',      slug: 'marketing',    type: JobType.PART_TIME,  tags: ['Instagram', 'TikTok', 'Content Creation'],  minSal: 12000, maxSal: 22000 },
      { title: 'Brand Manager',                slug: 'marketing',    type: JobType.FULL_TIME,  tags: ['Brand Strategy', 'Campaign Management'],    minSal: 25000, maxSal: 45000 },
      { title: 'Senior Financial Analyst',     slug: 'finance',      type: JobType.FULL_TIME,  tags: ['Excel', 'Financial Modeling', 'IFRS'],      minSal: 30000, maxSal: 55000 },
      { title: 'Bank Branch Manager',          slug: 'finance',      type: JobType.FULL_TIME,  tags: ['Banking Operations', 'Team Leadership'],    minSal: 35000, maxSal: 60000 },
      { title: 'Credit Analyst',               slug: 'finance',      type: JobType.FULL_TIME,  tags: ['Credit Risk', 'Loan Analysis', 'Reporting'],minSal: 22000, maxSal: 40000 },
      { title: 'Treasury Officer',             slug: 'finance',      type: JobType.FULL_TIME,  tags: ['Forex', 'Liquidity Management', 'SAP'],     minSal: 25000, maxSal: 45000 },
      { title: 'Registered Nurse',             slug: 'health',       type: JobType.FULL_TIME,  tags: ['Patient Care', 'ICU', 'Clinical Skills'],   minSal: 18000, maxSal: 30000 },
      { title: 'Medical Officer',              slug: 'health',       type: JobType.FULL_TIME,  tags: ['Diagnosis', 'Surgery', 'Clinical Care'],    minSal: 40000, maxSal: 70000 },
      { title: 'Pharmacist',                   slug: 'health',       type: JobType.FULL_TIME,  tags: ['Dispensing', 'Drug Interaction', 'Pharmacy'],minSal: 22000, maxSal: 38000 },
      { title: 'High School Math Teacher',     slug: 'education',    type: JobType.FULL_TIME,  tags: ['Mathematics', 'Curriculum Design', 'Tutoring'],minSal: 15000, maxSal: 28000 },
      { title: 'University Lecturer',          slug: 'education',    type: JobType.FULL_TIME,  tags: ['Research', 'Academic Writing', 'Teaching'], minSal: 25000, maxSal: 45000 },
      { title: 'Civil Engineer',               slug: 'engineering',  type: JobType.FULL_TIME,  tags: ['AutoCAD', 'Structural Design', 'Surveying'],minSal: 25000, maxSal: 48000 },
      { title: 'Mechanical Engineer',          slug: 'engineering',  type: JobType.FULL_TIME,  tags: ['SolidWorks', 'HVAC', 'Manufacturing'],      minSal: 24000, maxSal: 45000 },
      { title: 'Electrical Engineer',          slug: 'engineering',  type: JobType.FULL_TIME,  tags: ['Power Systems', 'PLC', 'Maintenance'],      minSal: 24000, maxSal: 46000 },
      { title: 'UX Designer',                  slug: 'design',       type: JobType.REMOTE,     tags: ['Figma', 'User Research', 'Wireframing'],    minSal: 22000, maxSal: 40000 },
      { title: 'Graphic Designer',             slug: 'design',       type: JobType.PART_TIME,  tags: ['Photoshop', 'Illustrator', 'Branding'],     minSal: 12000, maxSal: 25000 },
      { title: 'UI Designer',                  slug: 'design',       type: JobType.HYBRID,     tags: ['Figma', 'Design Systems', 'Prototyping'],   minSal: 20000, maxSal: 38000 },
      { title: 'Sales Representative',         slug: 'sales',        type: JobType.FULL_TIME,  tags: ['B2B Sales', 'CRM', 'Negotiation'],          minSal: 15000, maxSal: 28000 },
      { title: 'Account Manager',              slug: 'sales',        type: JobType.FULL_TIME,  tags: ['Client Relations', 'Upselling', 'Salesforce'],minSal: 20000, maxSal: 38000 },
      { title: 'HR Manager',                   slug: 'hr',           type: JobType.FULL_TIME,  tags: ['Recruitment', 'Payroll', 'Labor Law'],      minSal: 25000, maxSal: 45000 },
      { title: 'Talent Acquisition Specialist',slug: 'hr',           type: JobType.FULL_TIME,  tags: ['Sourcing', 'Interviewing', 'ATS'],          minSal: 18000, maxSal: 35000 },
    ];

    const locations   = ['Addis Ababa', 'Hawassa', 'Dire Dawa', 'Bahir Dar', 'Adama', 'Mekelle'];
    const expLevels   = ['Entry Level', 'Mid Level', 'Senior Level', 'Director'];
    const jobsCreated: any[] = [];

    for (let i = 0; i < 50; i++) {
      const template  = jobTemplates[i % jobTemplates.length];
      const company   = companies[i % companies.length];
      const location  = template.type === JobType.REMOTE ? 'Remote' : locations[i % locations.length];
      const expLevel  = expLevels[Math.floor(i / 12) % expLevels.length];
      const isFeatured = i % 5 === 0;
      const isUrgent   = i % 8 === 0;
      const suffix     = i >= jobTemplates.length ? (i % 2 === 0 ? ' — Senior' : ' — Junior') : '';
      const salaryVariance = (i % 5) * 2000;

      const job = await prisma.job.create({
        data: {
          title:           `${template.title}${suffix}`,
          description:     buildJobDescription(template.title, company.name, template.tags),
          requirements:    buildRequirements(template.tags, expLevel),
          location:        location,
          type:            template.type,
          status:          i % 10 === 9 ? JobStatus.DRAFT : JobStatus.PUBLISHED,
          featured:        isFeatured,
          urgent:          isUrgent,
          tags:            template.tags,
          salaryMin:       template.minSal + salaryVariance,
          salaryMax:       template.maxSal + salaryVariance,
          currency:        'ETB',
          experienceLevel: expLevel,
          categoryId:      categories[template.slug].id,
          companyId:       company.id,
        },
      });
      jobsCreated.push(job);

      // Add a screening question for 1 in 3 jobs
      if (i % 3 === 0) {
        await prisma.jobQuestion.create({
          data: {
            jobId:    job.id,
            question: 'Why are you interested in this position and what makes you the ideal candidate?',
            type:     'TEXT',
            required: true,
            order:    0,
          },
        });
      }
    }

    console.log(`✅ ${jobsCreated.length} jobs seeded`);

    // ─── 5. Applications ───────────────────────────────────────────────────
    const publishedJobs = jobsCreated.filter(j => j.status === 'PUBLISHED');
    const appStatuses   = [
      ApplicationStatus.SUBMITTED,
      ApplicationStatus.SCREENING,
      ApplicationStatus.SHORTLISTED,
      ApplicationStatus.INTERVIEW_SCHEDULED,
      ApplicationStatus.REJECTED,
    ];

    let appsCreated = 0;
    for (let i = 0; i < 20; i++) {
      const seeker = jobSeekers[i % jobSeekers.length];
      const job    = publishedJobs[i % publishedJobs.length];
      const status = appStatuses[i % appStatuses.length];

      const existing = await prisma.application.findUnique({
        where: { jobId_userId: { jobId: job.id, userId: seeker.id } },
      });
      if (existing) continue;

      const app = await prisma.application.create({
        data: {
          jobId:       job.id,
          userId:      seeker.id,
          coverLetter: `Dear Hiring Team,\n\nI am writing to express my strong interest in the ${job.title} role at your company. With my background in ${seeker.skills?.slice(0, 2).join(' and ')}, I am confident I can make a meaningful contribution.\n\nThank you for considering my application.\n\nBest regards,\n${seeker.firstName} ${seeker.lastName}`,
          status:      status,
        },
      });
      appsCreated++;

      // Add AI score for non-submitted applications
      if (status !== ApplicationStatus.SUBMITTED) {
        await prisma.candidateScore.create({
          data: {
            applicationId:   app.id,
            userId:          seeker.id,
            overallScore:    68 + (i % 28),
            skillScore:      72 + (i % 20),
            experienceScore: 65 + (i % 25),
            cultureFitScore: 70 + (i % 22),
            reasoning:       '[Mock AI] Candidate demonstrates relevant technical skills and a well-structured cover letter. Recommended for further review.',
            modelUsed:       'mock-ai',
          },
        });
      }

      // Notification for each application status
      await prisma.notification.create({
        data: {
          userId:  seeker.id,
          type:    'application_update',
          title:   'Application Status Update',
          body:    `Your application for "${job.title}" is currently: ${status.replace(/_/g, ' ')}.`,
          channel: 'IN_APP',
        },
      });
    }
    console.log(`✅ ${appsCreated} applications seeded`);
  }

  // ─── 6. Profile boost report ─────────────────────────────────────────────
  const existingBoost = await prisma.profileBoostReport.findFirst({
    where: { userId: jobSeekers[0].id },
  });
  if (!existingBoost) {
    await prisma.profileBoostReport.create({
      data: {
        userId:          jobSeekers[0].id,
        score:           85,
        feedback:        'Strong technical profile. Expanding your open-source contributions and adding a portfolio link would push your visibility above 90.',
        missingSkills:   ['System Design', 'Cloud Architecture (AWS/GCP)', 'Agile / Scrum'],
        headlineSuggest: 'Senior Full-Stack Engineer | React · Node.js · TypeScript',
        bioSuggest:      'Results-driven software engineer with 5+ years building scalable web applications. Specializes in React and Node.js ecosystems, with a track record of delivering production-ready systems. Passionate about clean code and developer experience.',
      },
    });
    console.log('✅ Profile boost report seeded');
  }

  console.log('\n🎉 Database seed completed successfully!');
  console.log('   Seeded accounts (password: password123):');
  console.log('   Employer  → hr@takacash.com');
  console.log('   Job Seeker→ abebe.kebede@example.com');
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function buildJobDescription(title: string, company: string, tags: string[]): string {
  return `**${company}** is looking for a talented **${title}** to join our growing team.

## About the Role
You will work in a collaborative environment, contributing to key business objectives and delivering high-impact results. This is an excellent opportunity for a motivated professional who wants to grow their career with a reputable organization.

## Key Responsibilities
- Collaborate with cross-functional teams to design and deliver high-quality solutions.
- Analyze requirements and translate them into actionable plans.
- Maintain code quality, documentation, and follow established best practices.
- Participate in code reviews and continuous improvement initiatives.
- Mentor junior team members where applicable.

## What We Offer
- Competitive salary and benefits package.
- Flexible working arrangements.
- Professional development and training opportunities.
- Collaborative and inclusive work culture.`;
}

function buildRequirements(tags: string[], level: string): string {
  const yearsMap: Record<string, string> = {
    'Entry Level': '0–2 years',
    'Mid Level':   '2–5 years',
    'Senior Level':'5+ years',
    'Director':    '8+ years',
  };
  return `- ${yearsMap[level] || '2+ years'} of professional experience in a relevant role.
- Bachelor's degree in a related field (or equivalent practical experience).
- Proficiency in: ${tags.join(', ')}.
- Strong communication and problem-solving skills.
- Ability to work independently and as part of a team.`;
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
