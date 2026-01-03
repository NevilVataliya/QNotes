import { useState } from 'react'
import { Container } from '../../components'
import { FaEnvelope, FaClock } from 'react-icons/fa'

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })

  const [formSubmitted, setFormSubmitted] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Here you would typically send the form data to a backend
    setFormSubmitted(true)
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setFormData({ name: '', email: '', subject: '', message: '' })
      setFormSubmitted(false)
    }, 3000)
  }

  const contactInfo = [
    {
      icon: <FaEnvelope className='w-6 h-6' />,
      title: 'Email',
      value: 'support@qnotes.in',
      description: 'We typically respond within 24 hours'
    },
    {
      icon: <FaClock className='w-6 h-6' />,
      title: 'Business Hours',
      value: 'Mon - Fri',
      description: 'We’ll respond as soon as possible'
    }
  ]

  const faqItems = [
    {
      question: 'How do I create an account?',
      answer: 'Simply click the Sign Up button in the top right corner, fill in your details, and verify your email. You\'ll be ready to start taking notes in minutes!'
    },
    {
      question: 'Is QNotes free to use?',
      answer: 'QNotes includes core features for creating and sharing notes. If pricing changes in the future, we\'ll clearly communicate it in the app.'
    },
    {
      question: 'Can I share my notes with others?',
      answer: 'Absolutely! You can make your notes public, share them with specific users, or organize them into playlists for easy sharing.'
    },
    {
      question: 'How do quizzes work?',
      answer: 'You can generate quizzes from a note\'s content to quickly check understanding and revise concepts.'
    },
    {
      question: 'Is my data secure?',
      answer: 'Yes, we use industry-standard encryption and security practices to protect your data. We never share your personal information with third parties.'
    },
    {
      question: 'Can I access QNotes on mobile?',
      answer: 'QNotes works in modern browsers and is designed to be responsive on mobile screens.'
    }
  ]

  return (
    <div className='min-h-screen bg-surface-50 dark:bg-surface-900 text-surface-900 dark:text-surface-50 transition-colors duration-200'>
      <Container>
        <div className='py-16 md:py-24'>
          <div className='max-w-4xl mx-auto text-center mb-16'>
            <h1 className='text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary-600 dark:from-primary-400 to-primary-700 dark:to-primary-300 bg-clip-text text-transparent'>
              Get in Touch
            </h1>
            <p className='text-xl text-surface-600 dark:text-surface-300 transition-colors duration-200'>
              We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>
        </div>
        <div className='py-12 grid grid-cols-1 md:grid-cols-2 gap-6'>
          {contactInfo.map((info, index) => (
            <div key={index} className='bg-white/70 dark:bg-surface-800/60 rounded-lg p-6 border border-surface-200/70 dark:border-surface-700/70 hover:border-primary-400 dark:hover:border-primary-500/50 transition-colors'>
              <div className='text-primary-600 dark:text-primary-400 mb-4 transition-colors duration-200'>{info.icon}</div>
              <h3 className='text-lg font-bold mb-2'>{info.title}</h3>
              <p className='text-surface-900 dark:text-surface-50 font-medium mb-1 transition-colors duration-200'>{info.value}</p>
              <p className='text-surface-600 dark:text-surface-300 text-sm transition-colors duration-200'>{info.description}</p>
            </div>
          ))}
        </div>
        <div className='py-12 md:py-16 border-t border-surface-200 dark:border-surface-700 transition-colors duration-200 grid grid-cols-1 lg:grid-cols-2 gap-12'>
          <div>
            <h2 className='text-3xl font-bold mb-8'>Send us a Message</h2>
            <form onSubmit={handleSubmit} className='space-y-6'>
              <div>
                <label className='block text-sm font-medium mb-2 text-surface-700 dark:text-surface-300 transition-colors duration-200'>Name</label>
                <input
                  type='text'
                  name='name'
                  value={formData.name}
                  onChange={handleInputChange}
                  className='w-full px-4 py-3 bg-white/80 dark:bg-surface-800/60 border border-surface-300 dark:border-surface-700 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none text-surface-900 dark:text-surface-50 placeholder:text-surface-500 dark:placeholder:text-surface-500 transition-colors duration-200'
                  placeholder='Your name'
                  required
                />
              </div>
              <div>
                <label className='block text-sm font-medium mb-2 text-surface-700 dark:text-surface-300 transition-colors duration-200'>Email</label>
                <input
                  type='email'
                  name='email'
                  value={formData.email}
                  onChange={handleInputChange}
                  className='w-full px-4 py-3 bg-white/80 dark:bg-surface-800/60 border border-surface-300 dark:border-surface-700 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none text-surface-900 dark:text-surface-50 placeholder:text-surface-500 dark:placeholder:text-surface-500 transition-colors duration-200'
                  placeholder='your@email.com'
                  required
                />
              </div>
              <div>
                <label className='block text-sm font-medium mb-2 text-surface-700 dark:text-surface-300 transition-colors duration-200'>Subject</label>
                <input
                  type='text'
                  name='subject'
                  value={formData.subject}
                  onChange={handleInputChange}
                  className='w-full px-4 py-3 bg-white/80 dark:bg-surface-800/60 border border-surface-300 dark:border-surface-700 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none text-surface-900 dark:text-surface-50 placeholder:text-surface-500 dark:placeholder:text-surface-500 transition-colors duration-200'
                  placeholder='How can we help?'
                  required
                />
              </div>
              <div>
                <label className='block text-sm font-medium mb-2 text-surface-700 dark:text-surface-300 transition-colors duration-200'>Message</label>
                <textarea
                  name='message'
                  value={formData.message}
                  onChange={handleInputChange}
                  rows='6'
                  className='w-full px-4 py-3 bg-white/80 dark:bg-surface-800/60 border border-surface-300 dark:border-surface-700 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none text-surface-900 dark:text-surface-50 placeholder:text-surface-500 dark:placeholder:text-surface-500 transition-colors duration-200'
                  placeholder='Your message here...'
                  required
                />
              </div>
              
              {formSubmitted ? (
                <div className='bg-brand-green/10 dark:bg-brand-green/15 border border-brand-green/20 rounded-lg p-4 text-brand-green transition-colors duration-200'>
                  ✓ Thank you! We've received your message and will get back to you soon.
                </div>
              ) : (
                <button
                  type='submit'
                  className='w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-lg transition-colors'
                >
                  Send Message
                </button>
              )}
            </form>
          </div>
          <div>
            <h2 className='text-3xl font-bold mb-8'>Frequently Asked Questions</h2>
            <div className='space-y-6'>
              {faqItems.map((item, index) => (
                <div key={index} className='bg-white/70 dark:bg-surface-800/60 rounded-lg p-6 border border-surface-200/70 dark:border-surface-700/70 transition-colors duration-200'>
                  <h3 className='text-lg font-bold text-primary-600 dark:text-primary-400 mb-3 transition-colors duration-200'>{item.question}</h3>
                  <p className='text-surface-700 dark:text-surface-300 transition-colors duration-200'>{item.answer}</p>
                </div>
              ))}
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

export default Contact
