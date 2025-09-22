// Author: Aazaf Ritha
import mongoose from 'mongoose';
import Quiz from '../models/Quiz.js';
import EduContent from '../models/EduContent.js';
import { connectDB } from '../config/db.js';
import dotenv from 'dotenv';

dotenv.config();

const sampleQuizzes = [
  {
    title: "Cybersecurity Fundamentals",
    description: "Test your knowledge of basic cybersecurity concepts",
    category: "cybersecurity",
    difficulty: "easy",
    questions: [
      {
        question: "What is the primary purpose of a firewall?",
        type: "multiple-choice",
        options: [
          "To prevent unauthorized access to a network",
          "To increase internet speed",
          "To store passwords securely",
          "To backup data automatically"
        ],
        correctAnswer: "0",
        explanation: "A firewall acts as a barrier between your network and external networks, controlling incoming and outgoing traffic.",
        points: 2
      },
      {
        question: "Strong passwords should contain at least 8 characters",
        type: "true-false",
        correctAnswer: "true",
        explanation: "Strong passwords should be at least 8 characters long and include a mix of letters, numbers, and symbols.",
        points: 1
      },
      {
        question: "What does VPN stand for?",
        type: "text",
        correctAnswer: "Virtual Private Network",
        explanation: "A VPN creates a secure connection over the internet, encrypting your data.",
        points: 2
      }
    ],
    timeLimit: 15,
    passingScore: 70,
    maxAttempts: 3,
    tags: ["security", "basics", "fundamentals"],
    instructions: "Read each question carefully and select the best answer. You have 15 minutes to complete this quiz.",
    status: "published",
    publishedAt: new Date()
  },
  {
    title: "Phishing Awareness Quiz",
    description: "Learn to identify and avoid phishing attacks",
    category: "phishing",
    difficulty: "medium",
    questions: [
      {
        question: "Which of the following is a common sign of a phishing email?",
        type: "multiple-choice",
        options: [
          "Urgent language demanding immediate action",
          "Generic greeting like 'Dear Customer'",
          "Suspicious sender email address",
          "All of the above"
        ],
        correctAnswer: "3",
        explanation: "All of these are common indicators of phishing emails.",
        points: 3
      },
      {
        question: "You should always click on links in emails from unknown senders",
        type: "true-false",
        correctAnswer: "false",
        explanation: "Never click on links in emails from unknown or suspicious senders as they may lead to malicious websites.",
        points: 2
      },
      {
        question: "What should you do if you receive a suspicious email asking for personal information?",
        type: "multiple-choice",
        options: [
          "Reply with the requested information",
          "Forward it to your IT department",
          "Delete it immediately",
          "Both B and C"
        ],
        correctAnswer: "3",
        explanation: "You should either forward suspicious emails to IT or delete them, but never provide personal information.",
        points: 2
      }
    ],
    timeLimit: 20,
    passingScore: 80,
    maxAttempts: 2,
    tags: ["phishing", "email", "security"],
    instructions: "This quiz tests your ability to identify phishing attempts. Take your time to analyze each scenario.",
    status: "published",
    publishedAt: new Date()
  },
  {
    title: "Data Protection and Privacy",
    description: "Understanding data protection principles and privacy laws",
    category: "privacy",
    difficulty: "hard",
    questions: [
      {
        question: "What does GDPR stand for?",
        type: "text",
        correctAnswer: "General Data Protection Regulation",
        explanation: "GDPR is a comprehensive data protection law in the European Union.",
        points: 3
      },
      {
        question: "Personal data can only be processed with explicit consent",
        type: "true-false",
        correctAnswer: "false",
        explanation: "While consent is one legal basis, personal data can also be processed for legitimate interests, legal obligations, etc.",
        points: 2
      },
      {
        question: "What is the maximum fine for GDPR violations?",
        type: "multiple-choice",
        options: [
          "€10,000",
          "€100,000",
          "€1,000,000",
          "€20 million or 4% of annual turnover"
        ],
        correctAnswer: "3",
        explanation: "GDPR fines can be up to €20 million or 4% of annual global turnover, whichever is higher.",
        points: 3
      }
    ],
    timeLimit: 25,
    passingScore: 75,
    maxAttempts: 1,
    tags: ["privacy", "gdpr", "data-protection"],
    instructions: "This advanced quiz covers data protection regulations. Ensure you understand the concepts before answering.",
    status: "published",
    publishedAt: new Date()
  }
];

