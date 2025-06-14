import { type FC } from 'react';
import { Search, MapPin, Briefcase, Users, Code, PenTool, BarChart3, Shield, Heart, Wrench, Laptop, Building } from 'lucide-react';
import Header from '../../../components/Header2';
import Footer from '../../../components/Footer';

interface JobCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  jobCount: number;
}

interface PopularJob {
  id: number;
  title: string;
  company: string;
  location: string;
  experience: string;
  postedDays: number;
  category: string;
}

const HomePage: FC = () => {
  const jobCategories: JobCategory[] = [
    { id: '1', name: 'Technology', icon: <Code className="w-6 h-6" />, jobCount: 1245 },
    { id: '2', name: 'Design', icon: <PenTool className="w-6 h-6" />, jobCount: 432 },
    { id: '3', name: 'Marketing', icon: <BarChart3 className="w-6 h-6" />, jobCount: 867 },
    { id: '4', name: 'Finance', icon: <Building className="w-6 h-6" />, jobCount: 654 },
    { id: '5', name: 'Healthcare', icon: <Heart className="w-6 h-6" />, jobCount: 321 },
    { id: '6', name: 'Engineering', icon: <Wrench className="w-6 h-6" />, jobCount: 543 },
    { id: '7', name: 'IT Support', icon: <Laptop className="w-6 h-6" />, jobCount: 789 },
    { id: '8', name: 'Security', icon: <Shield className="w-6 h-6" />, jobCount: 234 },
  ];

  const popularJobs: PopularJob[] = [
    {
      id: 1,
      title: 'Web Developer (React.js/Next.js) MongoDB',
      company: 'CIS IT Solutions',
      location: 'Hyderabad',
      experience: '2 to 6 years',
      postedDays: 5,
      category: 'Other Haryana'
    },
    {
      id: 2,
      title: 'Web Developer (React.js/Next.js) MongoDB',
      company: 'CIS IT Solutions',
      location: 'Delhi',
      experience: '2 to 6 years',
      postedDays: 3,
      category: 'Other Haryana'
    },
    {
      id: 3,
      title: 'Web Developer (React.js/Next.js) MongoDB',
      company: 'CIS IT Solutions',
      location: 'Mumbai',
      experience: '2 to 6 years',
      postedDays: 7,
      category: 'Other Haryana'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-grow">
        <section className="bg-gradient-to-r from-blue-600 to-purple-700 py-20">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Find Your Dream Job Today
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Connect with top employers or find qualified talent
            </p>
            <div className="relative max-w-2xl mx-auto">
              <div className="flex items-center bg-white rounded-full shadow-lg overflow-hidden">
                <input
                  type="text"
                  placeholder="Search for jobs, skills, companies"
                  className="flex-1 px-6 py-4 text-gray-700 focus:outline-none text-lg"
                />
                <button className="bg-blue-600 hover:bg-blue-700 p-4 transition-colors">
                  <Search className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>
          </div>
        </section>
        <section className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="text-center bg-gray-50 rounded-2xl p-8 hover:shadow-lg transition-shadow">
                <Users className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-3">I'm a Job Seeker</h3>
                <p className="text-gray-600 mb-6">
                  Browse and apply to find jobs that match your skills and interests
                </p>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors">
                  Get Started
                </button>
              </div>
              <div className="text-center bg-gray-50 rounded-2xl p-8 hover:shadow-lg transition-shadow">
                <Briefcase className="w-16 h-16 text-purple-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-3">I'm a Recruiter</h3>
                <p className="text-gray-600 mb-6">
                  Post job ads and find qualified candidates for your company
                </p>
                <button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-medium transition-colors">
                  Get Started
                </button>
              </div>
            </div>
          </div>
        </section>
        <section className="py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-3xl font-bold text-gray-900">Popular Job Categories</h3>
              <a href="/jobs" className="text-blue-600 hover:text-blue-700 font-medium">
                View all 
              </a>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-12">
              {jobCategories.map((category) => (
                <div
                  key={category.id}
                  className="bg-white rounded-lg shadow-sm border hover:shadow-md hover:border-blue-300 transition-all cursor-pointer p-4 text-center group"
                >
                  <div className="text-blue-600 group-hover:text-blue-700 mb-3 flex justify-center">
                    {category.icon}
                  </div>
                  <h4 className="font-medium text-gray-900 text-sm mb-1">
                    {category.name}
                  </h4>
                  <p className="text-xs text-gray-500">
                    {category.jobCount.toLocaleString()} jobs
                  </p>
                </div>
              ))}
            </div>
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              {popularJobs.map((job) => (
                <div key={job.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-sm text-gray-500">May {job.postedDays}, 2024</span>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2 leading-tight">
                    {job.title}
                  </h4>
                  <p className="text-gray-600 mb-3">{job.company}</p>
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <MapPin className="w-4 h-4 mr-1" />
                    {job.location}
                  </div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm text-gray-600">{job.experience}</span>
                    <span className="text-sm text-gray-500">{job.category}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      Not Interested
                    </button>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors">
                      Apply
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;