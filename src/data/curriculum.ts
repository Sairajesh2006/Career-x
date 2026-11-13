import { DifficultyLevel, SkillKey } from '../types/careerx';

export interface RoadmapTask {
  id: string;
  title: string;
  description: string;
  estimatedHours: number;
  difficulty: DifficultyLevel;
  category: string;
  resourceTitle: string;
  resourceUrl: string;
}

export interface RoadmapStage {
  id: string;
  stageNumber: number;
  title: string;
  subtitle: string;
  durationWeeks: number;
  tasks: RoadmapTask[];
}

export const ROADMAP_STAGES: RoadmapStage[] = [
  {
    id: 'stage-1',
    stageNumber: 1,
    title: 'Stage 1: Programming Fundamentals',
    subtitle: 'Syntax, memory model, OOP principles, and standard library mastery.',
    durationWeeks: 2,
    tasks: [
      {
        id: 't1-1',
        title: 'Master Collections / Standard Template Library',
        description: 'Understand internal mechanics of HashMap, PriorityQueue, LinkedList, and TreeSet.',
        estimatedHours: 10,
        difficulty: 'Medium',
        category: 'Programming',
        resourceTitle: 'Java / C++ STL Reference',
        resourceUrl: 'https://cp-algorithms.com/',
      },
      {
        id: 't1-2',
        title: 'Object-Oriented Design Patterns Drill',
        description: 'Implement Parking Lot or Library Management demonstrating SOLID and Polymorphism.',
        estimatedHours: 8,
        difficulty: 'Easy',
        category: 'OOP',
        resourceTitle: 'Refactoring Guru Design Patterns',
        resourceUrl: 'https://refactoring.guru/design-patterns',
      },
      {
        id: 't1-3',
        title: 'Time & Space Complexity Analysis',
        description: 'Analyze Big-O bounds, recurrence relations, and amortized cost across loops and recursion.',
        estimatedHours: 6,
        difficulty: 'Easy',
        category: 'Foundations',
        resourceTitle: 'Big-O Cheat Sheet',
        resourceUrl: 'https://www.bigocheatsheet.com/',
      },
    ],
  },
  {
    id: 'stage-2',
    stageNumber: 2,
    title: 'Stage 2: Data Structures & Algorithms',
    subtitle: 'Core coding interview patterns across arrays, trees, graphs, and DP.',
    durationWeeks: 4,
    tasks: [
      {
        id: 't2-1',
        title: 'Arrays, Two Pointers & Sliding Window',
        description: 'Solve 15+ frequency, prefix sum, and variable sliding window problems cleanly.',
        estimatedHours: 14,
        difficulty: 'Medium',
        category: 'DSA',
        resourceTitle: 'NeetCode Pattern Guide',
        resourceUrl: 'https://neetcode.io/roadmap',
      },
      {
        id: 't2-2',
        title: 'Trees, Binary Search Trees & Heaps',
        description: 'Master DFS/BFS traversals, LCA, balanced trees, and top-K heap patterns.',
        estimatedHours: 16,
        difficulty: 'Medium',
        category: 'DSA',
        resourceTitle: 'LeetCode Tree Explore',
        resourceUrl: 'https://leetcode.com/explore/learn/card/data-structure-tree/',
      },
      {
        id: 't2-3',
        title: 'Graphs & Dynamic Programming Essentials',
        description: 'Implement Dijkstra, topological sort, Union-Find, and 1D/2D memoized DP.',
        estimatedHours: 20,
        difficulty: 'Hard',
        category: 'DSA',
        resourceTitle: 'CP-Algorithms Graph Theory',
        resourceUrl: 'https://cp-algorithms.com/graph/breadth-first-search.html',
      },
    ],
  },
  {
    id: 'stage-3',
    stageNumber: 3,
    title: 'Stage 3: Core Computer Science Subjects',
    subtitle: 'Operating Systems, DBMS, SQL queries, and Computer Networks for OA & tech rounds.',
    durationWeeks: 2,
    tasks: [
      {
        id: 't3-1',
        title: 'DBMS Normalization, ACID & SQL Joins',
        description: 'Practice complex GROUP BY, window functions, indexing, and transaction isolation.',
        estimatedHours: 10,
        difficulty: 'Medium',
        category: 'DBMS',
        resourceTitle: 'SQLBolt Interactive Practice',
        resourceUrl: 'https://sqlbolt.com/',
      },
      {
        id: 't3-2',
        title: 'Operating Systems Concurrency & Memory',
        description: 'Review processes vs threads, deadlocks, semaphores, paging, and virtual memory.',
        estimatedHours: 10,
        difficulty: 'Medium',
        category: 'OS',
        resourceTitle: 'OSTEP Operating Systems',
        resourceUrl: 'https://pages.cs.wisc.edu/~remzi/OSTEP/',
      },
      {
        id: 't3-3',
        title: 'Computer Networks HTTP, TCP & DNS',
        description: 'Understand OSI layers, TCP 3-way handshake, TLS, REST semantics, and caching.',
        estimatedHours: 8,
        difficulty: 'Easy',
        category: 'Networks',
        resourceTitle: 'MDN HTTP Overview',
        resourceUrl: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview',
      },
    ],
  },
  {
    id: 'stage-4',
    stageNumber: 4,
    title: 'Stage 4: Engineering Projects & Tech Stack',
    subtitle: 'Build deployable full-stack or role-aligned capstone projects with clean architecture.',
    durationWeeks: 3,
    tasks: [
      {
        id: 't4-1',
        title: 'Ship Primary Full-Stack Capstone Project',
        description: 'Build and deploy an end-to-end project with auth, database, and measurable metrics.',
        estimatedHours: 24,
        difficulty: 'Medium',
        category: 'Projects',
        resourceTitle: 'Full-Stack Architecture Guide',
        resourceUrl: 'https://roadmap.sh/full-stack',
      },
      {
        id: 't4-2',
        title: 'Write Automated Tests & API Documentation',
        description: 'Add unit/integration tests, README architecture diagrams, and live demo links.',
        estimatedHours: 8,
        difficulty: 'Easy',
        category: 'Engineering',
        resourceTitle: 'Testing Library Docs',
        resourceUrl: 'https://testing-library.com/docs/',
      },
      {
        id: 't4-3',
        title: 'Prepare 2-Minute Deep-Dive Project Pitch',
        description: 'Document trade-offs, bottlenecks solved, and latency/scale numbers for interviews.',
        estimatedHours: 4,
        difficulty: 'Easy',
        category: 'Communication',
        resourceTitle: 'STAR Engineering Stories',
        resourceUrl: 'https://www.techinterviewhandbook.org/behavioral-interview/',
      },
    ],
  },
  {
    id: 'stage-5',
    stageNumber: 5,
    title: 'Stage 5: System Design & Scalability',
    subtitle: 'Low-level class design and high-level distributed architecture fundamentals.',
    durationWeeks: 2,
    tasks: [
      {
        id: 't5-1',
        title: 'Caching, Load Balancing & Sharding Basics',
        description: 'Learn Redis caching strategies, consistent hashing, and read-replica scaling.',
        estimatedHours: 10,
        difficulty: 'Medium',
        category: 'System Design',
        resourceTitle: 'System Design Primer',
        resourceUrl: 'https://github.com/donnemartin/system-design-primer',
      },
      {
        id: 't5-2',
        title: 'Design URL Shortener & Rate Limiter',
        description: 'Walk through API contracts, schema choices, and throughput estimation.',
        estimatedHours: 8,
        difficulty: 'Hard',
        category: 'System Design',
        resourceTitle: 'High Scalability Patterns',
        resourceUrl: 'https://roadmap.sh/system-design',
      },
      {
        id: 't5-3',
        title: 'Low-Level Design (LLD) Practice',
        description: 'Code extensible designs for Splitwise, Notification Service, or Cache Eviction.',
        estimatedHours: 10,
        difficulty: 'Medium',
        category: 'LLD',
        resourceTitle: 'Awesome Low-Level Design',
        resourceUrl: 'https://github.com/ashishps1/awesome-low-level-design',
      },
    ],
  },
  {
    id: 'stage-6',
    stageNumber: 6,
    title: 'Stage 6: Resume, ATS & Online Assessments',
    subtitle: 'Optimize resume keywords, GitHub profile, and timed quantitative/coding tests.',
    durationWeeks: 1,
    tasks: [
      {
        id: 't6-1',
        title: 'Run ATS Resume Diagnostic & Achieve 75+ Score',
        description: 'Quantify bullet points using X-Y-Z format and match target role keywords.',
        estimatedHours: 5,
        difficulty: 'Easy',
        category: 'Resume',
        resourceTitle: 'Tech Interview Resume Guide',
        resourceUrl: 'https://www.techinterviewhandbook.org/resume/',
      },
      {
        id: 't6-2',
        title: 'Timed Quantitative & Logical Aptitude Drill',
        description: 'Complete 3 timed OA aptitude simulations covering probability, PnC, and puzzles.',
        estimatedHours: 6,
        difficulty: 'Medium',
        category: 'Aptitude',
        resourceTitle: 'IndiaBIX Aptitude Practice',
        resourceUrl: 'https://www.indiabix.com/',
      },
      {
        id: 't6-3',
        title: 'LinkedIn & GitHub Recruiter Readiness Audit',
        description: 'Pin top 3 repositories, clean commit history, and align headline with target role.',
        estimatedHours: 4,
        difficulty: 'Easy',
        category: 'Profile',
        resourceTitle: 'GitHub Profile Guide',
        resourceUrl: 'https://docs.github.com/en/account-and-profile',
      },
    ],
  },
  {
    id: 'stage-7',
    stageNumber: 7,
    title: 'Stage 7: Mock Interviews & Company Sprints',
    subtitle: 'Simulate technical, managerial, and HR rounds for target campus companies.',
    durationWeeks: 2,
    tasks: [
      {
        id: 't7-1',
        title: 'Complete 2 AI Technical Mock Interviews',
        description: 'Practice explaining approach, edge cases, and complexity aloud under evaluation.',
        estimatedHours: 6,
        difficulty: 'Medium',
        category: 'Interview',
        resourceTitle: 'Pramp / Interviewing Guide',
        resourceUrl: 'https://www.techinterviewhandbook.org/coding-interview-cheatsheet/',
      },
      {
        id: 't7-2',
        title: 'Behavioral & HR STAR Story Bank',
        description: 'Prepare 6 structured stories covering conflict, ownership, failure, and leadership.',
        estimatedHours: 5,
        difficulty: 'Easy',
        category: 'HR',
        resourceTitle: 'STAR Method Framework',
        resourceUrl: 'https://www.techinterviewhandbook.org/behavioral-interview-questions/',
      },
      {
        id: 't7-3',
        title: 'Solve 10+ Company-Tagged Prep Problems',
        description: 'Complete curated company-specific drills and review common follow-up questions.',
        estimatedHours: 12,
        difficulty: 'Hard',
        category: 'Company Prep',
        resourceTitle: 'GeeksforGeeks Company Archives',
        resourceUrl: 'https://www.geeksforgeeks.org/company-preparation/',
      },
    ],
  },
];

