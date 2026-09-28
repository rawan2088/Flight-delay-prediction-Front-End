import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../Hooks/useAuth";
import Reveal from "./Reveal";

const CTA: React.FC = () => {
  const { isAuthenticated } = useAuth();
  return (
    <section className="py-28 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center">
        <Reveal>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to predict your flight?
          </h2>
        </Reveal>
        <Reveal delay={150}>
          <p className="text-xl text-gray-300 mb-10">
            Join travelers who plan smarter with FlightPredict.
          </p>
        </Reveal>
        <Reveal delay={300}>
          <Link
            to={isAuthenticated ? "/predict" : "/register"}
            className="inline-block px-10 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition-all hover:scale-105 shadow-lg shadow-blue-500/40"
          >
            {isAuthenticated ? "Predict a flight" : "Create a free account"}
          </Link>
        </Reveal>
      </div>
    </section>
  );
};

export default CTA;
