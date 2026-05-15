require('dotenv').config();
const mongoose = require('mongoose');
const Job = require('../models/Job');
const User = require('../models/User');

const seedJobs = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const user = await User.findOne();
    if (!user) {
      console.log('No user found to post jobs. Create a user first.');
      process.exit(1);
    }

    const sampleJobs = [
      {
        title: 'Senior Software Engineer',
        company: 'TechCorp Inc.',
        postedBy: user._id,
        description: 'We are looking for an experienced Software Engineer to join our core product team.',
        requirements: '5+ years of experience with React and Node.js. Strong system design skills.',
        location: { city: 'San Francisco', state: 'CA', country: 'USA', isRemote: true },
        jobType: 'full-time',
        workplaceType: 'remote',
        experienceLevel: 'senior',
        skills: ['React', 'Node.js', 'MongoDB', 'System Design'],
        salary: { min: 130000, max: 180000, currency: 'USD', period: 'yearly' }
      },
      {
        title: 'Frontend Developer',
        company: 'Creative Web Agency',
        postedBy: user._id,
        description: 'Join our creative team to build beautiful and responsive web applications for our clients.',
        requirements: 'Experience with modern CSS, HTML5, and JavaScript. Familiarity with Vue or React.',
        location: { city: 'New York', state: 'NY', country: 'USA', isRemote: false },
        jobType: 'full-time',
        workplaceType: 'hybrid',
        experienceLevel: 'mid',
        skills: ['HTML', 'CSS', 'JavaScript', 'React'],
        salary: { min: 80000, max: 120000, currency: 'USD', period: 'yearly' }
      },
      {
        title: 'Data Analyst',
        company: 'FinTech Solutions',
        postedBy: user._id,
        description: 'Analyze financial data to help us make better business decisions.',
        requirements: 'Strong SQL skills and experience with Python or R. Degree in Statistics or related field.',
        location: { city: 'London', country: 'UK', isRemote: false },
        jobType: 'full-time',
        workplaceType: 'on-site',
        experienceLevel: 'entry',
        skills: ['SQL', 'Python', 'Data Analysis'],
        salary: { min: 50000, max: 75000, currency: 'GBP', period: 'yearly' }
      },
      {
        title: 'Summer Marketing Intern',
        company: 'BrandBoosters',
        postedBy: user._id,
        description: 'Learn the ropes of digital marketing in our fast-paced summer internship program.',
        requirements: 'Currently enrolled in a Marketing or Communications degree program.',
        location: { city: 'Austin', state: 'TX', country: 'USA', isRemote: false },
        jobType: 'internship',
        workplaceType: 'on-site',
        experienceLevel: 'entry',
        skills: ['Social Media', 'Content Creation', 'SEO'],
        salary: { min: 15, max: 20, currency: 'USD', period: 'hourly' }
      },
      {
        title: 'Freelance UI/UX Designer',
        company: 'StartupX',
        postedBy: user._id,
        description: 'We need a talented designer to help us revamp our mobile app interface on a contract basis.',
        requirements: 'Portfolio demonstrating strong mobile UI/UX design. Proficiency in Figma.',
        location: { city: 'Berlin', country: 'Germany', isRemote: true },
        jobType: 'contract',
        workplaceType: 'remote',
        experienceLevel: 'mid',
        skills: ['Figma', 'UI Design', 'UX Research', 'Mobile Design'],
        salary: { min: 50, max: 80, currency: 'EUR', period: 'hourly', isNegotiable: true }
      },
      {
        title: 'Chief Technology Officer (CTO)',
        company: 'NextGen Innovators',
        postedBy: user._id,
        description: 'Lead our engineering team and shape the technical vision of our rapidly growing startup.',
        requirements: '10+ years of software engineering experience, with at least 3 years in a leadership role.',
        location: { city: 'Boston', state: 'MA', country: 'USA', isRemote: false },
        jobType: 'full-time',
        workplaceType: 'hybrid',
        experienceLevel: 'executive',
        skills: ['Leadership', 'Architecture', 'Cloud Infrastructure', 'Agile'],
        salary: { min: 180000, max: 250000, currency: 'USD', period: 'yearly' }
      },
      {
        title: 'Part-Time Customer Support Representative',
        company: 'HelpfulCo',
        postedBy: user._id,
        description: 'Assist our customers with their inquiries via chat and email during weekend shifts.',
        requirements: 'Excellent written communication skills and a patient demeanor.',
        location: { city: 'Toronto', state: 'ON', country: 'Canada', isRemote: true },
        jobType: 'part-time',
        workplaceType: 'remote',
        experienceLevel: 'entry',
        skills: ['Customer Service', 'Zendesk', 'Communication'],
        salary: { min: 18, max: 22, currency: 'CAD', period: 'hourly' }
      },
      {
        title: 'Lead DevOps Engineer',
        company: 'CloudScale',
        postedBy: user._id,
        description: 'Architect and manage our cloud infrastructure to ensure high availability and security.',
        requirements: 'Deep knowledge of AWS, Kubernetes, and CI/CD pipelines.',
        location: { city: 'Seattle', state: 'WA', country: 'USA', isRemote: false },
        jobType: 'full-time',
        workplaceType: 'hybrid',
        experienceLevel: 'lead',
        skills: ['AWS', 'Kubernetes', 'Docker', 'Terraform', 'CI/CD'],
        salary: { min: 150000, max: 200000, currency: 'USD', period: 'yearly' }
      },
      {
        title: 'Temporary Event Coordinator',
        company: 'Global Conferences',
        postedBy: user._id,
        description: 'Help us organize and run our annual tech conference over a 3-month period.',
        requirements: 'Experience in event planning and logistics. Highly organized.',
        location: { city: 'Las Vegas', state: 'NV', country: 'USA', isRemote: false },
        jobType: 'temporary',
        workplaceType: 'on-site',
        experienceLevel: 'mid',
        skills: ['Event Planning', 'Logistics', 'Communication', 'Vendor Management'],
        salary: { min: 4000, max: 5000, currency: 'USD', period: 'monthly' }
      },
      {
        title: 'Machine Learning Engineer',
        company: 'AI Solutions',
        postedBy: user._id,
        description: 'Develop and deploy cutting-edge machine learning models for computer vision applications.',
        requirements: 'MSc or PhD in Computer Science or related field. Strong PyTorch or TensorFlow experience.',
        location: { city: 'San Jose', state: 'CA', country: 'USA', isRemote: true },
        jobType: 'full-time',
        workplaceType: 'remote',
        experienceLevel: 'senior',
        skills: ['Python', 'PyTorch', 'TensorFlow', 'Computer Vision', 'Machine Learning'],
        salary: { min: 140000, max: 190000, currency: 'USD', period: 'yearly' }
      }
    ];

    await Job.deleteMany({});
    console.log('Cleared existing jobs');

    await Job.insertMany(sampleJobs);
    console.log('Successfully seeded more diverse sample jobs');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding jobs:', error);
    process.exit(1);
  }
};

seedJobs();
