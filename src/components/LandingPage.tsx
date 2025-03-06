import React, { useState } from 'react'
import { Auth } from './Auth'
import {
  RocketLaunchIcon,
  SparklesIcon,
  FireIcon,
  BeakerIcon,
  ArrowPathIcon,
  TagIcon,
} from '@heroicons/react/24/outline'

export const LandingPage = () => {
  const [showAuth, setShowAuth] = useState(false)

  const features = [
    {
      icon: <SparklesIcon className="w-6 h-6" />,
      title: "Anti-Productivity™",
      description: "Because real rebels don't follow someone else's system. Create your own chaos, organized your way."
    },
    {
      icon: <FireIcon className="w-6 h-6" />,
      title: "Mission Control",
      description: "Transform boring tasks into epic missions. Side quests included, procrastination optional."
    },
    {
      icon: <BeakerIcon className="w-6 h-6" />,
      title: "Task Alchemy",
      description: "Turn your daily grind into digital gold with tags, priorities, and recurring missions that actually make sense."
    },
    {
      icon: <ArrowPathIcon className="w-6 h-6" />,
      title: "Time Bending",
      description: "Deadlines? More like guidelines. Flexible recurring missions that adapt to your chaotic schedule."
    },
    {
      icon: <TagIcon className="w-6 h-6" />,
      title: "Rebel Tags",
      description: "Categorize your missions however you want. We won't judge if you tag everything as 'Later™'."
    },
    {
      icon: <RocketLaunchIcon className="w-6 h-6" />,
      title: "Mission Objectives",
      description: "Break down big missions into smaller rebellions. Because even rebels need a plan sometimes."
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-dark-950 to-dark-900">
      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-20 pb-16 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          <span className="logo-gradient logo-glow inline-block">Task</span>
          <span className="logo-gradient logo-glow inline-block">Rebel</span>
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto">
          The anti-todo list for rebels who get shit done.
          <br />
          <span className="text-gray-400">No productivity porn. Just results.</span>
        </p>
        <button
          onClick={() => setShowAuth(true)}
          className="bg-rebel-red hover:bg-rebel-red-light text-white text-lg px-8 py-4 rounded-lg shadow-lg 
                   hover:shadow-rebel-red/20 hover:transform hover:-translate-y-1 transition-all duration-300"
        >
          Join the Rebellion
        </button>
        
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="bg-dark-800/50 backdrop-blur-sm rounded-lg p-6 border border-dark-700">
            <div className="text-2xl mb-2">🚀</div>
            <h3 className="text-rebel-red font-semibold mb-2">Deploy Missions</h3>
            <p className="text-gray-300">Not tasks. Because saving the world starts with better terminology.</p>
          </div>
          <div className="bg-dark-800/50 backdrop-blur-sm rounded-lg p-6 border border-dark-700">
            <div className="text-2xl mb-2">⚡️</div>
            <h3 className="text-rebel-red font-semibold mb-2">Hack the System</h3>
            <p className="text-gray-300">Customize everything. Break the rules. Make productivity work for you.</p>
          </div>
          <div className="bg-dark-800/50 backdrop-blur-sm rounded-lg p-6 border border-dark-700">
            <div className="text-2xl mb-2">💥</div>
            <h3 className="text-rebel-red font-semibold mb-2">Get Shit Done</h3>
            <p className="text-gray-300">No methodology. No guru BS. Just you, crushing your missions.</p>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-dark-900/50 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-12 text-center">
            Productivity Tools for the Rest of Us
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-dark-800/30 rounded-lg p-6 border border-dark-700 
                         hover:border-rebel-red/50 transition-all duration-300
                         hover:transform hover:-translate-y-1"
              >
                <div className="text-rebel-red mb-4">{feature.icon}</div>
                <h3 className="text-white font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="bg-gradient-to-r from-rebel-red/10 to-rebel-red-light/10 
                      rounded-lg p-8 md:p-12 backdrop-blur-sm border border-dark-700">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">
            Ready to Overthrow Your Todo List?
          </h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of rebels who've ditched traditional productivity tools for something that actually works.
          </p>
          <button
            onClick={() => setShowAuth(true)}
            className="bg-rebel-red hover:bg-rebel-red-light text-white text-lg px-8 py-4 rounded-lg shadow-lg 
                     hover:shadow-rebel-red/20 hover:transform hover:-translate-y-1 transition-all duration-300"
          >
            Start Your Revolution
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-dark-800 py-8">
        <div className="container mx-auto px-4 text-center text-gray-500">
          <p>Built by rebels, for rebels. No productivity experts were consulted in the making of this app.</p>
        </div>
      </footer>

      {/* Auth Modal */}
      {showAuth && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="relative w-full max-w-md">
            <button
              onClick={() => setShowAuth(false)}
              className="absolute top-4 right-4 text-dark-400 hover:text-white"
            >
              ×
            </button>
            <Auth />
          </div>
        </div>
      )}
    </div>
  )
} 