const sampleContent = [
  {
    title: "Introduction to Cybersecurity",
    type: "blog",
    description: "A comprehensive guide to understanding cybersecurity fundamentals",
    body: `# Introduction to Cybersecurity

Cybersecurity is the practice of protecting systems, networks, and programs from digital attacks. These cyberattacks are usually aimed at accessing, changing, or destroying sensitive information; extorting money from users; or interrupting normal business processes.

## Key Concepts

### Confidentiality
Ensuring that information is accessible only to those authorized to have access.

### Integrity
Maintaining and assuring the accuracy and completeness of information over its entire lifecycle.

### Availability
Ensuring that information and resources are available to authorized users when needed.

## Common Threats

1. **Malware** - Malicious software designed to damage or gain unauthorized access
2. **Phishing** - Attempts to steal sensitive information through deceptive emails
3. **Ransomware** - Malware that encrypts files and demands payment for decryption
4. **Social Engineering** - Manipulating people into revealing confidential information

## Best Practices

- Keep software updated
- Use strong, unique passwords
- Enable two-factor authentication
- Be cautious with email attachments
- Regular data backups
- Employee training and awareness

Remember: Cybersecurity is everyone's responsibility!`,
    tags: ["cybersecurity", "basics", "introduction"],
    status: "published",
    publishedAt: new Date()
  },
  {
    title: "Phishing Prevention Training Video",
    type: "youtube",
    description: "Learn how to identify and prevent phishing attacks",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    tags: ["phishing", "training", "video"],
    status: "published",
    publishedAt: new Date()
  },
  {
    title: "Password Security Best Practices",
    type: "writeup",
    description: "Essential guidelines for creating and managing secure passwords",
    body: `# Password Security Best Practices

## Creating Strong Passwords

### Length Matters
- Use at least 12 characters
- Longer passwords are exponentially harder to crack

### Character Variety
- Mix uppercase and lowercase letters
- Include numbers and special characters
- Avoid common substitutions (e.g., @ for a)

### Avoid Common Patterns
- Don't use dictionary words
- Avoid personal information
- Don't use keyboard patterns (qwerty, 123456)

## Password Management

### Use a Password Manager
- Generate unique passwords for each account
- Store passwords securely
- Enable two-factor authentication on the password manager

### Regular Updates
- Change passwords periodically
- Update immediately if breach is suspected
- Don't reuse passwords across accounts

### Additional Security
- Enable two-factor authentication where available
- Use biometric authentication when possible
- Be cautious on public networks

## Common Mistakes to Avoid

1. Using the same password everywhere
2. Sharing passwords via email or text
3. Writing passwords on sticky notes
4. Using easily guessable information
5. Ignoring security breach notifications

Remember: Your password is often the first line of defense against unauthorized access!`,
    tags: ["passwords", "security", "best-practices"],
    status: "published",
    publishedAt: new Date()
  }
];

async function seedDatabase() {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Quiz.deleteMany({});
    await EduContent.deleteMany({});
    console.log('✅ Cleared existing data');

    // Insert sample quizzes
    const createdQuizzes = await Quiz.insertMany(sampleQuizzes);
    console.log(`✅ Created ${createdQuizzes.length} sample quizzes`);

    // Insert sample content
    const createdContent = await EduContent.insertMany(sampleContent);
    console.log(`✅ Created ${createdContent.length} sample content items`);

    console.log('🎉 Database seeded successfully!');
    console.log('\nSample data created:');
    console.log('- 3 quizzes (Cybersecurity Fundamentals, Phishing Awareness, Data Protection)');
    console.log('- 3 educational content items (Blog, YouTube video, Writeup)');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seed function
seedDatabase();
