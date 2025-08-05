import Header from "../../components/Header/Header";
import Hero from "../../components/Hero/Hero";
import Features from "../../components/Features/Features";
import About from "../../components/About/About";
import Contact from "../../components/Contact/Contact";
import FooterNew from "../../components/Footer/Footer";

export default function Home() {
  return (
    <div className="app">
      <Header />
      <Hero />
      <Features />
      <About />
      <Contact />
      <FooterNew />
    </div>
  );
}
