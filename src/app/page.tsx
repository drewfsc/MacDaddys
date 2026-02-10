import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Menu from '@/components/Menu';
import About from '@/components/About';
import Gallery from '@/components/Gallery';
import InTheMedia from '@/components/InTheMedia';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <div className="diner-divider"></div>
        <Menu />
        <About />
        <Gallery />
        <InTheMedia />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
