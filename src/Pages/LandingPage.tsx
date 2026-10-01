import React from "react";
// import StarField from "../Components/StarField";
import Hero from "../Components/Hero";
import Features from "../Components/Features";
import CTA from "../Components/CTA";

// One shared night sky behind every section; sections themselves are transparent.
const LandingPage: React.FC = () => (
  // <div className="relative">
  //   <StarField />
  <div className="relative z-10">
    <Hero />
    <Features />
    <CTA />
  </div>
  // </div>
);

export default LandingPage;
