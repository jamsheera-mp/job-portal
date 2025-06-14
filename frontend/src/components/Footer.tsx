import { type FC } from 'react';

const Footer: FC = () => {
  return (
    <footer className="bg-blue-700 text-white py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h5 className="font-semibold mb-4">Company</h5>
            <ul className="space-y-2 text-blue-100">
              <li><a href="/about" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="/careers" className="hover:text-white transition-colors">Careers</a></li>
              <li><a href="/contact" className="hover:text-white transition-colors">Contact Us</a></li>
              <li><a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="/terms" className="hover:text-white transition-colors">Terms & Conditions</a></li>
            </ul>
          </div>
          <div>
            <h5 className="font-semibold mb-4">Quick Links</h5>
            <ul className="space-y-2 text-blue-100">
              <li><a href="/about" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="/contact" className="hover:text-white transition-colors">Contact</a></li>
              <li><a href="/help" className="hover:text-white transition-colors">Help</a></li>
              <li><a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="/faq" className="hover:text-white transition-colors">FAQs</a></li>
            </ul>
          </div>
          <div>
            <h5 className="font-semibold mb-4">Contact</h5>
            <div className="text-blue-100 space-y-2">
              <p>Malappuram, Kerala</p>
              <p>+91 9876543210</p>
              <p>contact@jobconnect.com</p>
            </div>
          </div>
          <div>
            <h5 className="font-semibold mb-4">Newsletter</h5>
            <p className="text-blue-100 mb-4">Subscribe to our Newsletter</p>
            <div className="flex">
              <input
                type="email"
                placeholder="Email"
                className="flex-1 px-3 py-2 rounded-l text-gray-900 focus:outline-none"
              />
              <button className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-r transition-colors">
                →
              </button>
            </div>
          </div>
        </div>
        <div className="border-t border-blue-600 mt-8 pt-8 text-center text-blue-100">
          <p>JobConnect - All rights Reserved Designed by Jamsheera M P</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;