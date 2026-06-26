export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: "Resume Tips" | "Interview Prep" | "Career Growth" | "AI & Technology" | "Job Search";
  author: string;
  date: string;
  readTime: string;
  featured: boolean;
  content: string[];
}

export const blogCategories = ["All", "Resume Tips", "Interview Prep", "Career Growth", "AI & Technology", "Job Search"] as const;

export const blogPosts: BlogPost[] = [
  {
    slug: "10-action-verbs-for-your-resume",
    title: "10 Power Action Verbs That Make Your Resume Stand Out",
    excerpt: "Replace weak phrases with these impactful action verbs to make your resume 3x more compelling to recruiters and ATS systems.",
    category: "Resume Tips",
    author: "Resuvio-AI Team",
    date: "2026-06-15",
    readTime: "4 min read",
    featured: true,
    content: [
      "When recruiters scan your resume (they spend an average of 7 seconds on the first pass), action verbs are what catch their eye. These powerful words convey initiative, results, and leadership.",
      "Here are 10 game-changing action verbs to use:\n\n1. **Spearheaded** – Instead of 'Led' or 'Managed'\n2. **Orchestrated** – For complex coordination\n3. **Accelerated** – When you sped up a process\n4. **Optimized** – For improvements and efficiency gains\n5. **Championed** – When you drove an initiative\n6. **Streamlined** – For process simplification\n7. **Transformed** – For significant changes\n8. **Negotiated** – For deal-making and agreements\n9. **Generated** – For revenue, leads, or ideas\n10. **Implemented** – For bringing plans to life",
      "**Pro Tip:** Pair each action verb with a quantifiable result. Instead of 'Managed a team,' write 'Spearheaded a team of 12 that delivered 3 projects ahead of schedule.'",
      "**What to Avoid:** Never start bullet points with 'Responsible for' or 'Duties included.' These passive phrases make you sound like a bystander rather than a contributor.",
      "Remember: Your resume is a marketing document, not a job description. Every bullet point should showcase impact, not just activity."
    ],
  },
  {
    slug: "ats-friendly-resume-2026",
    title: "How to Make Your Resume ATS-Friendly in 2026",
    excerpt: "75% of resumes are rejected by ATS before a human sees them. Learn the exact formatting and keyword strategies that pass modern ATS systems.",
    category: "Resume Tips",
    author: "Resuvio-AI Team",
    date: "2026-06-10",
    readTime: "6 min read",
    featured: true,
    content: [
      "Applicant Tracking Systems (ATS) have evolved significantly in 2026. Modern systems use AI to understand context, not just keyword matching. Here's how to ensure your resume passes.",
      "**Format Fundamentals:**\n- Use standard section headers: 'Experience,' 'Education,' 'Skills'\n- Stick to common fonts: Calibri, Arial, Garamond\n- Save as PDF to preserve formatting\n- Avoid tables, text boxes, and graphics in the main content area\n- Use standard bullet points (•) not special characters",
      "**Keyword Strategy:**\n- Mirror the exact job title in your resume\n- Include both acronyms and full forms (e.g., 'SEO' and 'Search Engine Optimization')\n- Use industry-specific terminology from the job description\n- Place keywords naturally — don't keyword stuff",
      "**The 80/20 Rule:** 80% of your keywords should come from the job description. The remaining 20% should be industry-standard terms that show your broader expertise.",
      "**Common ATS Killers:**\n- Headers/footers with important information\n- Images or logos as your name\n- Unusual section names like 'My Journey' instead of 'Experience'\n- Columns that get read out of order"
    ],
  },
  {
    slug: "interview-star-method",
    title: "Master the STAR Method for Behavioral Interviews",
    excerpt: "The STAR method is the gold standard for answering behavioral questions. Here's how to use it effectively with real examples.",
    category: "Interview Prep",
    author: "Resuvio-AI Team",
    date: "2026-06-05",
    readTime: "5 min read",
    featured: false,
    content: [
      "STAR stands for Situation, Task, Action, Result. It's a structured approach to answering behavioral interview questions like 'Tell me about a time when...'",
      "**Situation:** Set the context briefly. 'In my role as a project manager at XYZ Corp, our team was facing a critical deadline with limited resources.'",
      "**Task:** Describe your specific responsibility. 'I was tasked with delivering the client's MVP within 6 weeks with a team of 4 developers.'",
      "**Action:** Detail the steps YOU took. 'I implemented agile sprints, prioritized features using MoSCoW method, and set up daily 15-minute standups to track progress.'",
      "**Result:** Share the quantifiable outcome. 'We delivered the MVP 3 days early, the client approved all features, and the project generated ₹15L in first-quarter revenue.'",
      "**Pro Tip:** Prepare 8-10 STAR stories that cover common themes: leadership, conflict resolution, failure/learning, teamwork, initiative, and problem-solving. Most behavioral questions can be answered with these prepared stories."
    ],
  },
  {
    slug: "career-gap-resume",
    title: "How to Address Career Gaps on Your Resume",
    excerpt: "Career gaps are more common than you think. Learn 5 proven strategies to present gaps positively and confidently.",
    category: "Career Growth",
    author: "Resuvio-AI Team",
    date: "2026-05-28",
    readTime: "5 min read",
    featured: false,
    content: [
      "In 2026, career gaps are more accepted than ever. Whether you took time for family, education, health, or a job search, here's how to handle it.",
      "**Strategy 1: Use Years Only.** Instead of 'March 2022 - June 2024,' write '2022 - 2024.' This naturally minimizes small gaps.",
      "**Strategy 2: Fill the Gap Productively.** Add freelance work, volunteering, courses, or personal projects during the gap period.",
      "**Strategy 3: Address It in Your Summary.** Briefly mention the gap in your professional summary with a positive spin.",
      "**Strategy 4: Use a Functional Format.** Focus on skills rather than chronological work history if gaps are significant.",
      "**Strategy 5: Be Honest in Interviews.** Prepare a brief, positive explanation. 'I took time to upskill in data analytics and completed a certification program.'"
    ],
  },
  {
    slug: "ai-resume-analysis-how-it-works",
    title: "How AI Resume Analysis Actually Works",
    excerpt: "Behind the scenes of AI resume scoring: what algorithms look for, how scores are calculated, and how to optimize for AI evaluation.",
    category: "AI & Technology",
    author: "Resuvio-AI Team",
    date: "2026-05-20",
    readTime: "7 min read",
    featured: true,
    content: [
      "AI resume analysis tools like ours use large language models (LLMs) combined with rule-based scoring to evaluate your resume. Here's what happens under the hood.",
      "**The Scoring Pipeline:**\n1. **Text Extraction:** Your PDF/DOCX is parsed into structured text\n2. **Section Detection:** AI identifies headers, experience entries, education, and skills\n3. **Content Analysis:** Each section is evaluated for completeness, quality, and relevance\n4. **Keyword Matching:** If a JD is provided, keywords are compared\n5. **Score Calculation:** Individual category scores are computed and weighted",
      "**What AI Evaluates:**\n- **Impact Language:** Do you use action verbs and quantifiable results?\n- **Completeness:** Are all essential sections present and filled?\n- **Relevance:** Do your skills match the target role?\n- **Formatting:** Is the structure clean and scannable?\n- **Consistency:** Are dates, formatting, and style consistent?",
      "**How to Score Higher:**\n- Include at least 3-5 bullet points per experience with metrics\n- Match 70%+ of the job description keywords\n- Use a clean, standard format\n- Include a skills section with both hard and soft skills",
      "**Limitations of AI:** AI can't assess creativity, cultural fit, or personal branding as well as a human can. Use AI analysis as a baseline, then add your personal touch."
    ],
  },
  {
    slug: "remote-job-search-strategy",
    title: "The Complete Remote Job Search Strategy for 2026",
    excerpt: "Remote work is here to stay. Here's your step-by-step playbook for finding and landing remote positions in any industry.",
    category: "Job Search",
    author: "Resuvio-AI Team",
    date: "2026-05-15",
    readTime: "8 min read",
    featured: false,
    content: [
      "Remote work opportunities have grown 150% since 2022. Here's how to position yourself for the best remote roles.",
      "**Step 1: Optimize Your Resume for Remote.** Highlight remote-relevant skills: self-management, async communication, digital collaboration tools (Slack, Notion, Jira).",
      "**Step 2: Target Remote-First Companies.** Look at companies like GitLab, Automattic, Buffer, and Doist that are fully remote by design.",
      "**Step 3: Use Remote-Specific Job Boards.** Beyond LinkedIn, check We Work Remotely, RemoteOK, FlexJobs, and AngelList.",
      "**Step 4: Ace the Virtual Interview.** Invest in good lighting, test your tech setup, and practice looking at the camera (not the screen).",
      "**Step 5: Negotiate Remote Terms.** Clarify timezone expectations, equipment provision, and in-person meeting frequency before accepting."
    ],
  },
  {
    slug: "linkedin-profile-optimization",
    title: "Optimize Your LinkedIn Profile to Attract Recruiters",
    excerpt: "Your LinkedIn profile is your 24/7 networking tool. These 8 tweaks can increase recruiter views by up to 40x.",
    category: "Career Growth",
    author: "Resuvio-AI Team",
    date: "2026-05-10",
    readTime: "6 min read",
    featured: false,
    content: [
      "LinkedIn profiles with complete sections get 40x more opportunities. Here's how to optimize every section.",
      "**Headline:** Don't just use your job title. Use: 'Product Manager | SaaS | Helping teams ship 2x faster | Ex-Google'",
      "**About Section:** Write in first person. Start with a hook, share your story, and end with what you're looking for.",
      "**Experience:** Mirror your resume bullet points. Add media (presentations, links) to showcase work.",
      "**Skills:** Add at least 15 relevant skills. Take skill assessments to get verified badges.",
      "**Recommendations:** Request recommendations from managers, peers, and clients. Aim for at least 5.",
      "**Settings:** Turn on 'Open to Work' (visible to recruiters only) and set your preferred job types and locations.",
      "**Activity:** Post or comment 2-3 times per week on industry topics. This signals to the algorithm that you're active."
    ],
  },
  {
    slug: "salary-negotiation-guide",
    title: "The Complete Salary Negotiation Guide (with Scripts)",
    excerpt: "Most people leave ₹2-5L on the table by not negotiating. Here are proven scripts and strategies for every negotiation scenario.",
    category: "Career Growth",
    author: "Resuvio-AI Team",
    date: "2026-05-01",
    readTime: "9 min read",
    featured: false,
    content: [
      "Studies show that 84% of employers expect candidates to negotiate. Here's how to do it confidently.",
      "**Before the Negotiation:**\n- Research salary ranges on Glassdoor, Levels.fyi, and Ambition Box\n- Know your walk-away number\n- Prepare 3 data points to justify your ask",
      "**Script for Initial Offer:**\n'Thank you for the offer. Based on my research and the value I bring — specifically my experience with [X] that led to [Y result] — I was hoping we could discuss a salary in the range of [₹X - ₹Y]. Is there flexibility?'",
      "**Script for Counter-Offer:**\n'I'm excited about this opportunity. I have another offer at [₹X], but I'm more interested in this role because [reason]. Can we match or come close to that number?'",
      "**Non-Salary Negotiables:** If the salary is fixed, negotiate: signing bonus, equity/ESOPs, remote days, learning budget, additional vacation days, or flexible hours.",
      "**Common Mistakes:**\n- Giving a number first (let them anchor)\n- Accepting immediately (always ask for time to consider)\n- Not negotiating at all (the worst outcome)"
    ],
  },
];
