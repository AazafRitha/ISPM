// Author: Aazaf Ritha
import mongoose from 'mongoose';
import Policy from '../models/Policy.js';
import { connectDB } from '../config/db.js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create sample policy files
const createSamplePolicyFile = (filename, content) => {
  const uploadsDir = path.join(__dirname, '../../uploads/policies');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  
  const filePath = path.join(uploadsDir, filename);
  fs.writeFileSync(filePath, content);
  return filePath;
};

const samplePolicies = [
  {
    title: "Information Security Policy",
    description: "Comprehensive policy covering data protection, access controls, and security measures for all company information assets.",
    version: "v2.1",
    category: "security",
    isRequired: true,
    fileName: "security-policy-v2.1.pdf",
    originalFileName: "Information_Security_Policy_v2.1.pdf",
    filePath: "",
    fileSize: 0,
    mimeType: "application/pdf",
    status: "active",
    tags: ["security", "data-protection", "access-control"]
  },
  {
    title: "Employee Handbook",
    description: "Complete guide for employees covering company policies, procedures, and expectations.",
    version: "v1.5",
    category: "hr",
    isRequired: true,
    fileName: "employee-handbook-v1.5.pdf",
    originalFileName: "Employee_Handbook_v1.5.pdf",
    filePath: "",
    fileSize: 0,
    mimeType: "application/pdf",
    status: "active",
    tags: ["hr", "handbook", "procedures"]
  },
  {
    title: "IT Acceptable Use Policy",
    description: "Guidelines for appropriate use of company IT resources, including computers, networks, and software.",
    version: "v1.3",
    category: "it",
    isRequired: true,
    fileName: "it-aup-v1.3.pdf",
    originalFileName: "IT_Acceptable_Use_Policy_v1.3.pdf",
    filePath: "",
    fileSize: 0,
    mimeType: "application/pdf",
    status: "active",
    tags: ["it", "acceptable-use", "computers"]
  },
  {
    title: "Data Protection and Privacy Policy",
    description: "Policy outlining how the company collects, uses, and protects personal data in compliance with privacy regulations.",
    version: "v1.0",
    category: "compliance",
    isRequired: true,
    fileName: "privacy-policy-v1.0.pdf",
    originalFileName: "Data_Protection_Privacy_Policy_v1.0.pdf",
    filePath: "",
    fileSize: 0,
    mimeType: "application/pdf",
    status: "active",
    tags: ["privacy", "gdpr", "data-protection"]
  },
  {
    title: "Incident Response Procedures",
    description: "Step-by-step procedures for handling security incidents and data breaches.",
    version: "v1.2",
    category: "security",
    isRequired: false,
    fileName: "incident-response-v1.2.pdf",
    originalFileName: "Incident_Response_Procedures_v1.2.pdf",
    filePath: "",
    fileSize: 0,
    mimeType: "application/pdf",
    status: "active",
    tags: ["incident-response", "security", "procedures"]
  },
  {
    title: "Remote Work Policy",
    description: "Guidelines and requirements for employees working remotely, including security and productivity expectations.",
    version: "v2.0",
    category: "hr",
    isRequired: false,
    fileName: "remote-work-v2.0.pdf",
    originalFileName: "Remote_Work_Policy_v2.0.pdf",
    filePath: "",
    fileSize: 0,
    mimeType: "application/pdf",
    status: "active",
    tags: ["remote-work", "hr", "productivity"]
  }
];

async function seedPolicies() {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB');

    // Clear existing policies
    await Policy.deleteMany({});
    console.log('✅ Cleared existing policies');

    // Create sample policy files and database entries
    const createdPolicies = [];
    
    for (const policyData of samplePolicies) {
      // Create sample PDF content
      const sampleContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
/Font <<
/F1 5 0 R
>>
>>
>>
endobj

4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
72 720 Td
(${policyData.title}) Tj
ET
endstream
endobj

5 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj

xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000204 00000 n 
0000000301 00000 n 
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
395
%%EOF`;

      // Create the file
      const filePath = createSamplePolicyFile(policyData.fileName, sampleContent);
      const stats = fs.statSync(filePath);
      
      // Update policy data with file information
      policyData.filePath = filePath;
      policyData.fileSize = stats.size;
      
      // Create policy in database
      const policy = await Policy.create(policyData);
      createdPolicies.push(policy);
    }

    console.log(`✅ Created ${createdPolicies.length} sample policies`);
    
    console.log('🎉 Policy database seeded successfully!');
    console.log('\nSample policies created:');
    createdPolicies.forEach(policy => {
      console.log(`- ${policy.title} (${policy.category}) - ${policy.version}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding policy database:', error);
    process.exit(1);
  }
}

// Run the seed function
seedPolicies();
