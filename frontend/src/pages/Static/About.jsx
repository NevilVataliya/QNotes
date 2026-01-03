import { Container } from '../../components'
import { useNavigate } from 'react-router-dom'
import { FaUsers, FaAward, FaRocket, FaLeaf } from 'react-icons/fa'

function About() {
  const navigate = useNavigate()

  const values = [
    {
      icon: <FaUsers className='w-8 h-8' />,
      title: 'Learning First',
      description: 'We build for revision: clear notes, faster recall, and better understanding.'
    },
    {
      icon: <FaAward className='w-8 h-8' />,
      title: 'Clarity',
      description: 'Structured notes and simple layouts that stay readable on every device.'
    },
    {
      icon: <FaRocket className='w-8 h-8' />,
      title: 'AI Assistance',
      description: 'Turn audio, text, and PDFs into revision-ready notes and quick quizzes.'
    },
    {
      icon: <FaLeaf className='w-8 h-8' />,
      title: 'Trust',
      description: 'Respectful defaults, responsible features, and a focus on user safety.'
    }
  ]

  return (
    <div className='min-h-screen bg-surface-50 dark:bg-surface-900 text-surface-900 dark:text-surface-50 transition-colors duration-200'>
      <Container>
        <div className='py-16 md:py-24'>
          <div className='max-w-4xl mx-auto text-center mb-16'>
            <h1 className='text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary-600 dark:from-primary-400 to-primary-700 dark:to-primary-300 bg-clip-text text-transparent'>
              About QNotes
            </h1>
            <p className='text-xl text-surface-600 dark:text-surface-300 mb-8 transition-colors duration-200'>
              QNotes helps you add content (audio, text, or PDF) and generate AI-powered notes you can revise from — with quizzes to check understanding.
            </p>
          </div>
        </div>
        <div className='py-12 md:py-16 border-t border-surface-200 dark:border-surface-700 transition-colors duration-200'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-12 items-center'>
            <div>
              <h2 className='text-3xl md:text-4xl font-bold mb-6'>Our Story</h2>
              <p className='text-surface-600 dark:text-surface-300 mb-4 leading-relaxed transition-colors duration-200'>
                QNotes started with a simple problem: most learning material arrives as audio (recording of any lecture), long text, or PDFs — but revision needs structured notes.
              </p>
              <p className='text-surface-600 dark:text-surface-300 mb-4 leading-relaxed transition-colors duration-200'>
                With QNotes, you add content in the format you already have, and AI generates notes you can quickly revise from.
                Each note can also generate a quiz so you can check what you really understand.
              </p>
              <p className='text-surface-600 dark:text-surface-300 leading-relaxed transition-colors duration-200'>
                We’re building QNotes to make studying and revision simpler, faster, and more effective — without unnecessary complexity.
              </p>
            </div>
            <div className='bg-white/70 dark:bg-surface-800/60 rounded-xl p-8 border border-surface-200/70 dark:border-surface-700/70 transition-colors duration-200'>
              <div className='text-center mb-6'>
                <div className='text-6xl mb-3'>🧠</div>
                <p className='text-surface-700 dark:text-surface-300 transition-colors duration-200'>
                  A simple flow built for revision.
                </p>
              </div>
              <div className='grid grid-cols-1 gap-3'>
                <div className='rounded-lg border border-surface-200/70 dark:border-surface-700/70 bg-white/60 dark:bg-surface-900/30 px-4 py-3 text-sm text-surface-700 dark:text-surface-300'>
                  1) Add audio / text / PDF
                </div>
                <div className='rounded-lg border border-surface-200/70 dark:border-surface-700/70 bg-white/60 dark:bg-surface-900/30 px-4 py-3 text-sm text-surface-700 dark:text-surface-300'>
                  2) Generate AI notes
                </div>
                <div className='rounded-lg border border-surface-200/70 dark:border-surface-700/70 bg-white/60 dark:bg-surface-900/30 px-4 py-3 text-sm text-surface-700 dark:text-surface-300'>
                  3) Generate a quiz to test knowledge
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className='py-12 md:py-16 border-t border-surface-200 dark:border-surface-700 transition-colors duration-200'>
          <h2 className='text-3xl md:text-4xl font-bold mb-12 text-center'>Our Core Values</h2>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
            {values.map((value, index) => (
              <div key={index} className='bg-white/70 dark:bg-surface-800/60 rounded-lg p-6 border border-surface-200/70 dark:border-surface-700/70 hover:border-primary-500/40 transition-colors'>
                <div className='text-primary-600 dark:text-primary-400 mb-4 transition-colors duration-200'>{value.icon}</div>
                <h3 className='text-xl font-bold mb-2'>{value.title}</h3>
                <p className='text-surface-600 dark:text-surface-300 transition-colors duration-200'>{value.description}</p>
              </div>
            ))}
          </div>
        </div>
        <div className='py-12 md:py-16 border-t border-surface-200 dark:border-surface-700 transition-colors duration-200'>
          <h2 className='text-3xl md:text-4xl font-bold mb-12 text-center'>Why Choose QNotes?</h2>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            <div className='bg-white/70 dark:bg-surface-800/60 rounded-lg p-6 border border-surface-200/70 dark:border-surface-700/70 transition-colors duration-200'>
              <h3 className='text-xl font-bold mb-3 text-primary-700 dark:text-primary-300'>Multi-format input</h3>
              <p className='text-surface-700 dark:text-surface-300 transition-colors duration-200'>
                Start from the content you already have — audio, text, or PDFs.
              </p>
            </div>
            <div className='bg-white/70 dark:bg-surface-800/60 rounded-lg p-6 border border-surface-200/70 dark:border-surface-700/70 transition-colors duration-200'>
              <h3 className='text-xl font-bold mb-3 text-primary-700 dark:text-primary-300'>Built for revision</h3>
              <p className='text-surface-700 dark:text-surface-300 transition-colors duration-200'>
                AI generates structured notes so you can review concepts quickly and consistently.
              </p>
            </div>
            <div className='bg-white/70 dark:bg-surface-800/60 rounded-lg p-6 border border-surface-200/70 dark:border-surface-700/70 transition-colors duration-200'>
              <h3 className='text-xl font-bold mb-3 text-primary-700 dark:text-primary-300'>Quizzes per note</h3>
              <p className='text-surface-700 dark:text-surface-300 transition-colors duration-200'>
                Generate quizzes from each note to check knowledge and reinforce learning.
              </p>
            </div>
          </div>
        </div>
        <div className='py-16 md:py-20 border-t border-surface-200 dark:border-surface-700 transition-colors duration-200'>
          <div className='bg-primary-600 rounded-xl p-8 md:p-12 text-center'>
            <h2 className='text-3xl md:text-4xl font-bold mb-4 text-white'>Ready to create your first AI note?</h2>
            <p className='text-lg text-white/80 mb-8 max-w-2xl mx-auto'>
              Add audio, text, or a PDF — then generate notes and a quiz for revision.
            </p>
            <div className='flex flex-col sm:flex-row gap-4 justify-center'>
              <button
                onClick={() => navigate('/signup')}
                className='bg-white text-primary-700 px-8 py-3 rounded-lg font-bold hover:bg-surface-100 transition-colors'
              >
                Get started
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
        <div className='py-12 border-t border-surface-200 dark:border-surface-700 text-center transition-colors duration-200'>
          <p className='text-surface-600 dark:text-surface-300 transition-colors duration-200'>
            QNotes © 2025. All rights reserved.
          </p>
        </div>
      </Container>
    </div>
  )
}

export default About
