import { useState } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Preloader from './components/Preloader'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import WhoWeAre from './components/WhoWeAre'
import SectionDivider from './components/SectionDivider'
import OurIntimate from './components/OurIntimate'
import AboutUs from './components/AboutUs'
import ParallaxDivider from './components/ParallaxDivider'
import Music from './components/Music'
import CallToAction from './components/CallToAction'
import Footer from './components/Footer'
import Gallery from './pages/Gallery'
import YupiCoklat from './pages/YupiCoklat'
import NataGoricx from './pages/NataGoricx'

const pageTransition = {
  duration: 0.8,
  ease: [0.32, 0.72, 0, 1] as [number, number, number, number],
}

function HomePage() {
  return (
    <motion.div
      initial={{ x: '-100%' }}
      animate={{ x: 0 }}
      exit={{ x: '-100%' }}
      transition={pageTransition}
      className="bg-dark min-h-screen"
    >
      <Navbar />
      <Hero />
      <WhoWeAre />
      <SectionDivider
        icon="♥"
        text="Our moments together"
      />
      <OurIntimate />
      <SectionDivider
        icon="✦"
        text="The story continues"
      />
      <AboutUs />
      <ParallaxDivider />
      <Music />
      <CallToAction />
      <Footer />
    </motion.div>
  )
}

function App() {
  const location = useLocation()
  const [loaded, setLoaded] = useState(false)

  return (
    <>
      {!loaded && <Preloader onComplete={() => setLoaded(true)} />}
      {loaded && (
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<HomePage />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/yupi-coklat" element={<YupiCoklat />} />
            <Route path="/nata-goricx" element={<NataGoricx />} />
          </Routes>
        </AnimatePresence>
      )}
    </>
  )
}

export default App
