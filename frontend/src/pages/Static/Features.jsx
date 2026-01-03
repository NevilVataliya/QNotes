import { Container } from '../../components'
import { useNavigate } from 'react-router-dom'
import { 
  FaFileAlt, 
  FaShare, 
  FaQuestionCircle, 
  FaFolder, 
  FaSearch, 
  FaUsers, 
  FaMagic,
  FaCheckCircle
} from 'react-icons/fa'

function Features() {
  const navigate = useNavigate()

  const features = [
    {
      icon: <FaFileAlt className='w-8 h-8' />,
      title: 'Multi-format Content',
      description: 'Add content as audio, text, or PDFs — then turn it into structured notes you can revise from.'
    },
    {
      icon: <FaMagic className='w-8 h-8' />,
      title: 'AI Note Generation',
      description: 'Generate readable, revision-friendly notes from your content with one flow.'
    },
    {
      icon: <FaQuestionCircle className='w-8 h-8' />,
      title: 'AI-Powered Quizzes',
      description: 'Generate quizzes from each note to test understanding and strengthen recall.'
    },
    {
      icon: <FaFolder className='w-8 h-8' />,
      title: 'Organize with Playlists',
      description: 'Group related notes into curated playlists. Perfect for courses, projects, or any collection of knowledge you want to organize.'
    },
    {
      icon: <FaSearch className='w-8 h-8' />,
      title: 'Powerful Search',
      description: 'Find exactly what you\'re looking for with our advanced search capabilities. Filter by notes, users, playlists, and trending topics.'
    },
    {
      icon: <FaUsers className='w-8 h-8' />,
      title: 'Community Discovery',
      description: 'Explore a vibrant community of learners and creators. Discover amazing notes, follow users, and connect with like-minded people.'
    },
    {
      icon: <FaShare className='w-8 h-8' />,
      title: 'Sharing Controls',
      description: 'Share notes publicly, keep them private, or curate content into playlists for easy sharing.'
    },
    {
      icon: <FaFileAlt className='w-8 h-8' />,
      title: 'Markdown Support',
      description: 'Write in Markdown for cleaner, more professional note-taking. Full support for code blocks, tables, lists, and formatting.'
    }
  ]

  const benefits = [
    {
      title: 'Learn Faster',
      description: 'Use AI-generated notes to revise quickly and stay consistent across topics.',
      icon: '⚡'
    },
    {
      title: 'Share Knowledge',
      description: 'Publish what you learn so others can revise and build on your notes.',
      icon: '📚'
    },
    {
      title: 'Stay Organized',
      description: 'Keep all your notes, playlists, and resources in one centralized, easy-to-access platform.',
      icon: '📋'
    },
    {
      title: 'Check Understanding',
      description: 'Generate quizzes per note to quickly measure what you know and what to revisit.',
      icon: '🤝'
    }
  ]

  const featureComparison = [
    { name: 'Create Notes from Audio / Text / PDF', included: true },
    { name: 'Rich Text Editing', included: true },
    { name: 'Public Sharing', included: true },
    { name: 'AI Notes + AI Quizzes', included: true },
    { name: 'Playlists & Collections', included: true },
    { name: 'Advanced Search', included: true },
    { name: 'Community Discovery', included: true },
    { name: 'Markdown Support', included: true },
  ]

  return (
    <div className='min-h-screen bg-surface-50 dark:bg-surface-900 text-surface-900 dark:text-surface-50 transition-colors duration-200'>
      <Container>
        <div className='py-16 md:py-24'>
          <div className='max-w-4xl mx-auto text-center mb-16'>
            <h1 className='text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary-600 to-primary-700 dark:from-primary-400 dark:to-primary-300 bg-clip-text text-transparent'>
              Powerful Features for Effective Learning
            </h1>
            <p className='text-xl text-surface-600 dark:text-surface-300 mb-8'>
              Add content as audio, text, or PDFs, then generate revision-ready notes and quizzes.
            </p>
            <button
              onClick={() => navigate('/signup')}
              className='bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-lg font-bold transition-colors'
            >
              Get Started
            </button>
          </div>
        </div>
        <div className='py-16 border-t border-surface-200 dark:border-surface-700'>
          <h2 className='text-3xl md:text-4xl font-bold mb-12 text-center text-surface-900 dark:text-surface-50'>All Features</h2>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
            {features.map((feature, index) => (
              <div
                key={index}
                className='bg-white/70 dark:bg-surface-800/60 rounded-lg p-6 border border-surface-200/70 dark:border-surface-700/70 hover:border-primary-500/50 transition-all hover:shadow-sm'
              >
                <div className='text-white mb-4 bg-primary-600 w-12 h-12 rounded-lg flex items-center justify-center'>
                  {feature.icon}
                </div>
                <h3 className='text-lg font-bold mb-3 text-surface-900 dark:text-surface-50'>{feature.title}</h3>
                <p className='text-surface-600 dark:text-surface-300 text-sm'>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
        <div className='py-16 border-t border-surface-200 dark:border-surface-700'>
          <h2 className='text-3xl md:text-4xl font-bold mb-12 text-center text-surface-900 dark:text-surface-50'>Why QNotes?</h2>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
            {benefits.map((benefit, index) => (
              <div key={index} className='bg-white/70 dark:bg-surface-800/60 rounded-lg p-6 border border-surface-200/70 dark:border-surface-700/70'>
                <div className='text-4xl mb-4'>{benefit.icon}</div>
                <h3 className='text-xl font-bold mb-2 text-surface-900 dark:text-surface-50'>{benefit.title}</h3>
                <p className='text-surface-700 dark:text-surface-300'>{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
        <div className='py-16 border-t border-surface-200 dark:border-surface-700 space-y-12'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-8 items-center'>
            <div className='bg-white/70 dark:bg-surface-800/60 rounded-lg p-8 border border-surface-200/70 dark:border-surface-700/70'>
              <div className='text-5xl mb-4'>📝</div>
              <h3 className='text-2xl font-bold mb-3 text-surface-900 dark:text-surface-50'>Rich Text Editor</h3>
              <p className='text-surface-700 dark:text-surface-300 mb-4'>
                Our powerful editor supports everything you need:
              </p>
              <ul className='space-y-2 text-surface-700 dark:text-surface-300'>
                <li className='flex items-center space-x-2'>
                  <FaCheckCircle className='text-brand-green' />
                  <span>Bold, italic, and formatted text</span>
                </li>
                <li className='flex items-center space-x-2'>
                  <FaCheckCircle className='text-brand-green' />
                  <span>Code blocks with syntax highlighting</span>
                </li>
                <li className='flex items-center space-x-2'>
                  <FaCheckCircle className='text-brand-green' />
                  <span>Math equations and formulas</span>
                </li>
                <li className='flex items-center space-x-2'>
                  <FaCheckCircle className='text-brand-green' />
                  <span>Lists and nested formatting</span>
                </li>
              </ul>
            </div>
            <div className='bg-white/70 dark:bg-surface-800/60 rounded-lg p-8 border border-surface-200/70 dark:border-surface-700/70'>
              <p className='text-surface-700 dark:text-surface-300 leading-relaxed'>
                Write beautiful, professional notes with our intuitive editor. Whether you're documenting code, writing essays, or capturing ideas, 
                QNotes gives you all the formatting tools you need to express yourself clearly and effectively.
              </p>
            </div>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-8 items-center'>
            <div className='bg-white/70 dark:bg-surface-800/60 rounded-lg p-8 border border-surface-200/70 dark:border-surface-700/70'>
              <p className='text-surface-700 dark:text-surface-300 leading-relaxed'>
                Test your knowledge instantly with AI-powered quiz generation for each note. Use it for revision, practice, and quick self-checks.
              </p>
            </div>
            <div className='bg-white/70 dark:bg-surface-800/60 rounded-lg p-8 border border-surface-200/70 dark:border-surface-700/70'>
              <div className='text-5xl mb-4'>🧠</div>
              <h3 className='text-2xl font-bold mb-3 text-surface-900 dark:text-surface-50'>AI-Powered Quizzes</h3>
              <p className='text-surface-700 dark:text-surface-300 mb-4'>
                Intelligent quiz generation with:
              </p>
              <ul className='space-y-2 text-surface-700 dark:text-surface-300'>
                <li className='flex items-center space-x-2'>
                  <FaCheckCircle className='text-brand-green' />
                  <span>5-25 customizable questions</span>
                </li>
                <li className='flex items-center space-x-2'>
                  <FaCheckCircle className='text-brand-green' />
                  <span>Instant feedback and scoring</span>
                </li>
                <li className='flex items-center space-x-2'>
                  <FaCheckCircle className='text-brand-green' />
                  <span>AI-generated from note content</span>
                </li>
                <li className='flex items-center space-x-2'>
                  <FaCheckCircle className='text-brand-green' />
                  <span>Quick revision and recall practice</span>
                </li>
              </ul>
            </div>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-8 items-center'>
            <div className='bg-white/70 dark:bg-surface-800/60 rounded-lg p-8 border border-surface-200/70 dark:border-surface-700/70'>
              <div className='text-5xl mb-4'>🔗</div>
              <h3 className='text-2xl font-bold mb-3 text-surface-900 dark:text-surface-50'>Share & Collaborate</h3>
              <p className='text-surface-700 dark:text-surface-300 mb-4'>
                Control your sharing with:
              </p>
              <ul className='space-y-2 text-surface-700 dark:text-surface-300'>
                <li className='flex items-center space-x-2'>
                  <FaCheckCircle className='text-brand-green' />
                  <span>Make notes public to share with everyone</span>
                </li>
                <li className='flex items-center space-x-2'>
                  <FaCheckCircle className='text-brand-green' />
                  <span>Private sharing with specific users</span>
                </li>
                <li className='flex items-center space-x-2'>
                  <FaCheckCircle className='text-brand-green' />
                  <span>Organize with collaborative playlists</span>
                </li>
                <li className='flex items-center space-x-2'>
                  <FaCheckCircle className='text-brand-green' />
                  <span>Public profiles to showcase your work</span>
                </li>
              </ul>
            </div>
            <div className='bg-white/70 dark:bg-surface-800/60 rounded-lg p-8 border border-surface-200/70 dark:border-surface-700/70'>
              <p className='text-surface-700 dark:text-surface-300 leading-relaxed'>
                Share your knowledge with the world or keep it private - the choice is yours. Create playlists to curate collections of related notes, 
                making it easy for others to explore your content in organized, meaningful ways.
              </p>
            </div>
          </div>
        </div>
        <div className='py-16 border-t border-surface-200 dark:border-surface-700'>
          <h2 className='text-3xl md:text-4xl font-bold mb-12 text-center text-surface-900 dark:text-surface-50'>What You Can Do</h2>
          <div className='bg-white/70 dark:bg-surface-800/60 rounded-lg p-8 md:p-12 border border-surface-200/70 dark:border-surface-700/70'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              {featureComparison.map((feature, index) => (
                <div key={index} className='flex items-center space-x-3'>
                  <FaCheckCircle className='text-brand-green w-5 h-5 flex-shrink-0' />
                  <span className='text-surface-700 dark:text-surface-300'>{feature.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className='py-16 md:py-20 border-t border-surface-200 dark:border-surface-700'>
          <div className='bg-primary-600 rounded-xl p-8 md:p-12 text-center'>
            <h2 className='text-3xl md:text-4xl font-bold mb-4 text-white'>Ready to Experience These Features?</h2>
            <p className='text-lg text-white/80 mb-8 max-w-2xl mx-auto'>
              Add content, generate AI notes, and create a quiz to revise faster.
            </p>
            <div className='flex flex-col sm:flex-row gap-4 justify-center'>
              <button
                onClick={() => navigate('/signup')}
                className='bg-white text-primary-700 px-8 py-3 rounded-lg font-bold hover:bg-surface-100 transition-colors'
              >
                Create Account
              </button>
              <button
                onClick={() => navigate('/discover')}
                className='bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-bold hover:bg-white/10 transition-colors'
              >
                Explore Public Notes
              </button>
            </div>
          </div>
        </div>
        <div className='py-12 border-t border-surface-200 dark:border-surface-700 text-center'>
          <p className='text-surface-600 dark:text-surface-300'>
            QNotes © 2025. All rights reserved. | Empowering learners with powerful features
          </p>
        </div>
      </Container>
    </div>
  )
}

export default Features