export const TOTAL_ROADMAP_TASKS = ROADMAP_STAGES.reduce((acc, s) => acc + s.tasks.length, 0);

export interface SkillDimension {
  key: SkillKey;
  label: string;
  shortLabel: string;
  benchmark: number;
  description: string;
}

export const SKILL_DIMENSIONS: SkillDimension[] = [
  {
    key: 'dsa',
    label: 'DSA & Problem Solving',
    shortLabel: 'DSA',
    benchmark: 80,
    description: 'Arrays, trees, graphs, DP, and optimal time/space reasoning.',
  },
  {
    key: 'systemDesign',
    label: 'System & LLD Design',
    shortLabel: 'Design',
    benchmark: 70,
    description: 'API modeling, database schema, caching, and OOP class design.',
  },
  {
    key: 'coreCs',
    label: 'Core CS (OS / DBMS / CN)',
    shortLabel: 'Core CS',
    benchmark: 75,
    description: 'SQL joins, indexing, concurrency, deadlocks, TCP/HTTP fundamentals.',
  },
  {
    key: 'development',
    label: 'Projects & Tech Stack',
    shortLabel: 'Dev Stack',
    benchmark: 78,
    description: 'Production frameworks, Git workflow, testing, and deployed projects.',
  },
  {
    key: 'aptitude',
    label: 'Aptitude & OA Speed',
    shortLabel: 'Aptitude',
    benchmark: 72,
    description: 'Quantitative reasoning, probability, puzzles, and OA time management.',
  },
  {
    key: 'communication',
    label: 'Communication & HR',
    shortLabel: 'HR / Comm',
    benchmark: 75,
    description: 'Structured STAR stories, thinking aloud, and clarity under pressure.',
  },
];

