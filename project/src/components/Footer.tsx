// project/src/components/Footer.tsx
import React from 'react';
import { ArrowRight, Facebook, Instagram, Twitter, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <>
      {/* Final CTA Section */}
      <section className="relative py-20 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              'url(https://images.pexels.com/photos/1658967/pexels-photo-1658967.jpeg?auto=compress&cs=tinysrgb&w=1920)',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-blue-600 opacity-90" />
        </div>

        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Start Your Journey with <span className="block text-yellow-300">Miles</span>
          </h2>

          <p className="text-xl md:text-2xl mb-8 opacity-90 leading-relaxed">
            Join thousands of travelers who've discovered authentic experiences through local
            connections
          </p>

          <button
            onClick={() =>
              document.getElementById('experiences')?.scrollIntoView({ behavior: 'smooth' })
            }
            className="bg-white text-orange-600 hover:text-orange-700 font-bold py-4 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2 mx-auto"
          >
            Explore Experiences
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="md:col-span-1">
              <h3 className="text-2xl font-bold text-orange-400 mb-4">Miles</h3>
              <p className="text-gray-400 leading-relaxed">
                Connecting travelers with authentic local experiences worldwide.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold mb-4 text-lg">Explore</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <button
                    onClick={() =>
                      document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })
                    }
                    className="hover:text-orange-400 transition-colors duration-300"
                  >
                    About Miles
                  </button>
                </li>
                <li>
                  <button
                    onClick={() =>
                      document.getElementById('experiences')?.scrollIntoView({ behavior: 'smooth' })
                    }
                    className="hover:text-orange-400 transition-colors duration-300"
                  >
                    All Tours
                  </button>
                </li>
                <li>
                  <button
                    onClick={() =>
                      document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })
                    }
                    className="hover:text-orange-400 transition-colors duration-300"
                  >
                    How It Works
                  </button>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-semibold mb-4 text-lg">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <button
                    onClick={() =>
                      document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' })
                    }
                    className="hover:text-orange-400 transition-colors duration-300"
                  >
                    FAQ
                  </button>
                </li>
                <li>
                  <button
                    onClick={() =>
                      document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
                    }
                    className="hover:text-orange-400 transition-colors duration-300"
                  >
                    Contact Us
                  </button>
                </li>
                <li>
                  <button
                    onClick={() =>
                      document.getElementById('safety')?.scrollIntoView({ behavior: 'smooth' })
                    }
                    className="hover:text-orange-400 transition-colors duration-300"
                  >
                    Safety Guidelines
                  </button>
                </li>
                <li>
                  <button
                    onClick={() =>
                      document
                        .getElementById('cancellation')
                        ?.scrollIntoView({ behavior: 'smooth' })
                    }
                    className="hover:text-orange-400 transition-colors duration-300"
                  >
                    Cancellation Policy
                  </button>
                </li>
              </ul>
            </div>

            {/* Newsletter + Social */}
            <div>
              <h4 className="font-semibold mb-4 text-lg">Stay Connected</h4>
              <p className="text-gray-400 mb-4">Get travel inspiration and exclusive offers</p>
              <div className="flex gap-2 mb-4">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-400"
                />
                <button className="bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-lg transition-colors duration-300">
                  <Mail className="w-5 h-5" />
                </button>
              </div>

              <div className="flex gap-3">
                <a
                  href="#"
                  className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-orange-500 transition-colors duration-300"
                >
                  <Facebook className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-orange-500 transition-colors duration-300"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-orange-500 transition-colors duration-300"
                >
                  <Twitter className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400">© 2025 Miles. All rights reserved.</p>
            <div className="flex gap-6 text-gray-400 text-sm">
              <a href="#" className="hover:text-orange-400 transition-colors duration-300">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-orange-400 transition-colors duration-300">
                Terms of Service
              </a>
              <a href="#" className="hover:text-orange-400 transition-colors duration-300">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
