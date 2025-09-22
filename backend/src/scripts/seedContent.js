// Author: Aazaf Ritha
import mongoose from 'mongoose';
import EduContent from '../models/EduContent.js';
import dotenv from 'dotenv';

dotenv.config();

const sampleContent = [
  {
    title: 'Password Security Best Practices',
    description: 'Learn how to create and manage strong passwords to protect your accounts.',
    type: 'blog',
    status: 'published',
    body: '<h2>Introduction</h2><p>Password security is one of the most important aspects of cybersecurity. In this guide, we\'ll cover best practices for creating and managing strong passwords.</p><h3>Key Points:</h3><ul><li>Use at least 12 characters</li><li>Include uppercase, lowercase, numbers, and symbols</li><li>Don\'t reuse passwords across accounts</li><li>Use a password manager</li></ul>',
    bannerImage: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&h=400&fit=crop&crop=center',
    tags: ['security', 'passwords', 'authentication'],
    publishedAt: new Date('2024-01-15')
  },
  {
    title: 'Phishing Awareness Training',
    description: 'Recognize and avoid phishing attempts and social engineering attacks.',
    type: 'youtube',
    status: 'published',
    url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    bannerImage: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=400&fit=crop&crop=center',
    tags: ['phishing', 'social-engineering', 'awareness'],
    publishedAt: new Date('2024-01-20')
  },
  {
    title: 'Data Protection Guidelines',
    description: 'Understand how to protect sensitive data and maintain privacy.',
    type: 'pdf',
    status: 'published',
    url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    bannerImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop&crop=center',
    tags: ['data-protection', 'privacy', 'compliance'],
    publishedAt: new Date('2024-01-25')
  },
  {
    title: 'Network Security Fundamentals',
    description: 'Basic concepts of network security and how to protect your network.',
    type: 'writeup',
    status: 'draft',
    body: '<h2>Network Security Overview</h2><p>Network security involves protecting the integrity, confidentiality, and availability of data transmitted over networks.</p><h3>Common Threats:</h3><ul><li>Malware</li><li>DDoS attacks</li><li>Man-in-the-middle attacks</li><li>Unauthorized access</li></ul>',
    tags: ['network-security', 'fundamentals']
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/guardians');
    console.log('✅ Connected to MongoDB');

    // Clear existing content
    await EduContent.deleteMany({});
    console.log('🗑️ Cleared existing content');

    // Insert sample content
    const createdContent = await EduContent.insertMany(sampleContent);
    console.log(`✅ Created ${createdContent.length} sample content items`);

    // Display created content
    console.log('\n📚 Sample Content Created:');
    createdContent.forEach((content, index) => {
      console.log(`${index + 1}. ${content.title} (${content.status})`);
    });

    console.log('\n🎉 Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