export interface BadgeDefinition {
  id: string;
  title: string;
  description: string;
  requirementLabel: string;
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    id: 'b-profile-ready',
    title: 'Launchpad Ready',
    description: 'Completed personalized Career-X student profile setup.',
    requirementLabel: 'Complete profile setup',
  },
  {
    id: 'b-first-step',
    title: 'First Milestone',
    description: 'Completed your very first roadmap task.',
    requirementLabel: '1+ roadmap task',
  },
  {
    id: 'b-roadmap-5',
    title: 'Momentum Builder',
    description: 'Completed 5 or more roadmap tasks across stages.',
    requirementLabel: '5+ roadmap tasks',
  },
  {
    id: 'b-solver-10',
    title: 'Problem Solver',
    description: 'Solved at least 10 company or DSA prep questions.',
    requirementLabel: '10+ questions solved',
  },
  {
    id: 'b-streak-7',
    title: '7-Day Consistency',
    description: 'Maintained a 7-day active placement preparation streak.',
    requirementLabel: '7-day streak',
  },
  {
    id: 'b-resume-ready',
    title: 'ATS Verified',
    description: 'Scored 75+ on an AI ATS resume diagnostic.',
    requirementLabel: 'ATS score >= 75',
  },
  {
    id: 'b-interview-ace',
    title: 'Interview Ace',
    description: 'Scored 75+ in an AI Mock Interview evaluation.',
    requirementLabel: 'Mock score >= 75',
  },
];

export interface CompanyPrepQuestion {
  id: string;
  title: string;
  pattern: string;
  difficulty: DifficultyLevel;
  hint: string;
  practiceUrl: string;
}

export interface CompanyPrepProfile {
  id: string;
  name: string;
  tier: string;
  avgPackage: string;
  interviewFormat: string;
  focusAreas: string[];
  questions: CompanyPrepQuestion[];
}

export const COMPANY_PREP_BANK: CompanyPrepProfile[] = [
  {
    id: 'google',
    name: 'Google',
    tier: 'Tier 1 Product',
    avgPackage: '30 - 45 LPA',
    interviewFormat: '1 OA + 3-4 DSA Rounds + Googleyness',
    focusAreas: ['Graphs & Shortest Path', 'Dynamic Programming', 'Trees & Tries', 'Clean Edge-Case Code'],
    questions: [
      {
        id: 'q-goog-1',
        title: 'Evaluate Division (Weighted Graph DFS)',
        pattern: 'Graph / Union-Find',
        difficulty: 'Medium',
        hint: 'Model equations as directed weighted edges a/b = k and b/a = 1/k.',
        practiceUrl: 'https://leetcode.com/problems/evaluate-division/',
      },
      {
        id: 'q-goog-2',
        title: 'Median of Two Sorted Arrays',
        pattern: 'Binary Search Partition',
        difficulty: 'Hard',
        hint: 'Binary search partition index on the smaller array to balance left/right halves.',
        practiceUrl: 'https://leetcode.com/problems/median-of-two-sorted-arrays/',
      },
      {
        id: 'q-goog-3',
        title: 'Meeting Rooms II',
        pattern: 'Sweep Line / Min-Heap',
        difficulty: 'Medium',
        hint: 'Sort intervals by start time and track earliest ending room in a min-heap.',
        practiceUrl: 'https://leetcode.com/problems/meeting-rooms-ii/',
      },
    ],
  },
  {
    id: 'amazon',
    name: 'Amazon',
    tier: 'Tier 1 Product',
    avgPackage: '24 - 38 LPA',
    interviewFormat: 'OA (2 DSA + Workstyle) + 3 Tech/LP Rounds',
    focusAreas: ['Leadership Principles', 'Trees & BFS', 'Sliding Window', 'OOP / LLD'],
    questions: [
      {
        id: 'q-amzn-1',
        title: 'Rotting Oranges',
        pattern: 'Multi-Source BFS',
        difficulty: 'Medium',
        hint: 'Enqueue all initially rotten oranges at minute 0 and expand level by level.',
        practiceUrl: 'https://leetcode.com/problems/rotting-oranges/',
      },
      {
        id: 'q-amzn-2',
        title: 'LRU Cache',
        pattern: 'HashMap + Doubly Linked List',
        difficulty: 'Medium',
        hint: 'Store node pointers in a hash map to achieve O(1) get and put.',
        practiceUrl: 'https://leetcode.com/problems/lru-cache/',
      },
      {
        id: 'q-amzn-3',
        title: 'K Closest Points to Origin',
        pattern: 'Max-Heap / Quickselect',
        difficulty: 'Medium',
        hint: 'Maintain a max-heap of size K keyed by squared Euclidean distance.',
        practiceUrl: 'https://leetcode.com/problems/k-closest-points-to-origin/',
      },
    ],
  },
  {
    id: 'microsoft',
    name: 'Microsoft',
    tier: 'Tier 1 Product',
    avgPackage: '22 - 34 LPA',
    interviewFormat: 'Codility OA + 2 Technical + 1 AA Round',
    focusAreas: ['Linked Lists & Trees', 'String Manipulation', 'OS & Concurrency', 'System Architecture'],
    questions: [
      {
        id: 'q-msft-1',
        title: 'Copy List with Random Pointer',
        pattern: 'Linked List Interweaving',
        difficulty: 'Medium',
        hint: 'Interleave cloned nodes next to originals or map old->new nodes.',
        practiceUrl: 'https://leetcode.com/problems/copy-list-with-random-pointer/',
      },
      {
        id: 'q-msft-2',
        title: 'Lowest Common Ancestor of Binary Tree',
        pattern: 'Recursive Post-order DFS',
        difficulty: 'Medium',
        hint: 'Return node if it matches p or q; if both subtrees return non-null, current node is LCA.',
        practiceUrl: 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/',
      },
      {
        id: 'q-msft-3',
        title: 'Spiral Matrix Traversal',
        pattern: 'Matrix Boundaries',
        difficulty: 'Medium',
        hint: 'Maintain top, bottom, left, right boundaries and shrink after each edge pass.',
        practiceUrl: 'https://leetcode.com/problems/spiral-matrix/',
      },
    ],
  },
  {
    id: 'atlassian',
    name: 'Atlassian',
    tier: 'High-Growth Product',
    avgPackage: '26 - 42 LPA',
    interviewFormat: 'HackerRank OA + Code Design + Values Interview',
    focusAreas: ['Rate Limiter / DSA', 'Clean Modular Code', 'Atlassian Values', 'Data Structures'],
    questions: [
      {
        id: 'q-atls-1',
        title: 'Rank Teams by Votes',
        pattern: 'Custom Comparator Sorting',
        difficulty: 'Medium',
        hint: 'Build a frequency matrix [team][position] and sort lexicographically descending.',
        practiceUrl: 'https://leetcode.com/problems/rank-teams-by-votes/',
      },
      {
        id: 'q-atls-2',
        title: 'Design Hit Counter / Rate Limiter',
        pattern: 'Sliding Window Queue',
        difficulty: 'Medium',
        hint: 'Evict timestamps older than window size or use circular buckets.',
        practiceUrl: 'https://leetcode.com/problems/design-hit-counter/',
      },
      {
        id: 'q-atls-3',
        title: 'Merge Intervals',
        pattern: 'Sorting & Greedy',
        difficulty: 'Medium',
        hint: 'Sort by start time and merge overlapping end boundaries.',
        practiceUrl: 'https://leetcode.com/problems/merge-intervals/',
      },
    ],
  },
  {
    id: 'flipkart',
    name: 'Flipkart / Razorpay',
    tier: 'Unicorn Fintech & Commerce',
    avgPackage: '18 - 28 LPA',
    interviewFormat: 'Machine Coding Round + PS/DS + HM Round',
    focusAreas: ['Machine Coding (LLD)', 'DP & Greedy', 'DBMS Transactions', 'Concurrency'],
    questions: [
      {
        id: 'q-flip-1',
        title: 'Trapping Rain Water',
        pattern: 'Two Pointers / Monotonic Stack',
        difficulty: 'Hard',
        hint: 'Track leftMax and rightMax pointers inward in O(1) extra space.',
        practiceUrl: 'https://leetcode.com/problems/trapping-rain-water/',
      },
      {
        id: 'q-flip-2',
        title: 'Course Schedule II',
        pattern: 'Topological Sort (Kahn BFS)',
        difficulty: 'Medium',
        hint: 'Track in-degrees and pop zero-indegree nodes iteratively.',
        practiceUrl: 'https://leetcode.com/problems/course-schedule-ii/',
      },
      {
        id: 'q-flip-3',
        title: 'Coin Change (Minimum Coins)',
        pattern: 'Unbounded Knapsack DP',
        difficulty: 'Medium',
        hint: 'dp[amount] = min(dp[amount], 1 + dp[amount - coin]).',
        practiceUrl: 'https://leetcode.com/problems/coin-change/',
      },
    ],
  },
  {
    id: 'tcs-prime',
    name: 'TCS Prime / Service Tier',
    tier: 'Enterprise & Digital',
    avgPackage: '7 - 12 LPA',
    interviewFormat: 'NQT Coding + Technical + MR/HR Panel',
    focusAreas: ['Strings & Arrays', 'SQL & DBMS Basics', 'OOPs & Projects', 'Aptitude Speed'],
    questions: [
      {
        id: 'q-tcs-1',
        title: 'Two Sum',
        pattern: 'HashMap Lookup',
        difficulty: 'Easy',
        hint: 'Check if target - num already exists in a single hash map pass.',
        practiceUrl: 'https://leetcode.com/problems/two-sum/',
      },
      {
        id: 'q-tcs-2',
        title: 'Valid Anagram & Frequency Map',
        pattern: 'Character Counting',
        difficulty: 'Easy',
        hint: 'Compare fixed-size 26-letter frequency array between both strings.',
        practiceUrl: 'https://leetcode.com/problems/valid-anagram/',
      },
      {
        id: 'q-tcs-3',
        title: 'Second Highest Salary (SQL)',
        pattern: 'SQL Subquery / DENSE_RANK',
        difficulty: 'Medium',
        hint: 'Select MAX(salary) WHERE salary < (SELECT MAX(salary) FROM Employee).',
        practiceUrl: 'https://leetcode.com/problems/second-highest-salary/',
      },
    ],
  },
];
